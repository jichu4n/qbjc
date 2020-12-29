import ErrorWithLoc from '../lib/error-with-loc';
import {lookupSymbol, VarSymbolTable, VarType} from '../lib/symbol-table';
import {
  DataType,
  DataTypeSpec,
  ElementaryTypeSpec,
  ELEMENTARY_TYPE_INIT_VALUES,
  isElementaryType,
  ProcType,
  procTypeName,
} from '../lib/types';
import {
  ArgsContainer,
  CompiledModule,
  CompiledStmt,
  ExecutionContext,
  ExecutionDirective,
  ExecutionDirectiveType,
  Ptr,
  VarContainer,
} from './compiled-code';
import Runtime, {RuntimePlatform} from './runtime';
import QbArray from './qb-array';

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
    this.localStaticVarsMap = {};
    const ctx: ExecutionContext = {
      runtime: new Runtime(this.platform),
      executeProc: this.executeProc.bind(this),
      args: {},
      localVars: this.initVars(module.localSymbols, [
        VarType.VAR,
        VarType.CONST,
      ]),
      localStaticVars: {},
      globalVars: this.initVars(module.globalSymbols, [
        VarType.VAR,
        VarType.CONST,
      ]),
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
    } finally {
      this.currentModule = null;
      this.localStaticVarsMap = {};
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

    // Init args.
    if (argPtrs.length !== proc.paramSymbols.length) {
      throw new Error(
        'Incorrect number of arguments to ' +
          `${procTypeName(proc.type)} "${proc.name}": ` +
          `expected ${proc.paramSymbols.length}, got ${argPtrs.length}`
      );
    }
    const args: ArgsContainer = {};
    for (let i = 0; i < argPtrs.length; ++i) {
      args[proc.paramSymbols[i].name] = argPtrs[i];
    }

    // Init static vars.
    if (!this.localStaticVarsMap[name]) {
      this.localStaticVarsMap[name] = this.initVars(proc.localSymbols, [
        VarType.STATIC_VAR,
      ]);
    }

    // Execute statements.
    const ctx: ExecutionContext = {
      ...prevCtx,
      args,
      localVars: this.initVars(proc.localSymbols, [VarType.VAR, VarType.CONST]),
      localStaticVars: this.localStaticVarsMap[name],
      tempVars: {},
    };
    await this.executeStmts(ctx, proc.stmts);

    // Return value.
    if (proc.type === ProcType.FN) {
      if (!(name in ctx.localVars)) {
        throw new Error(
          `${procTypeName(proc.type)} "${proc.name}" did not return a value`
        );
      }
      return ctx.localVars[name];
    }
  }

  private initVars(
    varSymbolTable: VarSymbolTable,
    includeVarTypes: Array<VarType>
  ): VarContainer {
    const container: VarContainer = {};
    for (const symbol of varSymbolTable) {
      if (!includeVarTypes.includes(symbol.varType)) {
        continue;
      }
      container[symbol.name] = this.getInitValue(symbol.typeSpec);
    }
    return container;
  }

  private getInitValue(typeSpec: DataTypeSpec): any {
    const {type: dataType} = typeSpec;
    if (isElementaryType(dataType)) {
      return ELEMENTARY_TYPE_INIT_VALUES[dataType];
    }
    switch (typeSpec.type) {
      case DataType.ARRAY:
        return new QbArray(typeSpec);
      default:
        throw new Error(`Unknown type: ${typeSpec}`);
    }
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
        case ExecutionDirectiveType.EXIT_PROC:
          stmtIdx = stmts.length;
          break;
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

  /** Static vars by proc name. */
  private localStaticVarsMap: {[key: string]: VarContainer} = {};
}
