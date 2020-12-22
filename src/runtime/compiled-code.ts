import Runtime from './runtime';

/** A compiled module produced by CodeGenerator. */
export interface CompiledModule {
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
export type CompiledStmtResult = GotoResult;

/** Type of a StatementResult. */
export enum CompiledStmtResultType {
  GOTO = 'goto',
}

/** Jump to a label. */
export interface GotoResult {
  type: CompiledStmtResultType.GOTO;
  destLabel: string;
}

/** Compiled statement execution context. */
export interface ExecutionContext {
  runtime: Runtime;
  localVars: {[key: string]: any};
}
