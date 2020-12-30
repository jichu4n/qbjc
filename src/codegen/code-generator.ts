import _ from 'lodash';
import {SourceNode} from 'source-map';
import {FnDefType, isArray, isUdt} from '../lib/types';
import {
  AssignStmt,
  AstNodeBase,
  AstVisitor,
  BinaryOp,
  BinaryOpExpr,
  CallStmt,
  CaseBranch,
  CaseExprType,
  CondLoopStmt,
  CondLoopStructure,
  ConstStmt,
  DataStmt,
  DefTypeStmt,
  DimStmt,
  ElementaryTypeSpecExpr,
  ElseBranch,
  EndStmt,
  ExitForStmt,
  ExitLoopStmt,
  ExitProcStmt,
  Expr,
  ExprType,
  FnCallExpr,
  ForStmt,
  GosubStmt,
  GotoStmt,
  IfBranch,
  IfStmt,
  InputStmt,
  InputType,
  LabelStmt,
  LiteralExpr,
  MemberExpr,
  Module,
  NextStmt,
  NopStmt,
  PrintStmt,
  Proc,
  ReturnStmt,
  SelectStmt,
  Stmts,
  SubscriptExpr,
  SwapStmt,
  TypeSpecExprType,
  UnaryOp,
  UnaryOpExpr,
  UncondLoopStmt,
  VarRefExpr,
} from '../lib/ast';
import {VarScope, VarSymbol, VarType} from '../lib/symbol-table';
import {ExecutionDirectiveType, PrintArgType} from '../runtime/compiled-code';
// Generated by src/tools/build-runtime-bundle.ts at build time.
const nodeRuntimeBundleCode = require('../runtime/node-runtime-bundle')
  .default as string;

/** Default indentation per level. */
const DEFAULT_INDENT_WIDTH = 4;

type SourceChunk = string | SourceNode | Array<string | SourceNode>;
type SourceChunks = Array<SourceChunk>;

/** Temporary state for an open for loop during the codegen process. */
interface ForStmtState {
  forStmt: ForStmt;
  startLabel: string;
  endLabel: string;
  stepValue: string;
  endValue: string;
}

/** Temporary state for an open conditional / unconditional loop during the codegen process. */
interface LoopStmtState {
  loopStmt: CondLoopStmt | UncondLoopStmt;
  endLabel: string;
}

export interface CodeGeneratorOpts {
  sourceFileName?: string;
  indentWidth?: number;
  enableBundling?: boolean;
}

const BINARY_OP_MAP: {[key: string]: string} = {
  [BinaryOp.ADD]: '+',
  [BinaryOp.SUB]: '-',
  [BinaryOp.MUL]: '*',
  [BinaryOp.DIV]: '/',
  [BinaryOp.MOD]: '%',
  [BinaryOp.AND]: '&&',
  [BinaryOp.OR]: '||',
  [BinaryOp.EQ]: '===',
  [BinaryOp.NE]: '!=',
  [BinaryOp.GT]: '>',
  [BinaryOp.GTE]: '>=',
  [BinaryOp.LT]: '<',
  [BinaryOp.LTE]: '<=',
};

/** Code generation pass.
 *
 * Depends on semantic analysis info in the AST.
 */
export default class CodeGenerator extends AstVisitor<SourceNode> {
  constructor(private readonly module: Module, opts: CodeGeneratorOpts = {}) {
    super();
    this.opts = {
      sourceFileName: '',
      indentWidth: DEFAULT_INDENT_WIDTH,
      enableBundling: false,
      ...opts,
    };
    this.sourceFileName = this.opts.sourceFileName;
  }

  run() {
    const compiledModuleSourceNode = this.visitModule(this.module);
    return this.bundle(compiledModuleSourceNode).toStringWithSourceMap();
  }

  private bundle(compiledModuleSourceNode: SourceNode) {
    const sourceNode = new SourceNode();
    if (this.opts.enableBundling) {
      sourceNode.add('#!/usr/bin/env node\n\n');
      sourceNode.add(compiledModuleSourceNode);
      sourceNode.add(nodeRuntimeBundleCode);
    } else {
      sourceNode.add(compiledModuleSourceNode);
      sourceNode.add('module.exports = { default: compiledModule };\n');
    }
    return sourceNode;
  }

