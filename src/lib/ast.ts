import {DataTypeSpec} from './types';
import {VarSymbolTable, VarType, VarScope} from './symbol-table';
import ErrorWithLoc from './error-with-loc';

/** An AST node. */
export type AstNode = Proc | Stmt | Expr;

/** Common properties of AST nodes. */
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
  /** Module-level statements. */
  stmts: Stmts;
  /** Procedure definitions (SUBs and FUNCTIONs). */
  procs: Array<Proc>;

  /** Local variable symbol table.
   *
   * Populated during semantic analysis.
   */
  localSymbols?: VarSymbolTable;
  /** Global (shared) variable symbol table.
   *
   * Populated during semantic analysis.
   */
  globalSymbols?: VarSymbolTable;
}

/** A procedure definition (a SUB or a FUNCTION). */
export type Proc = SubProc | FnProc;

export enum ProcType {
  SUB = 'sub',
  FN = 'fn',
}

/** Returns the user-facing name of a ProcType. */
export function procTypeName(procType: ProcType) {
  const NAMES = {
    [ProcType.SUB]: 'SUB procedure',
    [ProcType.FN]: 'function',
  };
  return NAMES[procType];
}

/** Common properties of procedure definitions. */
interface ProcBase extends AstNodeBase {
  name: string;
  params: Array<Param>;
  stmts: Stmts;

  /** Local variable symbol table.
   *
   * Populated during semantic analysis.
   */
  localSymbols?: VarSymbolTable;
  /** Arguments symbol table.
   *
   * Populated during semantic analysis.
   */
  paramSymbols?: VarSymbolTable;
}

/** A SUB procedure. */
export interface SubProc extends ProcBase {
  type: ProcType.SUB;
}

/** A FUNCTION procedure. */
export interface FnProc extends ProcBase {
  type: ProcType.FN;
  /** Return type of this function.
   *
   * Populated during parsing (if AS <type> provided) or during semantic analysis.
   */
  returnTypeSpec?: DataTypeSpec;
}

/** A function parameter. */
export interface Param {
  name: string;
  /** Type of this parameter.
   *
   * May be populated during parsing (if AS <type> provided) or during semantic analysis.
   */
  typeSpec?: DataTypeSpec;
}

export type Stmts = Array<Stmt>;

// ----
// Statements
// ----

/** A statement. */
export type Stmt =
  | LabelStmt
  | DimStmt
  | AssignStmt
  | ConstStmt
  | GotoStmt
  | IfStmt
  | CondLoopStmt
  | UncondLoopStmt
  | ExitLoopStmt
  | ForStmt
  | NextStmt
  | ExitForStmt
  | GosubStmt
  | ReturnStmt
  | CallStmt
  | ExitProcStmt
  | EndStmt
  | PrintStmt
  | InputStmt;

export enum StmtType {
  LABEL = 'label',
  DIM = 'dim',
  ASSIGN = 'assign',
  CONST = 'const',
  GOTO = 'goto',
  IF = 'if',
  COND_LOOP = 'condLoop',
  UNCOND_LOOP = 'uncondLoop',
  EXIT_LOOP = 'exitLoop',
  FOR = 'for',
  NEXT = 'next',
  EXIT_FOR = 'exitFor',
  GOSUB = 'gosub',
  RETURN = 'return',
  CALL = 'call',
  EXIT_PROC = 'exitProc',
  END = 'end',
  PRINT = 'print',
  INPUT = 'input',
}

export interface LabelStmt extends AstNodeBase {
  type: StmtType.LABEL;
  label: string;
}

export interface DimStmt extends AstNodeBase {
  type: StmtType.DIM;
  isShared: boolean;
  varDecls: Array<VarDecl>;
}

/** A variable declaration inside a DIM statement. */
export interface VarDecl {
  name: string;
  typeSpec?: DataTypeSpec;
}

export interface AssignStmt extends AstNodeBase {
  type: StmtType.ASSIGN;
  targetExpr: LhsExpr;
  valueExpr: Expr;
}

