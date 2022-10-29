// See https://gitlab.com/gitlab-org/gitlab/-/issues/119194
document.queryCommandSupported = () => false;
// @ts-ignore
window.matchMedia = () => ({matches: false, addEventListener() {}});
import * as monaco from 'monaco-editor';
import '../index';

// Based on monaco-editor/src/basic-languages/test/testRunner.ts
interface IRelaxedToken {
  startIndex: number;
  type: string;
}

interface ITestItem {
  line: string;
  tokens: IRelaxedToken[];
}

function testTokenization(testItems: Array<ITestItem>): void {
  for (const {line, tokens} of testItems) {
    test(`Tokenize \` ${line} \``, () => {
      const actualTokens = monaco.editor.tokenize(line, 'qb');
      expect(
        actualTokens.flatMap((lineTokens) =>
          lineTokens.map(({offset, type}) => ({startIndex: offset, type}))
        )
      ).toStrictEqual(tokens);
    });
  }
}

beforeAll(() => {
  // Trigger tokenizer creation by instantiating a model.
  const model = monaco.editor.createModel('', 'qb');
  model.dispose();
});

describe('monaco-qb', function () {
  // Test cases from monaco's built-in Visual Basic syntax.
  describe('Test cases from vb language', function () {
    testTokenization([
      // Comments - single line
      {
        line: "'",
        tokens: [{startIndex: 0, type: 'comment.qb'}],
      },
      {
        line: "    ' a comment",
        tokens: [
          {startIndex: 0, type: ''},
          {startIndex: 4, type: 'comment.qb'},
        ],
      },
      {
        line: "' a comment",
        tokens: [{startIndex: 0, type: 'comment.qb'}],
      },
      {
        line: "'sticky comment",
        tokens: [{startIndex: 0, type: 'comment.qb'}],
      },
      {
        line: "1 ' 2; ' comment",
        tokens: [
          {startIndex: 0, type: 'number.qb'},
          {startIndex: 1, type: ''},
          {startIndex: 2, type: 'comment.qb'},
        ],
      },
      {
        line: "Dim x = 1; ' my comment '' is a nice one",
        tokens: [
          {startIndex: 0, type: 'keyword.dim.qb'},
          {startIndex: 3, type: ''},
          {startIndex: 4, type: 'identifier.qb'},
          {startIndex: 5, type: ''},
          {startIndex: 6, type: 'delimiter.qb'},
          {startIndex: 7, type: ''},
          {startIndex: 8, type: 'number.qb'},
          {startIndex: 9, type: 'delimiter.qb'},
          {startIndex: 10, type: ''},
          {startIndex: 11, type: 'comment.qb'},
        ],
      },
      {
        line: 'REM this is a comment',
        tokens: [{startIndex: 0, type: 'comment.qb'}],
      },
      {
        line: '2 + 5 REM comment starts',
        tokens: [
          {startIndex: 0, type: 'number.qb'},
          {startIndex: 1, type: ''},
          {startIndex: 2, type: 'delimiter.qb'},
          {startIndex: 3, type: ''},
          {startIndex: 4, type: 'number.qb'},
          {startIndex: 5, type: ''},
          {startIndex: 6, type: 'comment.qb'},
        ],
      },

      // Numbers
      {
        line: '0',
        tokens: [{startIndex: 0, type: 'number.qb'}],
      },
      {
        line: '0.0',
        tokens: [{startIndex: 0, type: 'number.float.qb'}],
      },
      {
        line: '&h123',
        tokens: [{startIndex: 0, type: 'number.hex.qb'}],
      },
      {
        line: '23.5',
        tokens: [{startIndex: 0, type: 'number.float.qb'}],
      },
      {
        line: '23.5e3',
        tokens: [{startIndex: 0, type: 'number.float.qb'}],
      },
      {
        line: '23.5E3',
        tokens: [{startIndex: 0, type: 'number.float.qb'}],
      },
      {
        line: '1.72E3#',
        tokens: [{startIndex: 0, type: 'number.float.qb'}],
      },
      {
        line: '1.72e3!',
        tokens: [{startIndex: 0, type: 'number.float.qb'}],
      },
      {
        line: '1.72e-3',
        tokens: [{startIndex: 0, type: 'number.float.qb'}],
      },
      {
        line: '0+0',
        tokens: [
          {startIndex: 0, type: 'number.qb'},
          {startIndex: 1, type: 'delimiter.qb'},
          {startIndex: 2, type: 'number.qb'},
        ],
      },
      {
        line: '100+10',
        tokens: [
          {startIndex: 0, type: 'number.qb'},
          {startIndex: 3, type: 'delimiter.qb'},
          {startIndex: 4, type: 'number.qb'},
        ],
      },
      {
        line: '0 + 0',
        tokens: [
          {startIndex: 0, type: 'number.qb'},
          {startIndex: 1, type: ''},
          {startIndex: 2, type: 'delimiter.qb'},
          {startIndex: 3, type: ''},
          {startIndex: 4, type: 'number.qb'},
        ],
      },
    ]);
  });

  // Test cases from Microsoft QuickBASIC BASIC: Language Reference
  describe('Test cases from language reference', function () {
    testTokenization([
      {
        line: '68',
        tokens: [{startIndex: 0, type: 'number.qb'}],
      },
      {
        line: '+407',
        tokens: [
          {startIndex: 0, type: 'delimiter.qb'},
          {startIndex: 1, type: 'number.qb'},
        ],
      },
      {
        line: '-1',
        tokens: [
          {startIndex: 0, type: 'delimiter.qb'},
          {startIndex: 1, type: 'number.qb'},
        ],
      },
      {
        line: '&H76',
        tokens: [{startIndex: 0, type: 'number.hex.qb'}],
      },
      {
        line: '&H32F',
        tokens: [{startIndex: 0, type: 'number.hex.qb'}],
      },
      {
        line: '&o347',
        tokens: [{startIndex: 0, type: 'number.oct.qb'}],
      },
      {
        line: '&1234',
        tokens: [{startIndex: 0, type: 'number.oct.qb'}],
      },
      {
        line: '95000000',
        tokens: [{startIndex: 0, type: 'number.qb'}],
      },
      {
        line: '-400141',
        tokens: [
          {startIndex: 0, type: 'delimiter.qb'},
          {startIndex: 1, type: 'number.qb'},
        ],
      },
      {
        line: '&H0&',
        tokens: [{startIndex: 0, type: 'number.hex.qb'}],
      },
      {
        line: '&H1AAAAA&',
        tokens: [{startIndex: 0, type: 'number.hex.qb'}],
      },
      {
        line: '&o347&',
        tokens: [{startIndex: 0, type: 'number.oct.qb'}],
      },
      {
        line: '&555577733&',
        tokens: [{startIndex: 0, type: 'number.oct.qb'}],
      },
      {
        line: '9.0846',
        tokens: [{startIndex: 0, type: 'number.float.qb'}],
      },
      {
        line: '2235.988E-7',
        tokens: [{startIndex: 0, type: 'number.float.qb'}],
      },
      {
        line: '2359E6',
        tokens: [{startIndex: 0, type: 'number.float.qb'}],
      },
      {
        line: '4.35D-10',
        tokens: [{startIndex: 0, type: 'number.float.qb'}],
      },
      {
        line: '3489.0#',
        tokens: [{startIndex: 0, type: 'number.float.qb'}],
      },
      {
        line: '22!',
        tokens: [{startIndex: 0, type: 'number.float.qb'}],
      },
    ]);
  });
});