  visitModule(module: Module): SourceNode {
    this.indent = 0;
    this.currentProc = null;

    const chunks: SourceChunks = [];
    chunks.push(
      this.lines(
        'const compiledModule = {',
        +1,
        `sourceFileName: ${JSON.stringify(this.opts.sourceFileName)},`,
        `localSymbols: ${JSON.stringify(module.localSymbols)},`,
        `globalSymbols: ${JSON.stringify(module.globalSymbols)},`,
        ''
      )
    );

    chunks.push(
      this.lines('stmts: [', '', +1),
      this.visitStmts(module.stmts),
      this.lines(-1, '],', '')
    );

    chunks.push(
      this.lines('procs: [', '', +1),
      this.acceptAll(module.procs),
      this.lines(-1, '],', '')
    );

    chunks.push(this.lines(-1, '};', ''));

    return new SourceNode(
      null,
      null,
      this.opts.sourceFileName,
      _.flattenDeep(chunks)
    );
  }

  visitProc(node: Proc): SourceNode {
    this.currentProc = node;
    const chunks: SourceChunks = [];

    chunks.push(
      this.lines(
        '{',
        +1,
        this.generateLoc(node),
        `type: '${node.type}',`,
        `name: '${node.name}',`,
        `localSymbols: ${JSON.stringify(node.localSymbols)},`,
        `paramSymbols: ${JSON.stringify(node.paramSymbols)},`,
        'stmts: [',
        '',
        +1
      ),
      this.visitStmts(node.stmts),
      this.lines(-1, '],', -1, '},', '')
    );

    this.currentProc = null;
    return this.createSourceNode(node, ...chunks);
  }

  private visitStmts(stmts: Stmts) {
    const origOpenForStmtStatesLength = this.openForStmtStates.length;
    const sourceNodes = this.acceptAll(stmts);
    if (this.openForStmtStates.length > origOpenForStmtStatesLength) {
      this.throwError(
        'FOR statement without corresponding NEXT statement',
        this.openForStmtStates[this.openForStmtStates.length - 1].forStmt
      );
    }
    return sourceNodes;
  }

  visitLabelStmt(node: LabelStmt): SourceNode {
    return this.createSourceNode(
      node,
      this.generateLabelStmt(node, node.label)
    );
  }

  visitDimStmt(node: DimStmt): SourceNode {
    const chunks: SourceChunks = [];
    for (const varDecl of node.varDecls) {
      const {typeSpecExpr} = varDecl;
      const {typeSpec} = varDecl.symbol!;
      switch (typeSpecExpr.type) {
        case TypeSpecExprType.ARRAY:
          if (!isArray(typeSpec)) {
            this.throwError(
              `Mismatch types: expected array, got ${typeSpec.type}`,
              varDecl
            );
          }
          chunks.push(
            this.generateVarRefCode(varDecl, varDecl.symbol!),
            '.init(',
            JSON.stringify(typeSpec.elementTypeSpec),
            ', [',
            ...typeSpecExpr.dimensionSpecExprs.map(
              ({minIdxExpr, maxIdxExpr}) => [
                '[',
                minIdxExpr ? this.accept(minIdxExpr) : '0',
                ', ',
                this.accept(maxIdxExpr),
                '],',
              ]
            ),
            ']); '
          );
          break;
        default:
          break;
      }
    }
    if (chunks.length > 0) {
      return this.createStmtSourceNode(node, () => chunks);
    } else {
      return new SourceNode();
    }
  }

  visitAssignStmt(node: AssignStmt): SourceNode {
    return this.createStmtSourceNode(node, () => {
      const typeSpec = node.targetExpr.typeSpec!;
      return [
        this.accept(node.targetExpr),
        ' = ',
        this.accept(node.valueExpr),
        isUdt(typeSpec) ? '.clone()' : '',
        ';',
      ];
    });
  }

  visitConstStmt(node: ConstStmt): SourceNode {
    return this.createStmtSourceNode(node, () => [
      ..._.flatMap(node.constDefs, (constDef) => [
        `${this.generateVarRefCode(constDef, constDef.symbol!)} = `,
        this.accept(constDef.valueExpr),
        '; ',
      ]),
    ]);
  }

