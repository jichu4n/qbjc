import {DataItems} from './data-item';
import ErrorWithLoc from './error-with-loc';
import {VarSymbol, VarSymbolTable} from './symbol-table';
import {
  DataTypeSpec,
  ElementaryTypeSpec,
  FnDefType,
  ProcType,
  UdtTypeSpec,
} from './types';

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
  /** User-defined data types. */
  udts: Array<Udt>;

  // Populated during semantic analysis:

  /** Local variable symbol table. */
  localSymbols?: VarSymbolTable;
  /** Global (shared) variable symbol table. */
  globalSymbols?: VarSymbolTable;
  /** Labels in stmts.*/
  labels?: Array<string>;
}

/** A procedure definition (a SUB or a FUNCTION). */
export type Proc = SubProc | FnProc;

/** Common properties of procedure definitions. */
interface ProcBase extends AstNodeBase {
  name: string;
  params: Array<Param>;
  stmts: Stmts;
  isDefaultStatic: boolean;

  // Populated during semantic analysis:

  /** Local variable symbol table. */
  localSymbols?: VarSymbolTable;
  /** Arguments symbol table. */
  paramSymbols?: VarSymbolTable;
  /** Labels in stmts.*/
  labels?: Array<string>;
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
export interface Param extends AstNodeBase {
  name: string;
  typeSpecExpr: TypeSpecExpr;
}

export interface Udt extends AstNodeBase {
  name: string;
  fieldSpecExprs: Array<FieldSpecExpr>;

  /** Resolved TypeSpec.
   *
   * Populated during semantic analysis.
   */
  typeSpec?: UdtTypeSpec;
}

export interface FieldSpecExpr extends AstNodeBase {
  name: string;
  typeSpecExpr: SingularTypeSpecExpr;
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
  | SelectStmt
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
  | SwapStmt
  | PrintStmt
  | InputStmt
  | DefTypeStmt
  | NopStmt
  | DataStmt
  | ReadStmt
  | RestoreStmt;

export enum StmtType {
  LABEL = 'label',
  DIM = 'dim',
  ASSIGN = 'assign',
  CONST = 'const',
  GOTO = 'goto',
  IF = 'if',
  SELECT = 'select',
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
  SWAP = 'swap',
  PRINT = 'print',
  INPUT = 'input',
  DEF_TYPE = 'defType',
  NOP = 'nop',
  DATA = 'data',
  READ = 'read',
  RESTORE = 'restore',
}

export interface LabelStmt extends AstNodeBase {
  type: StmtType.LABEL;
  label: string;
}

export interface DimStmt extends AstNodeBase {
  type: StmtType.DIM;
  dimType: DimType;
  varDecls: Array<VarDecl>;
}

export enum DimType {
  LOCAL = 'local',
  SHARED = 'shared',
  STATIC = 'static',
}

/** A variable declaration inside a DIM statement. */
export interface VarDecl extends AstNodeBase {
  name: string;
  typeSpecExpr: TypeSpecExpr;
  /** Resolved variable symbol.
   *
   * Populated during semantic analysis.
   */
  symbol?: VarSymbol;
}

export type SingularTypeSpecExpr = ElementaryTypeSpecExpr | UdtTypeSpecExpr;

export type TypeSpecExpr = SingularTypeSpecExpr | ArrayTypeSpecExpr;

export enum TypeSpecExprType {
  ELEMENTARY = 'elementary',
  ARRAY = 'array',
  UDT = 'udt',
}

export function isSingularTypeExpr(
  typeSpecExpr: TypeSpecExpr
): typeSpecExpr is SingularTypeSpecExpr {
  return typeSpecExpr.type !== TypeSpecExprType.ARRAY;
}

export interface ElementaryTypeSpecExpr extends AstNodeBase {
  type: TypeSpecExprType.ELEMENTARY;
  typeSpec?: ElementaryTypeSpec;
}

export interface ArrayTypeSpecExpr extends AstNodeBase {
  type: TypeSpecExprType.ARRAY;
  elementTypeSpecExpr?: SingularTypeSpecExpr;
  dimensionSpecExprs: Array<ArrayDimensionSpecExpr>;
}

export interface UdtTypeSpecExpr extends AstNodeBase {
  type: TypeSpecExprType.UDT;
  name: string;
}

export interface ArrayDimensionSpecExpr extends AstNodeBase {
  minIdxExpr?: Expr;
  maxIdxExpr: Expr;
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

export interface ConstDef extends AstNodeBase {
  name: string;
  valueExpr: Expr;
  /** Resolved variable symbol.
   *
   * Populated during semantic analysis.
   */
  symbol?: VarSymbol;
}

export interface GotoStmt extends AstNodeBase {
  type: StmtType.GOTO;
  destLabel: string;
}

export interface IfBranch extends AstNodeBase {
  condExpr: Expr;
  stmts: Stmts;
}

export interface ElseBranch extends AstNodeBase {
  stmts: Stmts;
}

export interface IfStmt extends AstNodeBase {
  type: StmtType.IF;
  ifBranches: Array<IfBranch>;
  elseBranch: ElseBranch | null;
}

export interface SelectStmt extends AstNodeBase {
  type: StmtType.SELECT;
  testExpr: Expr;
  ifBranches: Array<CaseBranch>;
  elseBranch: ElseBranch | null;
}

export interface CaseBranch extends AstNodeBase {
  condExprs: Array<CaseExpr>;
  stmts: Stmts;
}

export type CaseExpr = ValueCaseExpr | RangeCaseExpr | CompCaseExpr;

export enum CaseExprType {
  /** Single value expression. */
  VALUE = 'value',
  /** Range, e.g. 1 TO 5. */
  RANGE = 'range',
  /** Comparison operator, e.g. IS >= 5. */
  COMP = 'comp',
}

export interface ValueCaseExpr {
  type: CaseExprType.VALUE;
  valueExpr: Expr;
}

export interface RangeCaseExpr {
  type: CaseExprType.RANGE;
  lowerBoundExpr: Expr;
  upperBoundExpr: Expr;
}

export interface CompCaseExpr {
  type: CaseExprType.COMP;
  op: BinaryOp;
  rightExpr: Expr;
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

