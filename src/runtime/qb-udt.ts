import {isUdt, UdtTypeSpec} from '../lib/types';
import initValue from './init-value';

/** Runtime representation for QBasic user-defined types. */
class QbUdt {
  constructor(udtTypeSpec: UdtTypeSpec) {
    this._typeSpec = {...udtTypeSpec};
    this.init();
  }

  private init() {
    for (const fieldSpec of this._typeSpec.fieldSpecs) {
      this._values[fieldSpec.name] = initValue(fieldSpec.typeSpec);
    }
  }

  clone(): QbUdt {
    const newQbUdt = new QbUdt(this._typeSpec);
    for (const fieldSpec of this._typeSpec.fieldSpecs) {
      const value = this._values[fieldSpec.name];
      newQbUdt._values[fieldSpec.name] = isUdt(fieldSpec.typeSpec)
        ? (value as QbUdt).clone()
        : value;
    }
    return newQbUdt;
  }

  get values() {
    return this._values;
  }

  get typeSpec() {
    return this._typeSpec;
  }

  /** The underlying array storing the actual elements. */
  private _values: {[key: string]: any} = {};
  /** Current type spec. */
  private _typeSpec!: UdtTypeSpec;
}

export default QbUdt;
