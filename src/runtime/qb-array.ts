import {ArraySpec} from '../lib/types';

/** Runtime representation for QBasic arrays. */
class QbArray {
  constructor(arraySpec: ArraySpec, elementInitValue: any) {
    this.init(arraySpec, elementInitValue);
  }

  /** The underlying array storing the actual elements. */
  values: Array<any> = [];

  /** Initializes the array with the provided spec, discarding any previous contents. */
  init(arraySpec: ArraySpec, elementInitValue: any) {
    if (arraySpec.length === 0) {
      throw new Error('No dimension specs provided');
    }

    this.arraySpec = arraySpec;
    this.values.length = 0;
    let currentDimensionArrays: Array<any> = [this.values];
    for (let i = 0; i < arraySpec.length; ++i) {
      const {minIdx, maxIdx} = arraySpec[i];
      const numElements = maxIdx - minIdx + 1;
      const nextDimensionArrays = [];
      for (const dimensionArray of currentDimensionArrays) {
        if (i === arraySpec.length - 1) {
          for (let j = 0; j < numElements; ++j) {
            dimensionArray.push(elementInitValue);
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
    if (
      !Number.isFinite(dimensionIdx) ||
      dimensionIdx < 0 ||
      dimensionIdx >= this.arraySpec.length
    ) {
      throw new Error(
        'Invalid dimension in getIndex: ' +
          `expected number between 0 and ${this.arraySpec.length - 1}, ` +
          `got ${dimensionIdx}`
      );
    }
    const {minIdx, maxIdx} = this.arraySpec[dimensionIdx];
    if (!Number.isFinite(qbIdx) || qbIdx < minIdx || qbIdx > maxIdx) {
      throw new Error(
        `Invalid index for dimension ${dimensionIdx + 1}: ` +
          `expected number between ${minIdx} and ${maxIdx}, ` +
          `got ${qbIdx}`
      );
    }
    return qbIdx - minIdx;
  }

  private arraySpec: ArraySpec = [];
}

export default QbArray;
