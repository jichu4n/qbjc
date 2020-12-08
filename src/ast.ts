/** An AST node. */
export interface AstNode {
  loc: AstNodeLocation;
}

/** Location of an AST node in the source file. */
export interface AstNodeLocation {
  line: number;
  col: number;
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

export interface AssignStmt extends AstNode {
  type: StmtType.ASSIGN;
  targetExpr: LhsExpr;
  valueExpr: Expr;
}

export interface PrintStmt extends AstNode {
  type: StmtType.PRINT;
  args: Array<Expr>;
}

// ----
// Expressions
// ----

/** An expression. */
export type Expr = LiteralExpr | VarRefExpr | BinaryOpExpr | UnaryOp;

/** An expression that can be assigned to. */
export type LhsExpr = VarRefExpr;

export enum ExprType {
  LITERAL = 'literal',
  VAR_REF = 'varRef',
  BINARY_OP = 'binaryOp',
  UNARY_OP = 'unaryOp',
}

export interface LiteralExpr extends AstNode {
  type: ExprType.LITERAL;
  value: string; // TODO
}

export interface VarRefExpr extends AstNode {
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

export interface BinaryOpExpr extends AstNode {
  type: ExprType.BINARY_OP;
  op: BinaryOp;
  leftExpr: Expr;
  rightExpr: Expr;
}

export enum UnaryOp {
  NOT = 'not',
  NEG = 'sub',
}

export interface UnaryOpExpr extends AstNode {
  type: ExprType.UNARY_OP;
  op: UnaryOp;
  expr: Expr;
}
