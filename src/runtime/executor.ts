import {
  CompiledModule,
  CompiledStmt,
  CompiledStmtResult,
  CompiledStmtResultType,
  ExecutionContext,
} from './compiled-code';
import Runtime, {RuntimePlatform} from './runtime';
import ErrorWithLoc from '../lib/error-with-loc';

export class ExecutionError extends ErrorWithLoc {
  constructor(
    message: string,
    {module, stmt}: {module?: CompiledModule | null; stmt?: CompiledStmt} = {}
  ) {
    super(message, {sourceFileName: module?.sourceFileName, loc: stmt?.loc});
  }
}

/** Manages the execution of a compiled program. */
export default class Executor {
  constructor(private readonly platform: RuntimePlatform) {}

  /** Executes a compiled module. */
  async executeModule(module: CompiledModule) {
    this.currentModule = module;
    await this.executeStmts(module.stmts);
  }

  private async executeStmts(stmts: Array<CompiledStmt>) {
    const labelIdxMap = this.buildLabelIdxMap(stmts);

    const ctx: ExecutionContext = {
      runtime: new Runtime(this.platform),
      localVars: {},
      tempVars: {},
    };

    let nextStmtIdx = 0;
    while (nextStmtIdx < stmts.length) {
      const stmt = stmts[nextStmtIdx];
      const errorArgs = {module: this.currentModule, stmt};

      let result: CompiledStmtResult | void;
      if ('run' in stmt) {
        try {
          result = await stmt.run(ctx);
        } catch (e) {
          throw new ExecutionError(e.message, errorArgs);
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
            throw new ExecutionError(
              `Label not found: "${result.destLabel}"`,
              errorArgs
            );
          }
          break;
        default:
          throw new ExecutionError(
            `Unrecognized statement result: ${JSON.stringify(result)}`,
            errorArgs
          );
      }
    }
  }

  private buildLabelIdxMap(stmts: Array<CompiledStmt>) {
    const labelIdxMap: {[key: string]: number} = {};
    stmts.forEach((stmt, idx) => {
      if ('label' in stmt) {
        if (stmt.label in labelIdxMap) {
          throw new ExecutionError(`Duplicate label "${stmt.label}"`, {
            module: this.currentModule,
            stmt,
          });
        }
        labelIdxMap[stmt.label] = idx;
      }
    });
    return labelIdxMap;
  }

  /** Current module being executed. */
  private currentModule: CompiledModule | null = null;
}
