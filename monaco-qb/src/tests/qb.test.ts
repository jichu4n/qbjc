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
  describe('vb test cases', function () {
    testTokenization([
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
    ]);
  });
});
