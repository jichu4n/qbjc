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
  /** Array. Multi-dimensional arrays are represented as arrays of arrays. */
  ARRAY = 'array',
  /** User-defined record type. */
  TYPE = 'type',
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
  | {type: DataType.ARRAY; elementTypeSpec: DataTypeSpec}
  | {type: DataType.TYPE; fieldSpecs: Array<FieldSpec>};

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

// Helpers for type checking.

export function isNumeric(...types: Array<DataType | DataTypeSpec>) {
  return types.every((t) =>
    [
      DataType.INTEGER,
      DataType.LONG,
      DataType.SINGLE,
      DataType.DOUBLE,
    ].includes(getType(t))
  );
}

export function isString(...types: Array<DataType | DataTypeSpec>) {
  return types.every((t) => getType(t) === DataType.STRING);
}

export function isElementaryType(...types: Array<DataType | DataTypeSpec>) {
  return types.every((t) => isNumeric(t) || isString(t));
}

export function areMatchingElementaryTypes(
  ...types: Array<DataType | DataTypeSpec>
) {
  return isNumeric(...types) || isString(...types);
}

function getType(t: DataType | DataTypeSpec) {
  return typeof t === 'object' ? t.type : t;
}
