import {DataItem, getDataItem} from '../lib/data-item';
import ErrorWithLoc from '../lib/error-with-loc';
import {lookupSymbol, VarSymbolTable, VarType} from '../lib/symbol-table';
import {DataTypeSpec, isFnOrDefFn, ProcType, procTypeName} from '../lib/types';
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
import initValue from './init-value';
import Runtime, {RuntimePlatform} from './runtime';

/** Options for compiled program execution. */
export interface ExecutionOpts {
  /** Delay before executing each statement, in microseconds. */
  stmtExecutionDelayUs?: number;
}

/** Map from label name to statement array index. */
type LabelIndexMap = {[key: string]: number};

/** State for a GOSUB invocation. */
interface GosubState {
  /** Index of statement to return to. */
  nextStmtIdx: number;
}

/** Read cursor for DATA statements. */
interface DataCursor {
  stmtIdx: number;
  itemIdx: number;
}

export class ExecutionError extends ErrorWithLoc {
  constructor(
    message: string,
    {
      module,
      stmt,
      cause,
    }: {module?: CompiledModule | null; stmt?: CompiledStmt; cause?: Error} = {}
  ) {
    super(message, {
      sourceFileName: module?.sourceFileName,
      loc: stmt?.loc ? {line: stmt.loc[0], col: stmt.loc[1]} : undefined,
      cause,
    });
  }
}

/** Exception thrown to signal program termination via END. */
class EndDirective extends Error {
  isEndDirective = true;
}

/** Manages the execution of a compiled program. */
export default class Executor {
  constructor(
    private readonly platform: RuntimePlatform,
    {stmtExecutionDelayUs}: ExecutionOpts = {}
  ) {
    this.stmtExecutionDelayUs =
      stmtExecutionDelayUs ?? platform.defaultStmtExecutionDelayUs;
  }

  /** Executes a compiled module. */
  async executeModule(moduleOrCode: CompiledModule | string) {
    const module =
      typeof moduleOrCode === 'string'
        ? await this.platform.loadCompiledModule(moduleOrCode)
        : moduleOrCode;
    this.currentModule = module;
    this.buildLabelIndexMaps();
    this.localStaticVarsMap = {};
    this.restore();
    this.platform.shouldStopExecution = false;
    await this.platform.setCursorVisibility(false);

    const ctx: ExecutionContext = {
      runtime: new Runtime(this.platform),
      executeProc: this.executeProc.bind(this),
      read: this.read.bind(this),
      restore: this.restore.bind(this),
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
      await this.executeStmts(ctx, module.stmts, this.moduleLabelIndexMap);
    } catch (e: any) {
      if (e.isEndDirective) {
        // Swallow error
      } else {
        throw e;
      }
    } finally {
      this.currentModule = null;
      this.moduleLabelIndexMap = {};
      this.procLabelIndexMap = {};
      this.localStaticVarsMap = {};
      this.restore();
      this.platform.shouldStopExecution = false;
      await this.platform.setCursorVisibility(true);
    }
  }

  /** Sets flag to stop execution. */
  stopExecution() {
    this.platform.shouldStopExecution = true;
  }

  private async executeProc(
    prevCtx: ExecutionContext,
    name: string,
    ...argPtrs: Array<Ptr>
  ) {
    const proc = lookupSymbol(this.currentModule!.procs, name);
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
    if (!this.localStaticVarsMap[proc.name]) {
      this.localStaticVarsMap[proc.name] = this.initVars(proc.localSymbols, [
        VarType.STATIC_VAR,
      ]);
    }

    // Execute statements.
    const ctx: ExecutionContext = {
      ...prevCtx,
      args,
      localVars: this.initVars(proc.localSymbols, [VarType.VAR, VarType.CONST]),
      localStaticVars: this.localStaticVarsMap[proc.name],
      tempVars: {},
    };
    if (!this.procLabelIndexMap[proc.name]) {
      throw new Error(`Label index map not found for "${proc.name}"`);
    }
    await this.executeStmts(ctx, proc.stmts, this.procLabelIndexMap[proc.name]);

    // Return value.
    if (isFnOrDefFn(proc.type)) {
      return ctx.localVars[proc.name];
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
      container[symbol.name] = initValue(symbol.typeSpec);
    }
    return container;
  }