  visitGotoStmt(node: GotoStmt): SourceNode {
    return this.createStmtSourceNode(node, () =>
      this.generateGotoCode(node.destLabel)
    );
  }

  visitIfStmt(node: IfStmt): SourceNode {
    return this.visitCondStmt(
      node,
      this.generateLabel(),
      (ifBranch: IfBranch) => this.accept(ifBranch.condExpr)
    );
  }

  visitSelectStmt(node: SelectStmt): SourceNode {
    const labelPrefix = this.generateLabel();
    const testValue = this.generateTempVarRef(`${labelPrefix}_test`);

    return this.createSourceNode(
      node,
      this.createStmtSourceNode(node, () => [
        `${testValue} = `,
        this.accept(node.testExpr),
        ';',
      ]),
      this.visitCondStmt(node, labelPrefix, (caseBranch: CaseBranch) => {
        const chunks: SourceChunk = [];
        for (let i = 0; i < caseBranch.condExprs.length; ++i) {
          const condExpr = caseBranch.condExprs[i];
          if (i > 0) {
            chunks.push(' || ');
          }
          switch (condExpr.type) {
            case CaseExprType.VALUE:
              chunks.push(`${testValue} === `, this.accept(condExpr.valueExpr));
              break;
            case CaseExprType.RANGE:
              chunks.push(
                `(${testValue} >= `,
                this.accept(condExpr.lowerBoundExpr),
                ` && ${testValue} <= `,
                this.accept(condExpr.upperBoundExpr),
                ')'
              );
              break;
            case CaseExprType.COMP:
              chunks.push(
                `${testValue} ${BINARY_OP_MAP[condExpr.op]} `,
                this.accept(condExpr.rightExpr)
              );
              break;
            default:
              this.throwError(
                `Unknown case expression type: ${JSON.stringify(condExpr)}`,
                node
              );
          }
        }
        return chunks;
      }),
      this.createStmtSourceNode(node, () => `delete ${testValue};`)
    );
  }

  private visitCondStmt<IfBranchT extends AstNodeBase & {stmts: Stmts}>(
    node: AstNodeBase & {
      ifBranches: Array<IfBranchT>;
      elseBranch: ElseBranch | null;
    },
    labelPrefix: string,
    generateCondExprCode: (ifBranch: IfBranchT) => SourceChunk
  ): SourceNode {
    // Generate labels for each "elseif" branch, the else branch, and the "end if".
    const branchLabels: Array<{
      node: IfBranchT | ElseBranch | null;
      label: string;
    }> = [];
    for (let i = 1; i < node.ifBranches.length; ++i) {
      branchLabels.push({
        node: node.ifBranches[i],
        label: `${labelPrefix}_elif${i}`,
      });
    }
    if (node.elseBranch && node.elseBranch.stmts.length > 0) {
      branchLabels.push({
        node: node.elseBranch,
        label: `${labelPrefix}_else`,
      });
    }
    const endIfLabel = `${labelPrefix}_endif`;
    branchLabels.push({node: null, label: endIfLabel});

    const chunks: SourceChunks = [];
    let nextBranchLabelIdx = 0;

    // Generate code for "if" and "elseif" branches.
    for (const ifBranch of node.ifBranches) {
      const {node: nextBranchNode, label: nextBranchLabel} = branchLabels[
        nextBranchLabelIdx
      ];
      chunks.push(
        this.createStmtSourceNode(ifBranch, () =>
          _.flattenDeep([
            'if (!(',
            generateCondExprCode(ifBranch),
            `)) { ${this.generateGotoCode(nextBranchLabel)} }`,
          ])
        )
      );
      ++this.indent;
      chunks.push(this.visitStmts(ifBranch.stmts));
      if (nextBranchLabelIdx < branchLabels.length - 1) {
        chunks.push(
          this.createStmtSourceNode(ifBranch, () =>
            this.generateGotoCode(endIfLabel)
          )
        );
      }
      --this.indent;
      chunks.push(this.generateLabelStmt(nextBranchNode, nextBranchLabel));
      ++nextBranchLabelIdx;
    }

    // Generate code for "else" branch.
    if (node.elseBranch && node.elseBranch.stmts.length > 0) {
      ++this.indent;
      chunks.push(this.visitStmts(node.elseBranch.stmts));
      --this.indent;
      chunks.push(this.generateLabelStmt(null, endIfLabel));
    }

    return this.createSourceNode(node, ...chunks);
  }

