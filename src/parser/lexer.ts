import moo from 'moo';

/** QBasic keywords.
 *
 * Note that the values must be lowercase!
 */
export enum Keywords {
  AND = 'and',
  AS = 'as',
  CALL = 'call',
  CASE = 'case',
  CONST = 'const',
  DECLARE = 'declare',
  DIM = 'dim',
  DO = 'do',
  DOUBLE = 'double',
  ELSE = 'else',
  ELSEIF = 'elseif',
  END = 'end',
  EXIT = 'exit',
  FUNCTION = 'function',
  FOR = 'for',
  GOSUB = 'gosub',
  GOTO = 'goto',
  IF = 'if',
  IS = 'is',
  INPUT = 'input',
  INTEGER = 'integer',
  LET = 'let',
  LINE = 'line',
  LONG = 'long',
  LOOP = 'loop',
  MOD = 'mod',
  NEXT = 'next',
  OR = 'or',
  PRINT = 'print',
  REM = 'rem',
  RETURN = 'return',
  SELECT = 'select',
  SHARED = 'shared',
  SINGLE = 'single',
  STATIC = 'static',
  STEP = 'step',
  STRING = 'string',
  SUB = 'sub',
  SYSTEM = 'system',
  SWAP = 'swap',
  THEN = 'then',
  TO = 'to',
  TYPE = 'type',
  UNTIL = 'until',
  USING = 'using',
  WEND = 'wend',
  WHILE = 'while',
}

/** moo lexer used internally by Lexer. */
const mooLexer = moo.states(
  {
    main: {
      WHITESPACE: {
        match: /\s+/,
        type: (text) => (text.includes('\n') ? 'NEWLINE' : ''),
        lineBreaks: true,
      },
      COMMENT: {
        match: /'/,
        push: 'comment',
      },
      IDENTIFIER: {
        match: /[a-zA-Z_][a-zA-Z0-9_]*(?:\$|%|#|&|!)?/,
        type: caseInsensitiveKeywords(Keywords),
      },

      STRING_LITERAL: {
        match: /"[^"]*"/,
        value: (text) => text.substr(1, text.length - 2),
      },
      NUMERIC_LITERAL: /(?:\d*\.\d+|\d+)/,

      COLON: ':',
      SEMICOLON: ';',
      COMMA: ',',
      DOT: '.',
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
    },
    comment: {
      COMMENT: {
        match: /[^\n]+/,
        pop: 1,
      },
      NEWLINE: {
        match: /\n/,
        pop: 1,
        lineBreaks: true,
      },
    },
  },
  'main'
);

const TOKEN_TYPES_TO_DISCARD = ['WHITESPACE', 'COMMENT', 'REM'];

/** Extended token. */
export interface Token extends moo.Token {
  isFirstTokenOnLine?: boolean;
}

/** Lexer for QBasic.
 *
 * This class wraps the moo lexer with some additional capabilities:
 *
 *   - Discard irrelevant tokens, based on https://github.com/no-context/moo/issues/81.
 *   - Set isFirstTokenOnLine flag on tokens to help disambiguate labels from statements.
 *   - Support lookahead with peek().
 *   - Store the last token for debugging output.
 */
class Lexer {
  constructor(private readonly mooLexer: moo.Lexer) {}

  next(): Token | undefined {
    if (this.tokenQueue.length > 0) {
      return this.tokenQueue.pop();
    }

    let token: Token | undefined;
    do {
      token = this.mooLexer.next();
      if (token) {
        this.lastToken = token;
        token.isFirstTokenOnLine = this.isNextTokenFirstOnLine;

        if (token.type === 'NEWLINE') {
          this.isNextTokenFirstOnLine = true;
        } else {
          this.isNextTokenFirstOnLine = false;
        }

        if (token.type === 'REM') {
          this.mooLexer.pushState('comment');
        }
      }
    } while (
      token &&
      token.type &&
      TOKEN_TYPES_TO_DISCARD.includes(token.type)
    );
    return token;
  }

  peek(): Token | undefined {
    const token = this.next();
    this.tokenQueue.push(token);
    return token;
  }

  save(): moo.LexerState {
    return this.mooLexer.save();
  }

  reset(chunk?: string, state?: moo.LexerState) {
    this.mooLexer.reset(chunk, state);
    this.isNextTokenFirstOnLine = true;
    this.lastToken = undefined;
    this.tokenQueue = [];
    return this;
  }

  formatError(token: Token, message?: string) {
    return this.mooLexer.formatError(token, message);
  }

  has(tokenType: string) {
    return this.mooLexer.has(tokenType);
  }

  lastToken: Token | undefined = undefined;
  private isNextTokenFirstOnLine: boolean = true;
  private tokenQueue: Array<Token | undefined> = [];
}

// Based on https://github.com/no-context/moo/pull/85#issue-178701835
function caseInsensitiveKeywords(map: {[k: string]: string | string[]}) {
  const keywordsTransformFn = moo.keywords(map);
  return (text: string) => keywordsTransformFn(text.toLowerCase());
}

const lexer = new Lexer(mooLexer);
export default lexer;