  /** Resolved function definition type.
   *
   * Populated during semantic analysis.
   */
  fnDefType?: FnDefType;
}

export interface ExitProcStmt extends AstNodeBase {
  type: StmtType.EXIT_PROC;
  procType: ProcType;
}

export interface EndStmt extends AstNodeBase {
  type: StmtType.END;
}

export interface SwapStmt extends AstNodeBase {
  type: StmtType.SWAP;
  leftExpr: LhsExpr;
  rightExpr: LhsExpr;
}

/** An unimplemented statement that we can ignore for codegen purposes. */
export interface NopStmt extends AstNodeBase {
  type: StmtType.NOP;
  exprs?: Array<Expr>;
}

export enum PrintSep {
  COMMA = 'comma',
  SEMICOLON = 'semicolon',
}

export type PrintArg = Expr | PrintSep;
export interface PrintStmt extends AstNodeBase {
  type: StmtType.PRINT;
  args: Array<PrintArg>;
  formatExpr: Expr | null;
}

export interface InputStmt extends AstNodeBase {
  type: StmtType.INPUT;
  prompt: string;
  inputType: InputType;
  targetExprs: Array<LhsExpr>;
}

export enum InputType {
  /** INPUT. */
  TOKENIZED = 'tokenized',
  /** LINE INPUT. */
  LINE = 'line',
}

export interface DefTypeStmt extends AstNodeBase {
  type: StmtType.DEF_TYPE;
  typeSpec: ElementaryTypeSpec;
  ranges: Array<DefTypeRange>;
}

export interface DefTypeRange extends AstNodeBase {
  minPrefix: string;
  maxPrefix: string;
}

export interface DataStmt extends AstNodeBase {
  type: StmtType.DATA;
  data: DataItems;
}

export interface ReadStmt extends AstNodeBase {
  type: StmtType.READ;
  targetExprs: Array<LhsExpr>;
}

export interface RestoreStmt extends AstNodeBase {
  type: StmtType.RESTORE;
  destLabel?: string;
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
  | UnaryOpExpr
  | SubscriptExpr
  | MemberExpr;

/** An expression that can be assigned to. */
export type LhsExpr = VarRefExpr | SubscriptExpr | MemberExpr;

export enum ExprType {
  LITERAL = 'literal',
  VAR_REF = 'varRef',
  FN_CALL = 'fnCall',
  BINARY_OP = 'binaryOp',
  UNARY_OP = 'unaryOp',
  SUBSCRIPT = 'subscript',
  MEMBER = 'member',
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
  /** Resolved symbol.
   *
   * Populated during semantic analysis.
   */
  symbol?: VarSymbol;
}

export interface FnCallExpr extends ExprBase {
  type: ExprType.FN_CALL;
  name: string;
  argExprs: Array<Expr>;