  visitCondLoopStmt(node: CondLoopStmt): SourceNode {
    const labelPrefix = this.generateLabel();
    const loopStartLabel = `${labelPrefix}_loopStart`;
    const loopEndLabel = `${labelPrefix}_loopEnd`;

    const cond = node.isCondNegated
      ? [this.accept(node.condExpr)]
      : ['!(', this.accept(node.condExpr), ')'];
    const condStmt = this.createStmtSourceNode(node, () => [
      'if (',
      ...cond,
      `) { ${this.generateGotoCode(loopEndLabel)} }`,
    ]);
    ++this.indent;
    this.openLoopStmtStates.push({
      loopStmt: node,
      endLabel: loopEndLabel,
    });
    const stmts = this.visitStmts(node.stmts);
    this.openLoopStmtStates.pop();
    --this.indent;

    const chunks: SourceChunks = [];
    chunks.push(this.generateLabelStmt(node, loopStartLabel));
    switch (node.structure) {
      case CondLoopStructure.COND_EXPR_BEFORE_STMTS:
        chunks.push(condStmt, stmts);
        break;
      case CondLoopStructure.COND_EXPR_AFTER_STMTS:
        chunks.push(stmts, condStmt);
        break;
      default:
        this.throwError(
          `Unexpected loop structure: ${JSON.stringify(node)}`,
          node
        );
    }
    chunks.push(
      this.createStmtSourceNode(node, () =>
        this.generateGotoCode(loopStartLabel)
      ),
      this.generateLabelStmt(node, loopEndLabel)
    );

    return this.createSourceNode(node, ...chunks);
  }

  visitUncondLoopStmt(node: UncondLoopStmt): SourceNode {
    const labelPrefix = this.generateLabel();
    const loopStartLabel = `${labelPrefix}_loopStart`;
    const loopEndLabel = `${labelPrefix}_loopEnd`;

    const chunks: SourceChunks = [];
    chunks.push(this.generateLabelStmt(node, loopStartLabel));
    ++this.indent;
    this.openLoopStmtStates.push({
      loopStmt: node,
      endLabel: loopEndLabel,
    });
    chunks.push(this.visitStmts(node.stmts));
    this.openLoopStmtStates.pop();
    --this.indent;
    chunks.push(
      this.createStmtSourceNode(node, () =>
        this.generateGotoCode(loopStartLabel)
      ),
      this.generateLabelStmt(node, loopEndLabel)
    );

    return this.createSourceNode(node, ...chunks);
  }

  visitExitLoopStmt(node: ExitLoopStmt): SourceNode {
    if (this.openLoopStmtStates.length === 0) {
      this.throwError(`EXIT DO statement outside DO loop`, node);
    }
    return this.createStmtSourceNode(node, () =>
      this.generateGotoCode(
        this.openLoopStmtStates[this.openLoopStmtStates.length - 1].endLabel
      )
    );
  }

  visitForStmt(node: ForStmt): SourceNode {
    const labelPrefix = this.generateLabel();
    const startLabel = `${labelPrefix}_loopStart`;
    const endLabel = `${labelPrefix}_loopEnd`;
    const stepValue = this.generateTempVarRef(`${labelPrefix}_step`);
    const endValue = this.generateTempVarRef(`${labelPrefix}_end`);

    this.openForStmtStates.push({
      forStmt: node,
      startLabel,
      endLabel,
      stepValue,
      endValue,
    });

    const chunks: SourceChunks = [];
    chunks.push(
      this.createStmtSourceNode(node, () => [
        // Set counter = start
        ...[
          this.accept(node.counterExpr),
          ' = ',
          this.accept(node.startExpr),
          '; ',
        ],
        // Set stepValue = evaluate(stepExpr)
        ...[
          `${stepValue} = `,
          node.stepExpr ? this.accept(node.stepExpr) : '1',
          '; ',
        ],
        // Set endValue = evaluate(endExpr)
        ...[`${endValue} = `, this.accept(node.endExpr), ';'],
      ]),
      this.generateLabelStmt(node, startLabel)
    );
    ++this.indent;
    chunks.push(
      this.createStmtSourceNode(node, () => [
        ...[`const counterValue = `, this.accept(node.counterExpr), '; '],
        ...[
          'if (',
          `(${stepValue} >= 0 && counterValue > ${endValue}) || `,
          `(${stepValue} < 0 && counterValue < ${endValue})`,
          `) { ${this.generateGotoCode(endLabel)} }`,
        ],
      ])
    );
    return this.createSourceNode(node, ...chunks);
  }