  private async executeStmts(
    ctx: ExecutionContext,
    stmts: Array<CompiledStmt>,
    labelIndexMap: LabelIndexMap
  ) {
    /** Return address stack for GOSUB / RETURN. */
    const gosubStates: Array<GosubState> = [];

    /** Index of the current statement to execute. */
    let stmtIdx = 0;
    while (stmtIdx < stmts.length) {
      if (this.platform.shouldStopExecution) {
        this.platform.shouldStopExecution = false;
        throw new EndDirective();
      }

      const stmt = stmts[stmtIdx];
      const errorArgs = {module: this.currentModule, stmt};

      // 0. Delay execution.
      if (this.stmtExecutionDelayUs > 0) {
        await this.platform.delay(this.stmtExecutionDelayUs);
      }

      // 1. Execute statement.
      let directive: ExecutionDirective | void;
      if ('run' in stmt) {
        try {
          directive = await stmt.run(ctx);
        } catch (e: any) {
          if (e.isEndDirective) {
            throw e;
          } else {
            throw new ExecutionError(e.message, {...errorArgs, cause: e});
          }
        }
      }

      if (!directive) {
        ++stmtIdx;
        continue;
      }

      const gotoLabel = (label: string) => {
        stmtIdx = labelIndexMap[label];
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

  private async read(
    ...resultTypes: Array<DataTypeSpec>
  ): Promise<Array<string | number>> {
    const results: Array<string | number> = [];
    for (let i = 0; i < resultTypes.length; ++i) {
      const dataItem = this.getNextDataItem();
      if (!dataItem) {
        throw new Error(`Data exhausted at item ${i + 1}`);
      }
      try {
        results.push(getDataItem(dataItem, resultTypes[i]));
      } catch (e: any) {
        e.message = `Error reading item ${i + 1}: ${e.message}`;
        throw e;
      }
    }
    return results;
  }

  private getNextDataItem(): DataItem | null {
    const {stmts} = this.currentModule!;
    for (;;) {
      if (this.dataCursor.stmtIdx >= stmts.length) {
        return null;
      }
      const stmt = stmts[this.dataCursor.stmtIdx];
      if (!('data' in stmt)) {
        ++this.dataCursor.stmtIdx;
        continue;
      }
      if (this.dataCursor.itemIdx >= stmt.data.length) {
        ++this.dataCursor.stmtIdx;
        this.dataCursor.itemIdx = 0;
        continue;
      }
      return stmt.data[this.dataCursor.itemIdx++];
    }
  }

  private async restore(destLabel?: string) {
    if (destLabel) {
      const stmtIdx = this.moduleLabelIndexMap[destLabel];
      if (stmtIdx === undefined) {
        throw new Error(`Label not found: "${destLabel}"`);
      }
      [this.dataCursor.stmtIdx, this.dataCursor.itemIdx] = [stmtIdx, 0];
    } else {
      [this.dataCursor.stmtIdx, this.dataCursor.itemIdx] = [0, 0];
    }
  }

  private buildLabelIndexMaps() {
    this.moduleLabelIndexMap = this.buildLabelIndexMap(
      this.currentModule!.stmts
    );
    for (const {name, stmts} of this.currentModule!.procs) {
      this.procLabelIndexMap[name] = this.buildLabelIndexMap(stmts);
    }
  }

  private buildLabelIndexMap(stmts: Array<CompiledStmt>) {
    const labelIndexMap: {[key: string]: number} = {};
    stmts.forEach((stmt, idx) => {
      if ('label' in stmt) {
        if (stmt.label in labelIndexMap) {
          throw new ExecutionError(`Duplicate label "${stmt.label}"`, {
            module: this.currentModule,
            stmt,
          });
        }
        labelIndexMap[stmt.label] = idx;
      }
    });
    return labelIndexMap;
  }

  /** Delay before executing each statement, in microseconds. */
  private readonly stmtExecutionDelayUs: number;

  /** Current module being executed. */
  private currentModule: CompiledModule | null = null;

  /** Static vars, indexed by proc name. */
  private localStaticVarsMap: {[key: string]: VarContainer} = {};

  /** Label index map for module-level statements. */
  private moduleLabelIndexMap: LabelIndexMap = {};
  /** Label index map for procs. */
  private procLabelIndexMap: {[key: string]: LabelIndexMap} = {};

  /** Cursor for READ. */
  private dataCursor: DataCursor = {
    stmtIdx: 0,
    itemIdx: 0,
  };
}
