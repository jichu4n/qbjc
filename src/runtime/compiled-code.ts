import Runtime from './runtime';

/** A compiled module produced by CodeGenerator. */
export interface CompiledModule {
  sourceFileName?: string;
  stmts: Array<CompiledStmt>;
}

/** A compiled statement produced by CodeGenerator. */
export type CompiledStmt = CompiledLabelStmt | CompiledCodeStmt;

interface CompiledStmtBase {
  /** Location of this statement in the source code. */
  loc?: {line: number; col: number};
}

/** A label in the compiled program. */
export interface CompiledLabelStmt extends CompiledStmtBase {
  label: string;
}

/** A compiled statement with executable code. */
export interface CompiledCodeStmt extends CompiledStmtBase {
  run(ctx: ExecutionContext): Promise<CompiledStmtResult | void>;
}

/** Return value from a compiled statement. */
export type CompiledStmtResult =
  | GotoResult
  | GosubResult
  | ReturnResult
  | EndResult;

/** Type of a StatementResult. */
export enum CompiledStmtResultType {
  GOTO = 'goto',
  GOSUB = 'gosub',
  RETURN = 'return',
  END = 'end',
}

/** Jump to a label. */
export interface GotoResult {
  type: CompiledStmtResultType.GOTO;
  destLabel: string;
}

/** Push return address and jump to a label. */
export interface GosubResult {
  type: CompiledStmtResultType.GOSUB;
  destLabel: string;
}

/** Pop return address and jump to it (or another label if provided). */
export interface ReturnResult {
  type: CompiledStmtResultType.RETURN;
  destLabel?: string;
}

/** End execution. */
export interface EndResult {
  type: CompiledStmtResultType.END;
}

/** Compiled statement execution context. */
export interface ExecutionContext {
  runtime: Runtime;
  localVars: {[key: string]: any};
  tempVars: {[key: string]: any};
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