  visitNextStmt(node: NextStmt): SourceNode {
    // Determine how many open FOR statements this NEXT statement will close.
    const numForStmtStatesToClose = node.counterExprs.length || 1;
    if (numForStmtStatesToClose > this.openForStmtStates.length) {
      this.throwError(
        `NEXT statement without corresponding FOR statement`,
        node
      );
    }
    // Verify that the counter expressions match the corresponding FOR statements.
    for (let i = 0; i < node.counterExprs.length; ++i) {
      const nextCounterExprString = this.accept(
        node.counterExprs[i]
      ).toString();
      const {forStmt} = this.openForStmtStates[
        this.openForStmtStates.length - 1 - i
      ];
      const forStmtCounterExprString = this.accept(
        forStmt.counterExpr
      ).toString();
      if (nextCounterExprString !== forStmtCounterExprString) {
        this.throwError(
          `Counter #${i + 1} does not match corresponding FOR statement`,
          node
        );
      }
    }

    // Generate code.
    const chunks: SourceChunks = [];
    for (let i = 0; i < numForStmtStatesToClose; ++i) {
      const {
        forStmt,
        startLabel,
        endLabel,
        stepValue,
        endValue,
      } = this.openForStmtStates.pop()!;
      chunks.push(
        this.createStmtSourceNode(node, () => [
          this.accept(forStmt.counterExpr),
          ` += ${stepValue}; `,
          this.generateGotoCode(startLabel),
        ])
      );
      --this.indent;
      chunks.push(this.generateLabelStmt(forStmt, endLabel));
      chunks.push(
        this.createStmtSourceNode(
          forStmt,
          () => `delete ${stepValue}; delete ${endValue};`
        )
      );
    }
    return this.createSourceNode(node, ...chunks);
  }

  visitExitForStmt(node: ExitForStmt): SourceNode {
    if (this.openForStmtStates.length === 0) {
      this.throwError(`EXIT FOR statement outside FOR loop`, node);
    }
    return this.createStmtSourceNode(node, () =>
      this.generateGotoCode(
        this.openForStmtStates[this.openForStmtStates.length - 1].endLabel
      )
    );
  }

  visitGosubStmt(node: GosubStmt): SourceNode {
    return this.createStmtSourceNode(
      node,
      () =>
        `return { type: '${ExecutionDirectiveType.GOSUB}', destLabel: '${node.destLabel}' };`
    );
  }

  visitReturnStmt(node: ReturnStmt): SourceNode {
    return this.createStmtSourceNode(
      node,
      () =>
        `return { type: '${ExecutionDirectiveType.RETURN}'${
          node.destLabel ? `, destLabel: '${node.destLabel}'` : ''
        } };`
    );
  }

  visitCallStmt(node: CallStmt): SourceNode {
    return this.createStmtSourceNode(node, () => [
      this.visitProcCall(node),
      ';',
    ]);
  }

  visitExitProcStmt(node: ExitProcStmt): SourceNode {
    return this.createStmtSourceNode(
      node,
      () => `return { type: '${ExecutionDirectiveType.EXIT_PROC}' };`
    );
  }

  visitEndStmt(node: EndStmt): SourceNode {
    return this.createStmtSourceNode(
      node,
      () => `return { type: '${ExecutionDirectiveType.END}' };`
    );
  }

