import {integerSpec, stringSpec, arraySpec} from '../lib/types';
import QbArray from '../runtime/qb-array';

describe('QbArray', () => {
  test('constructor', () => {
    // A1(10)
    const a1 = new QbArray(arraySpec(integerSpec(), [[0, 10]]));
    expect(a1.values).toStrictEqual(new Array(11).fill(0));

    // A2(10, 10)
    const a2 = new QbArray(
      arraySpec(stringSpec(), [
        [0, 10],
        [0, 10],
      ])
    );
    expect(a2.values).toStrictEqual(new Array(11).fill(new Array(11).fill('')));

    // A3(10, 10)
    const a3 = new QbArray(
      arraySpec(integerSpec(), [
        [0, 10],
        [0, 10],
        [0, 10],
      ])
    );
    expect(a3.values).toStrictEqual(
      new Array(11).fill(new Array(11).fill(new Array(11).fill(0)))
    );

    // A4(100 TO 200, -3 TO 0)
    const a4 = new QbArray(
      arraySpec(stringSpec(), [
        [100, 200],
        [-3, 0],
      ])
    );
    expect(a4.values).toStrictEqual(new Array(101).fill(new Array(4).fill('')));
  });

  test('getIdx', () => {
    // A1(10)
    const a1 = new QbArray(arraySpec(integerSpec(), [[0, 10]]));
    expect(a1.getIdx(0, 4)).toStrictEqual(4);

    // A2(1 TO 5, -3 TO 0)
    const a2 = new QbArray(
      arraySpec(integerSpec(), [
        [1, 5],
        [-3, 0],
      ])
    );
    expect(a2.getIdx(0, 4)).toStrictEqual(3);
    expect(a2.getIdx(1, 0)).toStrictEqual(3);
  });
});
