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
export interface Module {
  stmts: Array<Stmt>;
}

// ----
// Statements
// ----

/** A statement. */
export type Stmt = AssignStmt | PrintStmt;

export enum StmtType {
  ASSIGN = 'assign',
  PRINT = 'print',
}

export interface AssignStmt extends AstNodeBase {
  type: StmtType.ASSIGN;
  targetExpr: LhsExpr;
  valueExpr: Expr;
}

export interface PrintStmt extends AstNodeBase {
  type: StmtType.PRINT;
  args: Array<Expr>;
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
