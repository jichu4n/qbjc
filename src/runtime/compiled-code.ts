import {VarSymbolTable} from '../lib/symbol-table';
import {ElementaryTypeSpec, ProcType} from '../lib/types';
import QbArray from './qb-array';
import Runtime from './runtime';

/** A compiled module produced by CodeGenerator. */
export interface CompiledModule {
  sourceFileName?: string;
  localSymbols: VarSymbolTable;
  globalSymbols: VarSymbolTable;
  stmts: Array<CompiledStmt>;
  procs: Array<CompiledProc>;
}

interface CompiledComponentBase {
  /** Location of this statement in the source code. */
  loc?: [number, number];
}

/** A compiled procedure (SUB or FUNCTION). */
export interface CompiledProc {
  type: ProcType;
  name: string;
  localSymbols: VarSymbolTable;
  paramSymbols: VarSymbolTable;
  stmts: Array<CompiledStmt>;
}

/** A compiled statement. */
export type CompiledStmt = CompiledLabelStmt | CompiledCodeStmt;

/** A label in the compiled program. */
export interface CompiledLabelStmt extends CompiledComponentBase {
  label: string;
}

/** A compiled statement with executable code. */
export interface CompiledCodeStmt extends CompiledComponentBase {
  run(ctx: ExecutionContext): Promise<ExecutionDirective | void>;
}

/** Return value from a compiled statement. */
export type ExecutionDirective =
  | GotoDirective
  | GosubDirective
  | ReturnDirective
  | EndDirective
  | ExitProcDirective;

export enum ExecutionDirectiveType {
  GOTO = 'goto',
  GOSUB = 'gosub',
  RETURN = 'return',
  END = 'end',
  EXIT_PROC = 'exitProc',
}

/** Jump to a label. */
export interface GotoDirective {
  type: ExecutionDirectiveType.GOTO;
  destLabel: string;
}

/** Push return address and jump to a label. */
export interface GosubDirective {
  type: ExecutionDirectiveType.GOSUB;
  destLabel: string;
}

/** Pop return address and jump to it (or another label if provided). */
export interface ReturnDirective {
  type: ExecutionDirectiveType.RETURN;
  destLabel?: string;
}

/** End program execution. */
export interface EndDirective {
  type: ExecutionDirectiveType.END;
}

/** End execution of current proc. */
export interface ExitProcDirective {
  type: ExecutionDirectiveType.EXIT_PROC;
}

/** A map holding variables at runtime, indexed by variable name. */
export type VarContainer = {[name: string]: any};

/** Pointer to a variable.
 *
 * The underlying variable can be referenced with ptr[0][ptr[1]].
 */
export type Ptr = [VarContainer, string];

/** Arguments to a procedure. */
export type ArgsContainer = {[name: string]: Ptr};

/** Compiled statement execution context. */
export interface ExecutionContext {
  runtime: Runtime;
  executeProc: (
    prevCtx: ExecutionContext,
    name: string,
    ...args: Array<Ptr>
  ) => Promise<any>;
  args: ArgsContainer;
  localVars: VarContainer;
  localStaticVars: VarContainer;
  globalVars: VarContainer;
  tempVars: VarContainer;
}

/** Type of an argument to print(). */
export enum PrintArgType {
  COMMA = 'comma',
  SEMICOLON = 'semicolon',
  VALUE = 'value',
}

/** Argument to print(). */
export type PrintArg =
  | {type: PrintArgType.COMMA | PrintArgType.SEMICOLON}
  | {type: PrintArgType.VALUE; value: string | number};