  visitSwapStmt(node: SwapStmt): SourceNode {
    const tempVarName = `${this.generateLabel()}_temp`;
    return this.createStmtSourceNode(node, () => [
      this.generateTempVarRef(tempVarName),
      ' = ',
      this.accept(node.leftExpr),
      '; ',
      this.accept(node.leftExpr),
      ' = ',
      this.accept(node.rightExpr),
      '; ',
      this.accept(node.rightExpr),
      ' = ',
      this.generateTempVarRef(tempVarName),
      '; ',
      'delete ',
      this.generateTempVarRef(tempVarName),
      ';',
    ]);
  }

  visitPrintStmt(node: PrintStmt): SourceNode {
    return this.createStmtSourceNode(node, () => [
      'ctx.runtime.print(',
      node.formatExpr ? this.accept(node.formatExpr) : 'null',
      ', ',
      ...node.args.map((arg) =>
        typeof arg === 'string'
          ? `{ type: '${arg}' }, `
          : this.createSourceNode(
              arg,
              `{ type: '${PrintArgType.VALUE}', value: `,
              this.accept(arg),
              ' }, '
            )
      ),
      ');',
    ]);
  }

  visitInputStmt(node: InputStmt): SourceNode {
    return this.createStmtSourceNode(node, () => {
      switch (node.inputType) {
        case InputType.TOKENIZED:
          return [
            'const results = await ctx.runtime.input(',
            `${JSON.stringify(node.prompt)}, `,
            node.targetExprs
              .map((expr) => JSON.stringify(expr.typeSpec!))
              .join(', '),
            '); ',
            ...node.targetExprs.map((expr, i) =>
              this.createSourceNode(
                expr,
                this.accept(expr),
                ` = results[${i}]; `
              )
            ),
          ];
        case InputType.LINE:
          return this.createSourceNode(
            node.targetExprs[0],
            this.accept(node.targetExprs[0]),
            ` = await ctx.runtime.inputLine(${JSON.stringify(node.prompt)});`
          );
        default:
          this.throwError(
            `Unknown input type: ${JSON.stringify(node.inputType)}`,
            node
          );
      }
    });
  }

  visitDefTypeStmt(node: DefTypeStmt): SourceNode {
    return new SourceNode();
  }

  visitNopStmt(node: NopStmt): SourceNode {
    const {exprs} = node;
    return exprs
      ? this.createStmtSourceNode(node, () =>
          exprs.map((expr) => [this.accept(expr), '; '])
        )
      : new SourceNode();
  }

  visitDataStmt(node: DataStmt): SourceNode {
    return this.createSourceNode(
      node,
      this.lines(
        '{',
        +1,
        this.generateLoc(node),
        `data: ${JSON.stringify(node.data)},`,
        -1,
        `},`,
        ''
      )
    );
  }

  private createStmtSourceNode<T extends AstNodeBase>(
    node: T,
    generateRunCode: () => SourceChunk | SourceChunks
  ) {
    return this.createSourceNode(
      node,
      this.lines('{', +1, ''),
      this.lines(this.generateLoc(node), ''),
      this.lines('async run(ctx) { '),
      generateRunCode(),
      ' },\n',
      this.lines(-1, '},', '')
    );
  }

  visitLiteralExpr(node: LiteralExpr): SourceNode {
    let valueString: string;
    if (typeof node.value === 'string') {
      valueString = JSON.stringify(node.value);
    } else if (typeof node.value === 'number') {
      valueString = `${node.value}`;
    } else {
      this.throwError(
        `Unrecognized literal value: ${JSON.stringify(node.value)}`,
        node
      );
    }
    return this.createSourceNode(node, valueString);
  }

  visitVarRefExpr(node: VarRefExpr): SourceNode {
    return this.createSourceNode(
      node,
      this.generateVarRefCode(node, node.symbol!)
    );
  }

  visitFnCallExpr(node: FnCallExpr): SourceNode {
    return this.visitProcCall(node);
  }

