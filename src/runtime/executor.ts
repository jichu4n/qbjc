import {
  CompiledModule,
  CompiledStmt,
  CompiledStmtResult,
  CompiledStmtResultType,
  ExecutionContext,
} from './compiled-code';
import Runtime, {RuntimePlatform} from './runtime';

export class ExecutionError extends Error {
  constructor(message: string, {stmt}: {stmt?: CompiledStmt} = {}) {
    super(message);
    if (stmt && stmt.loc) {
      this.message = `${stmt.loc.line}: ${this.message}`;
    }
  }
}

/** Manages the execution of a compiled program. */
export default class Executor {
  constructor(private readonly platform: RuntimePlatform) {}

  /** Executes a compiled module. */
  async executeModule(module: CompiledModule) {
    await this.executeStmts(module.stmts);
  }

  private async executeStmts(stmts: Array<CompiledStmt>) {
    const labelIdxMap = this.buildLabelIdxMap(stmts);

    const ctx: ExecutionContext = {
      runtime: new Runtime(this.platform),
      localVars: {},
    };

    let nextStmtIdx = 0;
    while (nextStmtIdx < stmts.length) {
      let result: CompiledStmtResult | void;

      const nextStmt = stmts[nextStmtIdx];
      if ('run' in nextStmt) {
        try {
          result = await nextStmt.run(ctx);
        } catch (e) {
          throw new ExecutionError(e.message, {stmt: nextStmt});
        }
      }

      if (!result) {
        ++nextStmtIdx;
        continue;
      }
      switch (result.type) {
        case CompiledStmtResultType.GOTO:
          nextStmtIdx = labelIdxMap[result.destLabel];
          if (nextStmtIdx === undefined) {
            throw new ExecutionError(`Label not found: "${result.destLabel}"`, {
              stmt: nextStmt,
            });
          }
          break;
        default:
          throw new ExecutionError(
            `Unrecognized statement result: ${JSON.stringify(result)}`,
            {stmt: nextStmt}
          );
      }
    }
  }

  private buildLabelIdxMap(stmts: Array<CompiledStmt>) {
    const labelIdxMap: {[key: string]: number} = {};
    stmts.forEach((stmt, idx) => {
      if ('label' in stmt) {
        if (stmt.label in labelIdxMap) {
          throw new ExecutionError(`Found duplicate label "${stmt.label}"`, {
            stmt,
          });
        }
        labelIdxMap[stmt.label] = idx;
      }
    });
    return labelIdxMap;
  }
}
