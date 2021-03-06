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
  /** User-defined data type, a.k.a. records. */
  UDT = 'udt',
}

export type NumericDataType =
  | DataType.INTEGER
  | DataType.LONG
  | DataType.SINGLE
  | DataType.DOUBLE;

export type ElementaryDataType = NumericDataType | DataType.STRING;

export type SingularDataType = ElementaryDataType | DataType.UDT;

/** Full data type specification. */
export type DataTypeSpec = SingularTypeSpec | ArrayTypeSpec;

export type SingularTypeSpec = ElementaryTypeSpec | UdtTypeSpec;

export type ElementaryTypeSpec = NumericTypeSpec | StringTypeSpec;

export interface NumericTypeSpec {
  type: NumericDataType;
}

export interface StringTypeSpec {
  type: DataType.STRING;
}

export interface ArrayTypeSpec {
  type: DataType.ARRAY;
  elementTypeSpec: SingularTypeSpec;
  dimensionSpecs: Array<ArrayDimensionSpec>;
}

/** Specification for a single dimension of an array.
 *
 * The format is [minIdx, maxIdx].
 */
export type ArrayDimensionSpec = [number, number];

export interface UdtTypeSpec {
  type: DataType.UDT;
  name: string;
  fieldSpecs: Array<FieldSpec>;
}

/** Specification for a field in a user-defined record type. */
export interface FieldSpec {
  name: string;
  typeSpec: SingularTypeSpec;
}

// Helpers for creating DataTypeSpec instances.

export function integerSpec(): NumericTypeSpec {
  return {type: DataType.INTEGER};
}

export function longSpec(): NumericTypeSpec {
  return {type: DataType.LONG};
}

export function singleSpec(): NumericTypeSpec {
  return {type: DataType.SINGLE};
}

export function doubleSpec(): NumericTypeSpec {
  return {type: DataType.DOUBLE};
}

export function stringSpec(): StringTypeSpec {
  return {type: DataType.STRING};
}

export function arraySpec(
  elementTypeSpec: SingularTypeSpec,
  dimensionSpecs: Array<ArrayDimensionSpec>
): ArrayTypeSpec {
  return {type: DataType.ARRAY, elementTypeSpec, dimensionSpecs};
}

// Helpers for type checking.

export function isNumeric(
  t: DataType | DataTypeSpec
): t is NumericDataType | NumericTypeSpec {
  return [
    DataType.INTEGER,
    DataType.LONG,
    DataType.SINGLE,
    DataType.DOUBLE,
  ].includes(getType(t));
}

export function isIntegral(
  t: DataType | DataTypeSpec
): t is DataType.INTEGER | DataType.LONG | NumericTypeSpec {
  return [DataType.INTEGER, DataType.LONG].includes(getType(t));
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

export function isElementaryType(
  t: DataType | DataTypeSpec
): t is ElementaryDataType | ElementaryTypeSpec {
  return isNumeric(t) || isString(t);
}

export function isUdt(
  t: DataType | DataTypeSpec
): t is DataType.UDT | UdtTypeSpec {
  return getType(t) === DataType.UDT;
}

export function isSingularType(
  t: DataType | DataTypeSpec
): t is SingularDataType | SingularTypeSpec {
  return isElementaryType(t) || isUdt(t);
}

export function areMatchingElementaryTypes(
  typeSpec1: DataTypeSpec,
  typeSpec2: DataTypeSpec
) {
  return (
    (isNumeric(typeSpec1) && isNumeric(typeSpec2)) ||
    (isString(typeSpec1) && isString(typeSpec2))
  );
}

export function areMatchingSingularTypes(
  typeSpec1: DataTypeSpec,
  typeSpec2: DataTypeSpec
) {
  return (
    areMatchingElementaryTypes(typeSpec1, typeSpec2) ||
    (isUdt(typeSpec1) && isUdt(typeSpec2) && typeSpec1.name === typeSpec2.name)
  );
}

export function typeSpecName(t: DataTypeSpec): string {
  switch (t.type) {
    case DataType.ARRAY:
      return `${typeSpecName(t.elementTypeSpec)} array`;
    case DataType.UDT:
      return `"${t.name}"`;
    default:
      return t.type;
  }
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
  /** DEF FN procedure. */
  DEF_FN = 'defFn',
}

export function isFnOrDefFn(
  procType: ProcType
): procType is ProcType.FN | ProcType.DEF_FN {
  return procType === ProcType.FN || procType === ProcType.DEF_FN;
}

/** Returns the user-facing name of a ProcType. */
export function procTypeName(procType: ProcType) {
  const NAMES = {
    [ProcType.SUB]: 'SUB procedure',
    [ProcType.FN]: 'FUNCTION procedure',
    [ProcType.DEF_FN]: 'DEF FN procedure',
  };
  return NAMES[procType];
}

/** The type of a procedure definition. */
export enum ProcDefType {
  /** Built-in function. */
  BUILTIN = 'builtin',
  /** User-defined function in the current module. */
  MODULE = 'module',
}