  visitBinaryOpExpr(node: BinaryOpExpr): SourceNode {
    let chunks: Array<SourceNode | string> = [];
    switch (node.op) {
      case BinaryOp.EXP:
        chunks.push(
          'Math.pow(',
          this.accept(node.leftExpr),
          ', ',
          this.accept(node.rightExpr),
          ')'
        );
        break;
      case BinaryOp.INTDIV:
        chunks.push(
          'Math.floor(',
          this.accept(node.leftExpr),
          ' / ',
          this.accept(node.rightExpr),
          ')'
        );
        break;
      default:
        chunks.push(
          '(',
          this.accept(node.leftExpr),
          ` ${BINARY_OP_MAP[node.op]} `,
          this.accept(node.rightExpr),
          ')'
        );
        break;
    }
    return this.createSourceNode(node, ...chunks);
  }

  visitUnaryOpExpr(node: UnaryOpExpr): SourceNode {
    const OP_MAP = {
      [UnaryOp.NEG]: '-',
      [UnaryOp.NOT]: '!',
      [UnaryOp.PARENS]: '',
    };
    return this.createSourceNode(
      node,
      '(',
      OP_MAP[node.op],
      this.accept(node.rightExpr),
      ')'
    );
  }

  visitSubscriptExpr(node: SubscriptExpr): SourceNode {
    return this.createSourceNode(
      node,
      this.accept(node.arrayExpr),
      '.values',
      ...node.indexExprs.map((indexExpr, i) => [
        '[',
        this.generateSubscriptCode(node.arrayExpr, i, indexExpr),
        ']',
      ])
    );
  }

  private generateSubscriptCode(
    arrayExpr: VarRefExpr,
    dimension: number,
    indexExpr: Expr
  ): SourceChunk {
    return [
      this.accept(arrayExpr),
      `.getIdx(${dimension}, `,
      this.accept(indexExpr),
      ')',
    ];
  }

  visitMemberExpr(node: MemberExpr): SourceNode {
    return this.createSourceNode(
      node,
      this.accept(node.udtExpr),
      `.values['${node.fieldName}']`
    );
  }

  private visitProcCall(node: FnCallExpr | CallStmt): SourceNode {
    const argPtrs: SourceChunks = [];
    const tempVars: Array<{name: string; expr: Expr}> = [];
    let tempVarPrefix: string | null = null;
    let tempVarIdx = 0;

    for (const argExpr of node.argExprs) {
      if (argExpr.type === ExprType.VAR_REF) {
        argPtrs.push(
          this.createSourceNode(
            argExpr,
            argExpr.symbol!.varType === VarType.ARG
              ? `ctx.args['${argExpr.name}']`
              : `[${this.generateVarContainerCode(
                  argExpr,
                  argExpr.symbol!
                )}, '${argExpr.name}']`
          )
        );
      } else if (argExpr.type === ExprType.SUBSCRIPT) {
        const containerCode = this.accept({
          ...argExpr,
          indexExprs: argExpr.indexExprs.slice(
            0,
            argExpr.indexExprs.length - 1
          ),
        });
        const lastIndexExprCode = this.generateSubscriptCode(
          argExpr.arrayExpr,
          argExpr.indexExprs.length - 1,
          argExpr.indexExprs[argExpr.indexExprs.length - 1]
        );
        argPtrs.push(
          this.createSourceNode(
            argExpr,
            '[',
            containerCode,
            ', ',
            lastIndexExprCode,
            ']'
          )
        );
      } else if (argExpr.type === ExprType.MEMBER) {
        argPtrs.push(
          this.createSourceNode(
            argExpr,
            '[',
            this.accept(argExpr.udtExpr),
            ', ',
            `'${argExpr.fieldName}']`
          )
        );
      } else {
        if (!tempVarPrefix) {
          tempVarPrefix = this.generateLabel();
        }
        const tempVarName = `${tempVarPrefix}_${tempVarIdx++}`;
        tempVars.push({name: tempVarName, expr: argExpr});
        argPtrs.push(`[ctx.tempVars, '${tempVarName}']`);
      }
    }

    const executeProcCodePrefixMap = {
      [FnDefType.BUILTIN]:
        'ctx.runtime.executeBuiltinFn(' +
        `'${node.name}', ${JSON.stringify(
          node.argExprs.map(({typeSpec}) => typeSpec!)
        )}`,
      [FnDefType.MODULE]: `ctx.executeProc(ctx, '${node.name}'`,
    };

    return this.createSourceNode(
      node,
      '(await (async () => {\n',
      this.lines(+1),
      ...tempVars.map(({name, expr}) => [
        this.lines(`${this.generateTempVarRef(name)} = `),
        this.accept(expr),
        isUdt(expr.typeSpec!) ? '.clone()' : '',
        ';\n',
      ]),
      this.lines(
        `const result = await ${
          executeProcCodePrefixMap[node.fnDefType!]
        }, ${argPtrs.join(', ')});`,
        ...tempVars.map(({name}) => `delete ${this.generateTempVarRef(name)};`),
        'return result;',
        -1,
        '})())'
      )
    );
  }

