/** Overall type of the value. */
export enum DataType {
  /** 16-bit integer */
  INTEGER = 'integer',
  /** 32-bit integer */
  LONG = 'long',
  /** 32-bit floating point. */
  SINGLE = 'single',
  /** 64-bit floating point. */
  DOUBLE = 'double',
  /** String. */
  STRING = 'string',
  /** Array. */
  ARRAY = 'array',
  /** User-defined record type. */
  UDT = 'udt',
}

/** Specification for a field in a user-defined record type. */
export interface FieldSpec {
  name: string;
  typeSpec: DataTypeSpec;
}

/** Full data type specification. */
export type DataTypeSpec =
  | {
      type:
        | DataType.INTEGER
        | DataType.LONG
        | DataType.SINGLE
        | DataType.DOUBLE
        | DataType.STRING;
    }
  | ArrayTypeSpec
  | UdtTypeSpec;

export interface ArrayTypeSpec {
  type: DataType.ARRAY;
  elementTypeSpec: DataTypeSpec;
  arraySpec: ArraySpec;
}

/** Specification for a single dimension of an array. */
export interface ArrayDimensionSpec {
  minIdx: number;
  maxIdx: number;
}

/** Specification for array dimensions. */
export type ArraySpec = Array<ArrayDimensionSpec>;

export interface UdtTypeSpec {
  type: DataType.UDT;
  fieldSpecs: Array<FieldSpec>;
}

// Helpers for creating DataTypeSpec instances.

export function integerSpec(): DataTypeSpec {
  return {type: DataType.INTEGER};
}

export function longSpec(): DataTypeSpec {
  return {type: DataType.LONG};
}

export function singleSpec(): DataTypeSpec {
  return {type: DataType.SINGLE};
}

export function doubleSpec(): DataTypeSpec {
  return {type: DataType.DOUBLE};
}

export function stringSpec(): DataTypeSpec {
  return {type: DataType.STRING};
}

export function arraySpec(
  elementTypeSpec: DataTypeSpec,
  arraySpec: ArraySpec
): DataTypeSpec {
  return {type: DataType.ARRAY, elementTypeSpec, arraySpec};
}

// Helpers for type checking.

export function isNumeric(t: DataType | DataTypeSpec) {
  return [
    DataType.INTEGER,
    DataType.LONG,
    DataType.SINGLE,
    DataType.DOUBLE,
  ].includes(getType(t));
}

export function isString(
  t: DataType | DataTypeSpec
): t is DataType.STRING | {type: DataType.STRING} {
  return getType(t) === DataType.STRING;
}

export function isArray(
  t: DataType | DataTypeSpec
): t is DataType.ARRAY | ArrayTypeSpec {
  return getType(t) === DataType.ARRAY;
}

export function isElementaryType(...types: Array<DataType | DataTypeSpec>) {
  return types.every((t) => isNumeric(t) || isString(t));
}

export function areMatchingElementaryTypes(
  ...types: Array<DataType | DataTypeSpec>
) {
  return types.every(isNumeric) || types.every(isString);
}

function getType(t: DataType | DataTypeSpec) {
  return typeof t === 'object' ? t.type : t;
}

/** Type of a procedure. */
export enum ProcType {
  /** SUB procedure. */
  SUB = 'sub',
  /** FUNCTION procedure. */
  FN = 'fn',
}

/** Returns the user-facing name of a ProcType. */
export function procTypeName(procType: ProcType) {
  const NAMES = {
    [ProcType.SUB]: 'SUB procedure',
    [ProcType.FN]: 'FUNCTION procedure',
  };
  return NAMES[procType];
}

/** The type of a function definition. */
export enum FnDefType {
  /** Built-in function. */
  BUILTIN = 'builtin',
  /** User-defined function in the current module. */
  MODULE = 'module',
}
