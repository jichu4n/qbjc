import {DataType, DataTypeSpec, isElementaryType} from '../lib/types';
import QbArray from './qb-array';
import QbUdt from './qb-udt';

/** Initial value for elementary data types. */
const ELEMENTARY_TYPE_INIT_VALUES = {
  [DataType.INTEGER]: 0,
  [DataType.LONG]: 0,
  [DataType.SINGLE]: 0.0,
  [DataType.DOUBLE]: 0.0,
  [DataType.STRING]: '',
};

export default function initValue(typeSpec: DataTypeSpec) {
  const {type: dataType} = typeSpec;
  if (isElementaryType(dataType)) {
    return ELEMENTARY_TYPE_INIT_VALUES[dataType];
  }
  switch (typeSpec.type) {
    case DataType.ARRAY:
      return new QbArray(typeSpec);
    case DataType.UDT:
      return new QbUdt(typeSpec);
    default:
      throw new Error(`Unknown type: ${JSON.stringify(typeSpec)}`);
  }
}