  /** Resolved function definition type.
   *
   * Populated during semantic analysis.
   */
  fnDefType?: FnDefType;
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

export interface SubscriptExpr extends ExprBase {
  type: ExprType.SUBSCRIPT;
  arrayExpr: VarRefExpr; // QBasic only allows indexing variables
  indexExprs: Array<Expr>;
}

export interface MemberExpr extends ExprBase {
  type: ExprType.MEMBER;
  udtExpr: LhsExpr;
  fieldName: string;
}

/** Error thrown by AST visitors. */
export class AstVisitorError<T extends AstNodeBase> extends ErrorWithLoc {
  constructor(
    message: string,
    {sourceFileName, node}: {sourceFileName?: string; node?: T} = {}
  ) {
    super(message, {sourceFileName, loc: node?.loc});
  }
}

/** Base class for AST visitors. */
export abstract class AstVisitor<T = any> {
  protected abstract visitModule(module: Module): T;
  protected abstract visitProc(node: Proc): T;

  protected abstract visitLabelStmt(node: LabelStmt): T;
  protected abstract visitDimStmt(node: DimStmt): T;
  protected abstract visitAssignStmt(node: AssignStmt): T;
  protected abstract visitConstStmt(node: ConstStmt): T;
  protected abstract visitGotoStmt(node: GotoStmt): T;
  protected abstract visitIfStmt(node: IfStmt): T;
  protected abstract visitSelectStmt(node: SelectStmt): T;
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
  protected abstract visitSwapStmt(node: SwapStmt): T;
  protected abstract visitPrintStmt(node: PrintStmt): T;
  protected abstract visitInputStmt(node: InputStmt): T;
  protected abstract visitDefTypeStmt(node: DefTypeStmt): T;
  protected abstract visitNopStmt(node: NopStmt): T;
  protected abstract visitDataStmt(node: DataStmt): T;
  protected abstract visitReadStmt(node: ReadStmt): T;
  protected abstract visitRestoreStmt(node: RestoreStmt): T;

  protected abstract visitLiteralExpr(node: LiteralExpr): T;
  protected abstract visitVarRefExpr(node: VarRefExpr): T;
  protected abstract visitFnCallExpr(node: FnCallExpr): T;
  protected abstract visitBinaryOpExpr(node: BinaryOpExpr): T;
  protected abstract visitUnaryOpExpr(node: UnaryOpExpr): T;
  protected abstract visitSubscriptExpr(node: SubscriptExpr): T;
  protected abstract visitMemberExpr(node: MemberExpr): T;

  /** Invokes the visitor method corresponding to the specified AstNode. */
  protected accept(node: AstNode): T {
    switch (node.type) {
      case ProcType.FN:
      case ProcType.SUB:
        return this.visitProc(node);
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
      case StmtType.SELECT:
        return this.visitSelectStmt(node);
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
      case StmtType.SWAP:
        return this.visitSwapStmt(node);
      case StmtType.PRINT:
        return this.visitPrintStmt(node);
      case StmtType.INPUT:
        return this.visitInputStmt(node);
      case StmtType.DEF_TYPE:
        return this.visitDefTypeStmt(node);
      case StmtType.NOP:
        return this.visitNopStmt(node);
      case StmtType.DATA:
        return this.visitDataStmt(node);
      case StmtType.READ:
        return this.visitReadStmt(node);
      case StmtType.RESTORE:
        return this.visitRestoreStmt(node);
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
      case ExprType.SUBSCRIPT:
        return this.visitSubscriptExpr(node);
      case ExprType.MEMBER:
        return this.visitMemberExpr(node);
      default:
        throw new Error(`Unknown node type: ${JSON.stringify(node)}`);
    }
  }

  /** Invokes the corresponding visitor methods for each of the provided AstNodes. */
  protected acceptAll(nodes: Array<AstNode>): Array<T> {
    return nodes.map((node) => this.accept(node));
  }

  /** Throws an AstVisitorError for the corresponding AstNode. */
  protected throwError<T extends AstNodeBase>(message: string, node: T): never {
    throw new AstVisitorError(message, {
      sourceFileName: this.sourceFileName,
      node,
    });
  }

  /** Current source file name, used in error messages. */
  protected sourceFileName?: string;
}
