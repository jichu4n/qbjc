/** An AST node. */
export type AstNode = Stmt | Expr;

/** Common properties of all AST nodes. */
export interface AstNodeBase {
  loc: AstNodeLocation;
}

/** Location of an AST node in the source file. */
export interface AstNodeLocation {
  line: number;
  col: number;
}

// ----
// Program structure
// ----

export type Stmts = Array<Stmt>;

export interface Module {
  stmts: Stmts;
}

// ----
// Statements
// ----

/** A statement. */
export type Stmt =
  | LabelStmt
  | AssignStmt
  | GotoStmt
  | IfStmt
  | CondLoopStmt
  | ForStmt
  | NextStmt
  | ExitForStmt
  | PrintStmt;

export enum StmtType {
  LABEL = 'label',
  ASSIGN = 'assign',
  GOTO = 'goto',
  IF = 'if',
  COND_LOOP = 'condLoop',
  FOR = 'for',
  NEXT = 'next',
  EXIT_FOR = 'exitFor',
  PRINT = 'print',
}

export interface LabelStmt extends AstNodeBase {
  type: StmtType.LABEL;
  label: string;
}

export interface AssignStmt extends AstNodeBase {
  type: StmtType.ASSIGN;
  targetExpr: LhsExpr;
  valueExpr: Expr;
}

export interface GotoStmt extends AstNodeBase {
  type: StmtType.GOTO;
  destLabel: string;
}

export interface IfBranch {
  condExpr: Expr;
  stmts: Stmts;
}

export interface IfStmt extends AstNodeBase {
  type: StmtType.IF;
  ifBranches: Array<IfBranch>;
  elseBranch: Stmts;
}

export enum CondLoopStructure {
  COND_EXPR_BEFORE_STMTS = 'condExprBeforeStmts',
  COND_EXPR_AFTER_STMTS = 'condExprAfterStmts',
}

export interface CondLoopStmt extends AstNodeBase {
  type: StmtType.COND_LOOP;
  structure: CondLoopStructure;
  condExpr: Expr;
  isCondNegated: boolean;
  stmts: Stmts;
}

export interface ForStmt extends AstNodeBase {
  type: StmtType.FOR;
  counterExpr: LhsExpr;
  startExpr: Expr;
  endExpr: Expr;
  stepExpr: Expr | null;
}

export interface NextStmt extends AstNodeBase {
  type: StmtType.NEXT;
  counterExprs: Array<LhsExpr>;
}

export interface ExitForStmt extends AstNodeBase {
  type: StmtType.EXIT_FOR;
}

export enum PrintSep {
  COMMA = 'comma',
  SEMICOLON = 'semicolon',
}

export type PrintArg = Expr | PrintSep;
export interface PrintStmt extends AstNodeBase {
  type: StmtType.PRINT;
  args: Array<PrintArg>;
}

// ----
// Expressions
// ----

/** An expression. */
export type Expr = LiteralExpr | VarRefExpr | BinaryOpExpr | UnaryOpExpr;

/** An expression that can be assigned to. */
export type LhsExpr = VarRefExpr;

export enum ExprType {
  LITERAL = 'literal',
  VAR_REF = 'varRef',
  BINARY_OP = 'binaryOp',
  UNARY_OP = 'unaryOp',
}

export interface LiteralExpr extends AstNodeBase {
  type: ExprType.LITERAL;
  value: string | number; // TODO
}

export interface VarRefExpr extends AstNodeBase {
  type: ExprType.VAR_REF;
  name: string;
}

export enum BinaryOp {
  ADD = 'add',
  SUB = 'sub',
  MUL = 'mul',
  DIV = 'div',
  INTDIV = 'intdiv',
  EXP = 'exp',
  MOD = 'mod',
  AND = 'and',
  OR = 'or',
  EQ = 'eq',
  NE = 'ne',
  GT = 'gt',
  GTE = 'gte',
  LT = 'lt',
  LTE = 'lte',
}

export interface BinaryOpExpr extends AstNodeBase {
  type: ExprType.BINARY_OP;
  op: BinaryOp;
  leftExpr: Expr;
  rightExpr: Expr;
}

export enum UnaryOp {
  NOT = 'not',
  NEG = 'sub',
}

export interface UnaryOpExpr extends AstNodeBase {
  type: ExprType.UNARY_OP;
  op: UnaryOp;
  expr: Expr;
}

/** Base class for AST visitors. */
export abstract class AstVisitor<T = any> {
  protected abstract visitModule(module: Module): T;

  protected abstract visitLabelStmt(node: LabelStmt): T;
  protected abstract visitAssignStmt(node: AssignStmt): T;
  protected abstract visitGotoStmt(node: GotoStmt): T;
  protected abstract visitIfStmt(node: IfStmt): T;
  protected abstract visitCondLoopStmt(node: CondLoopStmt): T;
  protected abstract visitForStmt(node: ForStmt): T;
  protected abstract visitNextStmt(node: NextStmt): T;
  protected abstract visitExitForStmt(node: ExitForStmt): T;
  protected abstract visitPrintStmt(node: PrintStmt): T;

  protected abstract visitLiteralExpr(node: LiteralExpr): T;
  protected abstract visitVarRefExpr(node: VarRefExpr): T;
  protected abstract visitBinaryOpExpr(node: BinaryOpExpr): T;
  protected abstract visitUnaryOpExpr(node: UnaryOpExpr): T;

  protected accept(node: AstNode): T {
    switch (node.type) {
      case StmtType.LABEL:
        return this.visitLabelStmt(node);
      case StmtType.ASSIGN:
        return this.visitAssignStmt(node);
      case StmtType.GOTO:
        return this.visitGotoStmt(node);
      case StmtType.IF:
        return this.visitIfStmt(node);
      case StmtType.COND_LOOP:
        return this.visitCondLoopStmt(node);
      case StmtType.FOR:
        return this.visitForStmt(node);
      case StmtType.NEXT:
        return this.visitNextStmt(node);
      case StmtType.EXIT_FOR:
        return this.visitExitForStmt(node);
      case StmtType.PRINT:
        return this.visitPrintStmt(node);
      case ExprType.LITERAL:
        return this.visitLiteralExpr(node);
      case ExprType.VAR_REF:
        return this.visitVarRefExpr(node);
      case ExprType.BINARY_OP:
        return this.visitBinaryOpExpr(node);
      case ExprType.UNARY_OP:
        return this.visitUnaryOpExpr(node);
      default:
        throw new Error(`Unknown node type: ${JSON.stringify(node)}`);
    }
  }

  protected acceptAll(nodes: Array<AstNode>): Array<T> {
    return nodes.map((node) => this.accept(node));
  }
}
