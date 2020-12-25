import {
  CompiledModule,
  CompiledStmt,
  CompiledStmtResult,
  CompiledStmtResultType,
  ExecutionContext,
} from './compiled-code';
import Runtime, {RuntimePlatform} from './runtime';
import ErrorWithLoc from '../lib/error-with-loc';

/** State for a GOSUB invocation. */
interface GosubState {
  /** Index of statement to return to. */
  nextStmtIdx: number;
}

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
    /** Return address stack for GOSUB / RETURN. */
    const gosubStates: Array<GosubState> = [];

    /** Index of the current statement to execute. */
    let stmtIdx = 0;
    while (stmtIdx < stmts.length) {
      const stmt = stmts[stmtIdx];
      const errorArgs = {module: this.currentModule, stmt};

      // 1. Execute statement.
      let result: CompiledStmtResult | void;
      if ('run' in stmt) {
        try {
          result = await stmt.run(ctx);
        } catch (e) {
          throw new ExecutionError(e.message, errorArgs);
        }
      }

      if (!result) {
        ++stmtIdx;
        continue;
      }

      const gotoLabel = (label: string) => {
        stmtIdx = labelIdxMap[label];
        if (stmtIdx === undefined) {
          throw new ExecutionError(`Label not found: "${label}"`, errorArgs);
        }
      };
      switch (result.type) {
        case CompiledStmtResultType.GOSUB:
          gosubStates.push({
            nextStmtIdx: stmtIdx + 1,
          });
          gotoLabel(result.destLabel);
          break;
        case CompiledStmtResultType.GOTO:
          gotoLabel(result.destLabel);
          break;
        case CompiledStmtResultType.RETURN:
          if (gosubStates.length === 0) {
            throw new ExecutionError(`RETURN without prior GOSUB`, errorArgs);
          }
          const gosubState = gosubStates.pop()!;
          if (result.destLabel) {
            gotoLabel(result.destLabel);
          } else {
            stmtIdx = gosubState.nextStmtIdx;
          }
          break;
        case CompiledStmtResultType.END:
          stmtIdx = stmts.length;
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
