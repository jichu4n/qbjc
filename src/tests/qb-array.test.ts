import QbArray from '../runtime/qb-array';

describe('QbArray', () => {
  test('init', () => {
    // A1(10)
    const a1 = new QbArray([{minIdx: 0, maxIdx: 10}], 0);
    expect(a1.values).toStrictEqual(new Array(11).fill(0));

    // A2(10, 10)
    const a2 = new QbArray(
      [
        {minIdx: 0, maxIdx: 10},
        {minIdx: 0, maxIdx: 10},
      ],
      ''
    );
    expect(a2.values).toStrictEqual(new Array(11).fill(new Array(11).fill('')));

    // A3(10, 10)
    const a3 = new QbArray(
      [
        {minIdx: 0, maxIdx: 10},
        {minIdx: 0, maxIdx: 10},
        {minIdx: 0, maxIdx: 10},
      ],
      0
    );
    expect(a3.values).toStrictEqual(
      new Array(11).fill(new Array(11).fill(new Array(11).fill(0)))
    );

    // A4(100 TO 200, -3 TO 0)
    const a4 = new QbArray(
      [
        {minIdx: 100, maxIdx: 200},
        {minIdx: -3, maxIdx: 0},
      ],
      ''
    );
    expect(a4.values).toStrictEqual(new Array(101).fill(new Array(4).fill('')));
  });

  test('getIdx', () => {
    // A1(10)
    const a1 = new QbArray([{minIdx: 0, maxIdx: 10}], 0);
    expect(a1.getIdx(0, 4)).toStrictEqual(4);

    // A2(1 TO 5, -3 TO 0)
    const a2 = new QbArray(
      [
        {minIdx: 1, maxIdx: 5},
        {minIdx: -3, maxIdx: 0},
      ],
      0
    );
    expect(a2.getIdx(0, 4)).toStrictEqual(3);
    expect(a2.getIdx(1, 0)).toStrictEqual(3);
  });
});
