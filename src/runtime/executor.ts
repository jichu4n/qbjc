import ErrorWithLoc from '../lib/error-with-loc';
import {
  ArgsContainer,
  CompiledModule,
  CompiledProcType,
  CompiledStmt,
  ExecutionContext,
  ExecutionDirective,
  ExecutionDirectiveType,
  Ptr,
  VarContainer,
} from './compiled-code';
import Runtime, {RuntimePlatform} from './runtime';
import {lookupSymbol, VarSymbolTable} from '../lib/symbol-table';
import {DataType} from '../lib/types';

/** State for a GOSUB invocation. */
interface GosubState {
  /** Index of statement to return to. */
  nextStmtIdx: number;
}

/** Initial value for each data type. */
const INIT_VALUE_MAP = {
  [DataType.INTEGER]: 0,
  [DataType.LONG]: 0,
  [DataType.SINGLE]: 0.0,
  [DataType.DOUBLE]: 0.0,
  [DataType.STRING]: '',
};

export class ExecutionError extends ErrorWithLoc {
  constructor(
    message: string,
    {module, stmt}: {module?: CompiledModule | null; stmt?: CompiledStmt} = {}
  ) {
    super(message, {
      sourceFileName: module?.sourceFileName,
      loc: stmt?.loc ? {line: stmt.loc[0], col: stmt.loc[1]} : undefined,
    });
  }
}

/** Exception thrown to signal program termination via END. */
class EndDirective extends Error {
  isEndDirective = true;
}

/** Manages the execution of a compiled program. */
export default class Executor {
  constructor(private readonly platform: RuntimePlatform) {}

  /** Executes a compiled module. */
  async executeModule(module: CompiledModule) {
    this.currentModule = module;
    const ctx: ExecutionContext = {
      runtime: new Runtime(this.platform),
      executeProc: this.executeProc.bind(this),
      args: {},
      localVars: this.initVars(module.localSymbols),
      globalVars: this.initVars(module.globalSymbols),
      tempVars: {},
    };
    try {
      await this.executeStmts(ctx, module.stmts);
    } catch (e) {
      if (e.isEndDirective) {
        // Swallow error
      } else {
        throw e;
      }
    }
  }

  private async executeProc(
    prevCtx: ExecutionContext,
    name: string,
    ...argPtrs: Array<Ptr>
  ) {
    const proc = lookupSymbol(this.currentModule?.procs ?? [], name);
    if (!proc) {
      throw new Error(`Procedure not found: "${name}"`);
    }
    if (argPtrs.length !== proc.paramSymbols.length) {
      throw new Error(
        `Incorrect number of arguments to "${proc.name}": ` +
          `expected ${proc.paramSymbols.length}, got ${argPtrs.length}`
      );
    }
    const args: ArgsContainer = {};
    for (let i = 0; i < argPtrs.length; ++i) {
      args[proc.paramSymbols[i].name] = argPtrs[i];
    }

    const ctx: ExecutionContext = {
      ...prevCtx,
      args,
      localVars: this.initVars(proc.localSymbols),
      tempVars: {},
    };
    await this.executeStmts(ctx, proc.stmts);

    if (proc.type === CompiledProcType.FN) {
      if (!(name in ctx.localVars)) {
        throw new Error(`Function ${proc.name} did not return a value`);
      }
      return ctx.localVars[name];
    }
  }

  private initVars(varSymbolTable: VarSymbolTable): VarContainer {
    const container: VarContainer = {};
    for (const symbol of varSymbolTable) {
      const {type} = symbol.typeSpec;
      if (type in INIT_VALUE_MAP) {
        container[symbol.name] =
          INIT_VALUE_MAP[type as keyof typeof INIT_VALUE_MAP];
      } else {
        throw new Error(`Symbol "${symbol.name}" has type: ${symbol.typeSpec}`);
      }
    }
    return container;
  }

  private async executeStmts(
    ctx: ExecutionContext,
    stmts: Array<CompiledStmt>
  ) {
    // TODO: Cache this.
    const labelIdxMap = this.buildLabelIdxMap(stmts);

    /** Return address stack for GOSUB / RETURN. */
    const gosubStates: Array<GosubState> = [];

    /** Index of the current statement to execute. */
    let stmtIdx = 0;
    while (stmtIdx < stmts.length) {
      const stmt = stmts[stmtIdx];
      const errorArgs = {module: this.currentModule, stmt};

      // 1. Execute statement.
      let directive: ExecutionDirective | void;
      if ('run' in stmt) {
        try {
          directive = await stmt.run(ctx);
        } catch (e) {
          if (e.isEndDirective) {
            throw e;
          } else {
            throw new ExecutionError(e.message, errorArgs);
          }
        }
      }

      if (!directive) {
        ++stmtIdx;
        continue;
      }

      const gotoLabel = (label: string) => {
        stmtIdx = labelIdxMap[label];
        if (stmtIdx === undefined) {
          throw new ExecutionError(`Label not found: "${label}"`, errorArgs);
        }
      };
      switch (directive.type) {
        case ExecutionDirectiveType.GOSUB:
          gosubStates.push({
            nextStmtIdx: stmtIdx + 1,
          });
          gotoLabel(directive.destLabel);
          break;
        case ExecutionDirectiveType.GOTO:
          gotoLabel(directive.destLabel);
          break;
        case ExecutionDirectiveType.RETURN:
          if (gosubStates.length === 0) {
            throw new ExecutionError(`RETURN without prior GOSUB`, errorArgs);
          }
          const gosubState = gosubStates.pop()!;
          if (directive.destLabel) {
            gotoLabel(directive.destLabel);
          } else {
            stmtIdx = gosubState.nextStmtIdx;
          }
          break;
        case ExecutionDirectiveType.END:
          throw new EndDirective();
        default:
          throw new ExecutionError(
            `Unrecognized execution directive: ${JSON.stringify(directive)}`,
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
