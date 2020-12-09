import _ from 'lodash';
import {SourceNode} from 'source-map';
import {
  AssignStmt,
  AstNode,
  AstVisitor,
  BinaryOp,
  BinaryOpExpr,
  GotoStmt,
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
      this.lines(
        'export default class CompiledModule {',
        +1,
        'statements = [',
        '',
        +1
      )
    );

    sourceNode.add(module.stmts.map((stmt) => this.accept(stmt)));

    sourceNode.add(this.lines(-1, '];', 'async run(ctx) {}', -1, '}', ''));
    return sourceNode;
  }

  visitLabelStmt(node: LabelStmt): SourceNode {
    return this.createSourceNode(
      node,
      this.lines(`{ label: '${node.label}' },`, '')
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
    return this.createStmtSourceNode(node, () => [
      `return { type: 'goto', destLabel: '${node.destLabel}' };`,
    ]);
  }
  visitPrintStmt(node: PrintStmt): SourceNode {
    return this.createStmtSourceNode(node, () => [
      'console.log(',
      this.accept(node.args[0]),
      ');',
    ]);
  }

  private createStmtSourceNode(
    node: Stmt,
    generateRunCode: () => SourceNode | string | Array<SourceNode | string>
  ) {
    let runCode: ReturnType<typeof generateRunCode>;
    return this.createSourceNode(
      node,
      this.lines('{', +1, ''),
      this.lines('async run(ctx) { '),
      ...(Array.isArray((runCode = generateRunCode())) ? runCode : [runCode]),
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

  private createSourceNode(
    node: AstNode,
    ...chunks: Array<string | SourceNode | Array<string | SourceNode>>
  ) {
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

  private readonly sourceFileName: string | null;
  private readonly indentWidth: number;

  /** Current indentation level. */
  private indent = 0;
}

export default function codegen(module: Module, opts: CodeGeneratorOpts = {}) {
  return new CodeGenerator(module, opts).run();
}
