import _ from 'lodash';
import {SourceNode} from 'source-map';
import {
  AssignStmt,
  AstNode,
  AstVisitor,
  BinaryOp,
  BinaryOpExpr,
  GotoStmt,
  IfStmt,
  LabelStmt,
  LiteralExpr,
  Module,
  PrintStmt,
  Stmt,
  UnaryOp,
  UnaryOpExpr,
  VarRefExpr,
} from '../ast/ast';

/** Default indentation per level. */
const DEFAULT_INDENT_WIDTH = 4;

type SourceChunk = string | SourceNode | Array<string | SourceNode>;
type SourceChunks = Array<SourceChunk>;

interface CodeGeneratorOpts {
  sourceFileName?: string;
  indentWidth?: number;
}

class CodeGenerator extends AstVisitor<SourceNode> {
  constructor(
    private readonly module: Module,
    {sourceFileName, indentWidth = DEFAULT_INDENT_WIDTH}: CodeGeneratorOpts = {}
  ) {
    super();
    this.sourceFileName = sourceFileName ?? null;
    this.indentWidth = indentWidth;
  }

  run() {
    return this.visitModule(this.module).toStringWithSourceMap();
  }

  visitModule(module: Module): SourceNode {
    const sourceNode = new SourceNode();

    this.indent = 0;
    sourceNode.add(
      this.lines('module.exports = {', +1, 'default: {', +1, 'stmts: [', '', +1)
    );

    sourceNode.add(this.acceptAll(module.stmts));

    sourceNode.add(this.lines(-1, '],', -1, '}', -1, '}', ''));
    return sourceNode;
  }

  visitLabelStmt(node: LabelStmt): SourceNode {
    return this.createSourceNode(
      node,
      this.generateLabelStmt(node, node.label)
    );
  }
  visitAssignStmt(node: AssignStmt): SourceNode {
    return this.createStmtSourceNode(node, () => [
      this.accept(node.targetExpr),
      ' = ',
      this.accept(node.valueExpr),
      ';',
    ]);
  }
  visitGotoStmt(node: GotoStmt): SourceNode {
    return this.createStmtSourceNode(node, () =>
      this.generateGotoCode(node.destLabel)
    );
  }
  visitIfStmt(node: IfStmt): SourceNode {
    // Generate labels for each "elseif" branch, the else branch, and the "end if".
    const branchLabelPrefix = this.generateLabel();
    const branchLabels: Array<{
      node: AstNode | null | undefined;
      label: string;
    }> = [];
    for (let i = 1; i < node.ifBranches.length; ++i) {
      branchLabels.push({
        node: node.ifBranches[i].stmts[0],
        label: `${branchLabelPrefix}_elif_${i}`,
      });
    }
    if (node.elseBranch.length > 0) {
      branchLabels.push({
        node: node.elseBranch[0],
        label: `${branchLabelPrefix}_else`,
      });
    }
    const endIfLabel = `${branchLabelPrefix}_endif`;
    branchLabels.push({node: null, label: endIfLabel});

    const chunks: SourceChunks = [];
    let nextBranchLabelIdx = 0;

    // Generate code for "if" and "elseif" branches.
    for (const {condExpr, stmts} of node.ifBranches) {
      const {node: nextBranchNode, label: nextBranchLabel} = branchLabels[
        nextBranchLabelIdx
      ];
      chunks.push(
        this.createStmtSourceNode(condExpr, () => [
          'if (!(',
          this.accept(condExpr),
          `)) { ${this.generateGotoCode(nextBranchLabel)} }`,
        ])
      );
      ++this.indent;
      chunks.push(this.acceptAll(stmts));
      if (nextBranchLabelIdx < branchLabels.length - 1) {
        chunks.push(
          this.createStmtSourceNode(condExpr, () =>
            this.generateGotoCode(endIfLabel)
          )
        );
      }
      --this.indent;
      chunks.push(this.generateLabelStmt(nextBranchNode, nextBranchLabel));
      ++nextBranchLabelIdx;
    }

    // Generate code for "else" branch.
    if (node.elseBranch.length > 0) {
      ++this.indent;
      chunks.push(this.acceptAll(node.elseBranch));
      --this.indent;
      chunks.push(this.generateLabelStmt(null, endIfLabel));
    }

    return this.createSourceNode(node, ...chunks);
  }
  visitPrintStmt(node: PrintStmt): SourceNode {
    return this.createStmtSourceNode(node, () => [
      'console.log(',
      this.accept(node.args[0] as AstNode), // TODO
      ');',
    ]);
  }

  private createStmtSourceNode(
    node: AstNode,
    generateRunCode: () => SourceChunk
  ) {
    return this.createSourceNode(
      node,
      this.lines('{', +1, ''),
      this.lines(`loc: ${JSON.stringify(node.loc)},`, ''),
      this.lines('async run(ctx) { '),
      generateRunCode(),
      ' },\n',
      this.lines(-1, '},', '')
    );
  }

  visitLiteralExpr(node: LiteralExpr): SourceNode {
    let valueString: string;
    if (typeof node.value === 'string') {
      valueString = `'${node.value}'`; // TODO: Escape literals
    } else if (typeof node.value === 'number') {
      valueString = `${node.value}`;
    } else {
      throw new Error(
        `Unrecognized literal value: ${JSON.stringify(node.value)}`
      );
    }
    return this.createSourceNode(node, valueString);
  }
  visitVarRefExpr(node: VarRefExpr): SourceNode {
    return this.createSourceNode(node, `ctx.localVars['${node.name}']`);
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
        const OP_MAP = {
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
        chunks.push(
          '(',
          this.accept(node.leftExpr),
          ` ${OP_MAP[node.op]} `,
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
    };
    return this.createSourceNode(
      node,
      '(',
      OP_MAP[node.op],
      this.accept(node.expr),
      ')'
    );
  }

  private createSourceNode(node: AstNode, ...chunks: SourceChunks) {
    return new SourceNode(
      node.loc.line,
      node.loc.col,
      this.sourceFileName,
      _.flatten(chunks)
    );
  }

  private lines(...values: Array<string | number>) {
    const outputLines: Array<string> = [];
    for (const value of values) {
      if (typeof value === 'string') {
        const indentStr = value
          ? ' '.repeat(this.indentWidth * this.indent)
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

  private generateLabelStmt(node: AstNode | null | undefined, label: string) {
    return this.lines(
      '{',
      +1,
      ...(node ? [`loc: ${JSON.stringify(node.loc)},`] : []),
      `label: '${label}',`,
      -1,
      `},`,
      ''
    );
  }

  private generateGotoCode(destLabel: string) {
    return `return { type: 'goto', destLabel: '${destLabel}' };`;
  }

  private readonly sourceFileName: string | null;
  private readonly indentWidth: number;

  /** Current indentation level. */
  private indent = 0;
  /** Current generated label index. */
  private nextGeneratedLabelIdx = 1;
}

export default function codegen(module: Module, opts: CodeGeneratorOpts = {}) {
  return new CodeGenerator(module, opts).run();
}
