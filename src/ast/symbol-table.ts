import {DataTypeSpec} from '../lib/types';

/** Type of a variable symbol. */
export enum VarType {
  /** Regular variable. */
  VAR = 'var',
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

/** A variable in a symbol table. */
export interface VarSymbol {
  name: string;
  type: VarType;
  typeSpec: DataTypeSpec;
}

/** Symbol table for variables. */
export type VarSymbolTable = Array<VarSymbol>;

export function lookupSymbol(varSymbolTable: VarSymbolTable, name: string) {
  return varSymbolTable.find((symbol) => symbol.name === name) ?? null;
}

export function addSymbol(
  varSymbolTable: VarSymbolTable,
  ...symbols: Array<VarSymbol>
) {
  varSymbolTable.push(...symbols);
}
