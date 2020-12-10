import Platform from './platform';
import {
  CompiledModule,
  CompiledStmt,
  CompiledStmtResult,
  CompiledStmtResultType,
  ExecutionContext,
} from './compiled-code';

export class ExecutionError extends Error {
  constructor(message: string, {stmt}: {stmt?: CompiledStmt} = {}) {
    super(message);
    if (stmt && stmt.loc) {
      this.message = `${stmt.loc.line}: ${this.message}`;
    }
  }
}

/** Manages the execution of a compiled program. */
export class Executor {
  constructor(private readonly platform: Platform) {}

  /** Executes a compiled module. */
  async executeModule(module: CompiledModule) {
    await this.executeStmts(module.stmts);
  }

  private async executeStmts(stmts: Array<CompiledStmt>) {
    const labelIdxMap = this.buildLabelIdxMap(stmts);

    const ctx: ExecutionContext = {
      platform: this.platform,
      localVars: {},
    };

    let nextStmtIdx = 0;
    while (nextStmtIdx < stmts.length) {
      let result: CompiledStmtResult | void;

      const nextStmt = stmts[nextStmtIdx];
      if ('run' in nextStmt) {
        result = await nextStmt.run(ctx);
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
