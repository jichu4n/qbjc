import moo from 'moo';

// Based on https://github.com/no-context/moo/pull/85#issue-178701835
function caseInsensitiveKeywords(map: {[k: string]: string | string[]}) {
  const transform = moo.keywords(map);
  return (text: string) => transform(text.toLowerCase());
}

/** Lexer for QBasic. */
const lexer = moo.compile({
  WHITESPACE: {
    match: /\s+/,
    type: (text) => (text.includes('\n') ? 'NEWLINE' : ''),
    lineBreaks: true,
  },
  IDENTIFIER: {
    match: /[a-zA-Z_][a-zA-Z0-9_]*(?:\$|%|#|&|!)?/,
    type: caseInsensitiveKeywords({
      AND: 'and',
      ELSE: 'else',
      ELSEIF: 'elseif',
      END: 'end',
      GOTO: 'goto',
      IF: 'if',
      LET: 'let',
      MOD: 'mod',
      OR: 'or',
      PRINT: 'print',
      THEN: 'then',
    }),
  },

  STRING_LITERAL: {
    match: /"[^"]*"/,
    value: (text) => text.substr(1, text.length - 2),
  },
  NUMERIC_LITERAL: /-?(?:\d*\.\d+|\d+)/,

  COLON: ':',
  SEMICOLON: ';',
  LPAREN: '(',
  RPAREN: ')',
  ADD: '+',
  SUB: '-', // Note: must be after NUMERIC_LITERAL
  MUL: '*',
  EXP: '^',
  DIV: '/',
  INTDIV: '\\',
  // Note: order matters in the comparison operators!
  EQ: '=',
  NE: '<>',
  GTE: '>=',
  LTE: '<=',
  GT: '>',
  LT: '<',
});

// Modify generated lexer to discard irrelevant tokens.
// Based on https://github.com/no-context/moo/issues/81.
const TOKEN_TYPES_TO_DISCARD = ['WHITESPACE'];
lexer.next = ((originalLexerNextFn) => () => {
  let token: moo.Token | undefined;
  do {
    token = originalLexerNextFn();
  } while (token && token.type && TOKEN_TYPES_TO_DISCARD.includes(token.type));
  return token;
})(lexer.next.bind(lexer));

export default lexer;
