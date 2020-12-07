// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var PRINT: any;
declare var END: any;
declare var COLON: any;
declare var NEWLINE: any;

import lexer from './lexer';

function discard() {
  return null;
}

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: lexer,
  ParserRules: [
    {"name": "program", "symbols": ["statements"]},
    {"name": "statements$ebnf$1", "symbols": ["statementSep"], "postprocess": id},
    {"name": "statements$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "statements$ebnf$2", "symbols": []},
    {"name": "statements$ebnf$2$subexpression$1", "symbols": ["statement", "statementSep"]},
    {"name": "statements$ebnf$2", "symbols": ["statements$ebnf$2", "statements$ebnf$2$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "statements", "symbols": ["statements$ebnf$1", "statements$ebnf$2"], "postprocess": ([$1, $2]) => $2.map(id)},
    {"name": "statement", "symbols": [(lexer.has("PRINT") ? {type: "PRINT"} : PRINT)], "postprocess": id},
    {"name": "statement", "symbols": [(lexer.has("END") ? {type: "END"} : END)], "postprocess": id},
    {"name": "statementSep$ebnf$1$subexpression$1", "symbols": [(lexer.has("COLON") ? {type: "COLON"} : COLON)]},
    {"name": "statementSep$ebnf$1$subexpression$1", "symbols": [(lexer.has("NEWLINE") ? {type: "NEWLINE"} : NEWLINE)]},
    {"name": "statementSep$ebnf$1", "symbols": ["statementSep$ebnf$1$subexpression$1"]},
    {"name": "statementSep$ebnf$1$subexpression$2", "symbols": [(lexer.has("COLON") ? {type: "COLON"} : COLON)]},
    {"name": "statementSep$ebnf$1$subexpression$2", "symbols": [(lexer.has("NEWLINE") ? {type: "NEWLINE"} : NEWLINE)]},
    {"name": "statementSep$ebnf$1", "symbols": ["statementSep$ebnf$1", "statementSep$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "statementSep", "symbols": ["statementSep$ebnf$1"], "postprocess": discard}
  ],
  ParserStart: "program",
};

export default grammar;
