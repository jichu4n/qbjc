import {DataTypeSpec} from './types';

/** Type of a variable symbol. */
export enum VarType {
  /** Regular variable. */
  VAR = 'var',
  /** Static variable. */
  STATIC_VAR = 'staticVar',
  /** Constant. */
  CONST = 'const',
  /** FUNCTION or SUB argument. */
  ARG = 'arg',
}

/** Scope of a variable symbol. */
export enum VarScope {
  LOCAL = 'local',
  GLOBAL = 'global',
}

interface VarSymbolBase {
  name: string;
  typeSpec: DataTypeSpec;
}

interface LocalVarSymbol extends VarSymbolBase {
  varType: VarType.STATIC_VAR | VarType.ARG;
  varScope: VarScope.LOCAL;
}

interface LocalOrGlobalVarSymbol extends VarSymbolBase {
  varType: VarType.VAR | VarType.CONST;
  varScope: VarScope.LOCAL | VarScope.GLOBAL;
}

/** A variable in a symbol table. */
export type VarSymbol = LocalVarSymbol | LocalOrGlobalVarSymbol;

/** Symbol table for variables. */
export type VarSymbolTable = Array<VarSymbol>;

export function lookupSymbol<T extends {name: string}>(
  symbolTable: Array<T>,
  name: string
) {
  return symbolTable.find((symbol) => symbol.name === name) ?? null;
}