export interface ConstStmt extends AstNodeBase {
  type: StmtType.CONST;
  constDefs: Array<ConstDef>;
}

export interface ConstDef {
  name: string;
  valueExpr: Expr;
  /** Resolved variable scope.
   *
   * Populated during semantic analysis.
   */
  varScope?: VarScope;
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
  elseBranchStmts: Stmts;
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

export interface UncondLoopStmt extends AstNodeBase {
  type: StmtType.UNCOND_LOOP;
  stmts: Stmts;
}

export interface ExitLoopStmt extends AstNodeBase {
  type: StmtType.EXIT_LOOP;
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

export interface GosubStmt extends AstNodeBase {
  type: StmtType.GOSUB;
  destLabel: string;
}

export interface ReturnStmt extends AstNodeBase {
  type: StmtType.RETURN;
  destLabel?: string;
}

export interface CallStmt extends AstNodeBase {
  type: StmtType.CALL;
  name: string;
  argExprs: Array<Expr>;
}

export interface ExitProcStmt extends AstNodeBase {
  type: StmtType.EXIT_PROC;
  procType: ProcType;
}

export interface EndStmt extends AstNodeBase {
  type: StmtType.END;
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

export interface InputStmt extends AstNodeBase {
  type: StmtType.INPUT;
  prompt: string;
  targetExprs: Array<LhsExpr>;
}

// ----
// Expressions
// ----

/** An expression. */
export type Expr =
  | LiteralExpr
  | VarRefExpr
  | FnCallExpr
  | BinaryOpExpr
  | UnaryOpExpr;

/** An expression that can be assigned to. */
export type LhsExpr = VarRefExpr;

export enum ExprType {
  LITERAL = 'literal',
  VAR_REF = 'varRef',
  FN_CALL = 'fnCall',
  BINARY_OP = 'binaryOp',
  UNARY_OP = 'unaryOp',
}

/** Common attributes of expression nodes. */
interface ExprBase extends AstNodeBase {
  /** Type of this expression.
   *
   * Populated during semantic analysis.
   */
  typeSpec?: DataTypeSpec;
}

export interface LiteralExpr extends ExprBase {
  type: ExprType.LITERAL;
  value: string | number; // TODO
}

export interface VarRefExpr extends ExprBase {
  type: ExprType.VAR_REF;
  name: string;
  /** Resolved variable type.
   *
   * Populated during semantic analysis.
   */
  varType?: VarType;
  /** Resolved variable scope.
   *
   * Populated during semantic analysis.
   */
  varScope?: VarScope;
}

export interface FnCallExpr extends ExprBase {
  type: ExprType.FN_CALL;
  name: string;
  argExprs: Array<Expr>;
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

export interface BinaryOpExpr extends ExprBase {
  type: ExprType.BINARY_OP;
  op: BinaryOp;
  leftExpr: Expr;
  rightExpr: Expr;
}

export enum UnaryOp {
  NOT = 'not',
  NEG = 'sub',
  PARENS = 'parens',
}

export interface UnaryOpExpr extends ExprBase {
  type: ExprType.UNARY_OP;
  op: UnaryOp;
  rightExpr: Expr;
}

/** Error thrown by AST visitors. */
export class AstVisitorError extends ErrorWithLoc {
  constructor(
    message: string,
    {sourceFileName, node}: {sourceFileName?: string; node?: AstNode} = {}
  ) {
    super(message, {sourceFileName, loc: node?.loc});
  }
}

/** Base class for AST visitors. */
export abstract class AstVisitor<T = any> {
  protected abstract visitModule(module: Module): T;
  protected abstract visitFnProc(node: FnProc): T;
  protected abstract visitSubProc(node: SubProc): T;

