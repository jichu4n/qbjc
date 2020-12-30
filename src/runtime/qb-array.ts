import {
  ArrayDimensionSpec,
  arraySpec,
  ArrayTypeSpec,
  SingularTypeSpec,
  ELEMENTARY_TYPE_INIT_VALUES,
} from '../lib/types';

/** Runtime representation for QBasic arrays. */
class QbArray {
  constructor(arrayTypeSpec: ArrayTypeSpec) {
    this.init(arrayTypeSpec.elementTypeSpec, arrayTypeSpec.dimensionSpecs);
  }

  /** Initializes the array with the provided spec, discarding any previous contents. */
  init(
    elementTypeSpec: SingularTypeSpec,
    dimensionSpecs: Array<ArrayDimensionSpec>
  ) {
    if (dimensionSpecs.length === 0) {
      throw new Error('No dimension specs provided');
    }
    this._arrayTypeSpec = arraySpec(elementTypeSpec, dimensionSpecs);

    this._values.length = 0;
    let currentDimensionArrays: Array<any> = [this._values];
    for (let i = 0; i < dimensionSpecs.length; ++i) {
      const [minIdx, maxIdx] = dimensionSpecs[i];
      const numElements = maxIdx - minIdx + 1;
      const nextDimensionArrays = [];
      for (const dimensionArray of currentDimensionArrays) {
        if (i === dimensionSpecs.length - 1) {
          for (let j = 0; j < numElements; ++j) {
            dimensionArray.push(
              // @ts-ignore TODO
              ELEMENTARY_TYPE_INIT_VALUES[elementTypeSpec.type]
            );
          }
        } else {
          for (let j = 0; j < numElements; ++j) {
            const nextDimensionArray = new Array();
            nextDimensionArrays.push(nextDimensionArray);
            dimensionArray.push(nextDimensionArray);
          }
        }
      }
      currentDimensionArrays = nextDimensionArrays;
    }
  }

  /** Translates a QBasic index into the index in the underlying array. */
  getIdx(dimensionIdx: number, qbIdx: number) {
    const {dimensionSpecs} = this._arrayTypeSpec;
    if (
      !Number.isFinite(dimensionIdx) ||
      dimensionIdx < 0 ||
      dimensionIdx >= dimensionSpecs.length
    ) {
      throw new Error(
        'Invalid dimension in getIndex: ' +
          `expected number between 0 and ${dimensionSpecs.length - 1}, ` +
          `got ${dimensionIdx}`
      );
    }
    const [minIdx, maxIdx] = dimensionSpecs[dimensionIdx];
    if (!Number.isFinite(qbIdx) || qbIdx < minIdx || qbIdx > maxIdx) {
      throw new Error(
        `Index out of range for dimension ${dimensionIdx + 1}: ` +
          `expected number between ${minIdx} and ${maxIdx}, ` +
          `got ${qbIdx}`
      );
    }
    return qbIdx - minIdx;
  }

  get values() {
    return this._values;
  }

  get arrayTypeSpec() {
    return this._arrayTypeSpec;
  }

  /** The underlying array storing the actual elements. */
  private _values: Array<any> = [];
  /** Current type spec. */
  private _arrayTypeSpec!: ArrayTypeSpec;
}

export default QbArray;