  private createSourceNode<T extends AstNodeBase>(
    node: T,
    ...chunks: Array<SourceChunk | SourceChunks>
  ) {
    return new SourceNode(
      node.loc.line,
      node.loc.col,
      this.opts.sourceFileName,
      _.flattenDeep(chunks)
    );
  }

  private lines(...values: Array<string | number>) {
    const outputLines: Array<string> = [];
    for (const value of values) {
      if (typeof value === 'string') {
        const indentStr = value
          ? ' '.repeat(this.opts.indentWidth * this.indent)
          : '';
        outputLines.push(indentStr + value);
      } else if (typeof value === 'number') {
        this.indent += value;
      } else {
        throw new Error(`Unexpected line value: ${JSON.stringify(value)}`);
      }
    }
    return outputLines.join('\n');
  }

  private generateLabel() {
    return `$${this.nextGeneratedLabelIdx++}`;
  }

  private generateLoc<T extends AstNodeBase>(node: T) {
    return node.loc ? `loc: [${node.loc.line}, ${node.loc.col}],` : '';
  }

  private generateLabelStmt<T extends AstNodeBase>(
    node: T | null | undefined,
    label: string
  ) {
    return this.lines(
      '{',
      +1,
      ...(node ? [this.generateLoc(node)] : []),
      `label: '${label}',`,
      -1,
      `},`,
      ''
    );
  }

  private generateVarRefCode<T extends AstNodeBase>(
    node: T,
    symbol: VarSymbol
  ) {
    const varContainer = this.generateVarContainerCode(node, symbol);
    if (symbol.varType === VarType.ARG) {
      return `${varContainer}['${symbol.name}'][0][${varContainer}['${symbol.name}'][1]]`;
    } else {
      return `${varContainer}['${symbol.name}']`;
    }
  }

  private generateVarContainerCode<T extends AstNodeBase>(
    node: T,
    symbol: VarSymbol
  ) {
    if (symbol.varType === VarType.ARG) {
      return 'ctx.args';
    } else if (symbol.varScope === VarScope.LOCAL) {
      switch (symbol.varType) {
        case VarType.STATIC_VAR:
          return 'ctx.localStaticVars';
        case VarType.VAR:
        case VarType.CONST:
          return 'ctx.localVars';
        default:
          this.throwError(
            `Unexpected local var type: ${JSON.stringify(symbol.varType)}`,
            node
          );
      }
    } else if (symbol.varScope === VarScope.GLOBAL) {
      return 'ctx.globalVars';
    } else {
      this.throwError(
        `Unknown variable type or scope: ${JSON.stringify(symbol)}`,
        node
      );
    }
  }

  private generateGotoCode(destLabel: string) {
    return `return { type: '${ExecutionDirectiveType.GOTO}', destLabel: '${destLabel}' };`;
  }

  private generateTempVarRef(label: string) {
    return `ctx.tempVars['${label}']`;
  }

  private readonly opts: Required<CodeGeneratorOpts>;

  /** The current proc being visited, or null if currently visiting module-level nodes. */
  private currentProc: Proc | null = null;

  /** Stack of open for loops in current context. */
  private openForStmtStates: Array<ForStmtState> = [];
  /** Stack of open do loops in current context. */
  private openLoopStmtStates: Array<LoopStmtState> = [];

  /** Current indentation level. */
  private indent = 0;
  /** Current generated label index. */
  private nextGeneratedLabelIdx = 1;
}