  protected abstract visitLabelStmt(node: LabelStmt): T;
  protected abstract visitDimStmt(node: DimStmt): T;
  protected abstract visitAssignStmt(node: AssignStmt): T;
  protected abstract visitConstStmt(node: ConstStmt): T;
  protected abstract visitGotoStmt(node: GotoStmt): T;
  protected abstract visitIfStmt(node: IfStmt): T;
  protected abstract visitCondLoopStmt(node: CondLoopStmt): T;
  protected abstract visitUncondLoopStmt(node: UncondLoopStmt): T;
  protected abstract visitExitLoopStmt(node: ExitLoopStmt): T;
  protected abstract visitForStmt(node: ForStmt): T;
  protected abstract visitNextStmt(node: NextStmt): T;
  protected abstract visitExitForStmt(node: ExitForStmt): T;
  protected abstract visitGosubStmt(node: GosubStmt): T;
  protected abstract visitReturnStmt(node: ReturnStmt): T;
  protected abstract visitCallStmt(node: CallStmt): T;
  protected abstract visitExitProcStmt(node: ExitProcStmt): T;
  protected abstract visitEndStmt(node: EndStmt): T;
  protected abstract visitPrintStmt(node: PrintStmt): T;
  protected abstract visitInputStmt(node: InputStmt): T;

  protected abstract visitLiteralExpr(node: LiteralExpr): T;
  protected abstract visitVarRefExpr(node: VarRefExpr): T;
  protected abstract visitFnCallExpr(node: FnCallExpr): T;
  protected abstract visitBinaryOpExpr(node: BinaryOpExpr): T;
  protected abstract visitUnaryOpExpr(node: UnaryOpExpr): T;

  /** Invokes the visitor method corresponding to the specified AstNode. */
  protected accept(node: AstNode): T {
    switch (node.type) {
      case ProcType.FN:
        return this.visitFnProc(node);
      case ProcType.SUB:
        return this.visitSubProc(node);
      case StmtType.LABEL:
        return this.visitLabelStmt(node);
      case StmtType.DIM:
        return this.visitDimStmt(node);
      case StmtType.ASSIGN:
        return this.visitAssignStmt(node);
      case StmtType.CONST:
        return this.visitConstStmt(node);
      case StmtType.GOTO:
        return this.visitGotoStmt(node);
      case StmtType.IF:
        return this.visitIfStmt(node);
      case StmtType.COND_LOOP:
        return this.visitCondLoopStmt(node);
      case StmtType.UNCOND_LOOP:
        return this.visitUncondLoopStmt(node);
      case StmtType.EXIT_LOOP:
        return this.visitExitLoopStmt(node);
      case StmtType.FOR:
        return this.visitForStmt(node);
      case StmtType.NEXT:
        return this.visitNextStmt(node);
      case StmtType.EXIT_FOR:
        return this.visitExitForStmt(node);
      case StmtType.GOSUB:
        return this.visitGosubStmt(node);
      case StmtType.RETURN:
        return this.visitReturnStmt(node);
      case StmtType.CALL:
        return this.visitCallStmt(node);
      case StmtType.EXIT_PROC:
        return this.visitExitProcStmt(node);
      case StmtType.END:
        return this.visitEndStmt(node);
      case StmtType.PRINT:
        return this.visitPrintStmt(node);
      case StmtType.INPUT:
        return this.visitInputStmt(node);
      case ExprType.LITERAL:
        return this.visitLiteralExpr(node);
      case ExprType.VAR_REF:
        return this.visitVarRefExpr(node);
      case ExprType.FN_CALL:
        return this.visitFnCallExpr(node);
      case ExprType.BINARY_OP:
        return this.visitBinaryOpExpr(node);
      case ExprType.UNARY_OP:
        return this.visitUnaryOpExpr(node);
      default:
        throw new Error(`Unknown node type: ${JSON.stringify(node)}`);
    }
  }

  /** Invokes the corresponding visitor methods for each of the provided AstNodes. */
  protected acceptAll(nodes: Array<AstNode>): Array<T> {
    return nodes.map((node) => this.accept(node));
  }

  /** Throws an AstVisitorError for the corresponding AstNode. */
  protected throwError(message: string, node: AstNode): never {
    throw new AstVisitorError(message, {
      sourceFileName: this.sourceFileName,
      node,
    });
  }

  /** Current source file name, used in error messages. */
  protected sourceFileName?: string;
}
