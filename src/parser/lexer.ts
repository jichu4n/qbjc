import moo, {Lexer, Token} from 'moo';

/** QBasic keywords.
 *
 * Note that the values must be lowercase!
 */
export enum Keywords {
  AND = 'and',
  DO = 'do',
  ELSE = 'else',
  ELSEIF = 'elseif',
  END = 'end',
  EXIT = 'exit',
  FUNCTION = 'function',
  FOR = 'for',
  GOSUB = 'gosub',
  GOTO = 'goto',
  IF = 'if',
  INPUT = 'input',
  LET = 'let',
  LOOP = 'loop',
  MOD = 'mod',
  NEXT = 'next',
  OR = 'or',
  PRINT = 'print',
  RETURN = 'return',
  STEP = 'step',
  SUB = 'sub',
  THEN = 'then',
  TO = 'to',
  UNTIL = 'until',
  WEND = 'wend',
  WHILE = 'while',
}

/** Lexer for QBasic. */
const lexer: Lexer & {lastToken?: Token} = moo.compile({
  WHITESPACE: {
    match: /\s+/,
    type: (text) => (text.includes('\n') ? 'NEWLINE' : ''),
    lineBreaks: true,
  },
  COMMENT: /'[^\n]*/,
  IDENTIFIER: {
    match: /[a-zA-Z_][a-zA-Z0-9_]*(?:\$|%|#|&|!)?/,
    type: caseInsensitiveKeywords(Keywords),
  },

  STRING_LITERAL: {
    match: /"[^"]*"/,
    value: (text) => text.substr(1, text.length - 2),
  },
  NUMERIC_LITERAL: /-?(?:\d*\.\d+|\d+)/,

  COLON: ':',
  SEMICOLON: ';',
  COMMA: ',',
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

// Based on https://github.com/no-context/moo/pull/85#issue-178701835
function caseInsensitiveKeywords(map: {[k: string]: string | string[]}) {
  const keywordsTransformFn = moo.keywords(map);
  return (text: string) => keywordsTransformFn(text.toLowerCase());
}

// Modify generated lexer to discard irrelevant tokens and store the last token.
// Based on https://github.com/no-context/moo/issues/81.
const TOKEN_TYPES_TO_DISCARD = ['WHITESPACE', 'COMMENT'];
lexer.next = ((originalLexerNextFn) => () => {
  let token: Token | undefined;
  do {
    token = originalLexerNextFn();
    if (token) {
      lexer.lastToken = token;
    }
  } while (token && token.type && TOKEN_TYPES_TO_DISCARD.includes(token.type));
  return token;
})(lexer.next.bind(lexer));

export default lexer;
