import {isString, isNumeric, DataTypeSpec, typeSpecName} from './types';

/** A constant defined by a DATA statement.
 *
 * The format is [[line, col], value].
 *
 * We use this shortened form instead of JSON due to the highly repetitive nature of these items.
 */
export type DataItem = [[number, number], DataItemValue];

/** A sequence of DataItems. */
export type DataItems = Array<DataItem>;

/** Actual value of a DataItem. */
export type DataItemValue = number | string | null;

export function dataItemTypeName([_, value]: DataItem) {
  return value === null ? 'null' : typeof value;
}

/** Converts a data item to the expected type. */
export function getDataItem(item: DataItem, expectedTypeSpec: DataTypeSpec) {
  const [_, value] = item;
  if (isNumeric(expectedTypeSpec)) {
    switch (typeof value) {
      case 'number':
        return value;
      case 'object':
        return 0;
      default:
        throwDataItemTypeError(item, expectedTypeSpec);
    }
  } else if (isString(expectedTypeSpec)) {
    switch (typeof value) {
      case 'string':
        return value;
      case 'object':
        return '';
      default:
        throwDataItemTypeError(item, expectedTypeSpec);
    }
  } else {
    throw new Error(
      `Unknown expected type spec: ${JSON.stringify(expectedTypeSpec)}`
    );
  }
}

function throwDataItemTypeError(
  item: DataItem,
  expectedTypeSpec: DataTypeSpec
): never {
  const [[line, col], _] = item;
  throw new Error(
    `expected ${typeSpecName(expectedTypeSpec)}, ` +
      `got ${dataItemTypeName(item)} data item ` +
      `(defined at ${line}:${col})`
  );
}
