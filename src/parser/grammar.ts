// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var COLON: any;
declare var NEWLINE: any;
declare var END: any;
declare var PRINT: any;
declare var LET: any;
declare var EQ: any;
declare var ADD: any;
declare var SUB: any;
declare var MOD: any;
declare var INTDIV: any;
declare var MUL: any;
declare var DIV: any;
declare var EXP: any;
declare var LPAREN: any;
declare var RPAREN: any;
declare var IDENTIFIER: any;
declare var STRING_LITERAL: any;

import {Token} from 'moo';
import lexer from './lexer';
import {
  AstNode,
  ExprType,
  BinaryOpExpr,
  UnaryOpExpr,
  LiteralExpr,
  VarRefExpr,
  StmtType,
  AssignStmt,
  PrintStmt,
} from '../ast';

function discard() { return null; }

function useLoc(tokenOrAstNode: Token | AstNode) {

  if ('loc' in tokenOrAstNode) {
    return {loc: tokenOrAstNode.loc};
  } else if (('line' in tokenOrAstNode) && ('col' in tokenOrAstNode)) {
    return {loc: {line: tokenOrAstNode.line, col: tokenOrAstNode.col}};
  } else {
    throw new Error(`Invalid tokenOrAstNode: ${JSON.stringify(tokenOrAstNode)}`);
  }
}

function buildBinaryOpExpr([$1, $2, $3]: any[]): BinaryOpExpr {
  return {
    type: ExprType.BINARY_OP,
    op: id($2).type.toLowerCase(),
    leftExpr: $1,
    rightExpr: $3,
    ...useLoc($1),
  };
}

function buildUnaryOpExpr([$1, $2]: any[]): UnaryOpExpr {
  return {
    type: ExprType.UNARY_OP,
    op: id($1).type.toLowerCase(),
    expr: $2,
    ...useLoc($1),
  };
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
    {"name": "program", "symbols": ["stmts"], "postprocess": id},
    {"name": "stmts$ebnf$1", "symbols": ["stmtSep"], "postprocess": id},
    {"name": "stmts$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "stmts$ebnf$2", "symbols": []},
    {"name": "stmts$ebnf$2$subexpression$1", "symbols": ["stmt", "stmtSep"]},
    {"name": "stmts$ebnf$2", "symbols": ["stmts$ebnf$2", "stmts$ebnf$2$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "stmts", "symbols": ["stmts$ebnf$1", "stmts$ebnf$2"], "postprocess": ([$1, $2]) => $2.map(id)},
    {"name": "stmtSep$ebnf$1$subexpression$1", "symbols": [(lexer.has("COLON") ? {type: "COLON"} : COLON)]},
    {"name": "stmtSep$ebnf$1$subexpression$1", "symbols": [(lexer.has("NEWLINE") ? {type: "NEWLINE"} : NEWLINE)]},
    {"name": "stmtSep$ebnf$1", "symbols": ["stmtSep$ebnf$1$subexpression$1"]},
    {"name": "stmtSep$ebnf$1$subexpression$2", "symbols": [(lexer.has("COLON") ? {type: "COLON"} : COLON)]},
    {"name": "stmtSep$ebnf$1$subexpression$2", "symbols": [(lexer.has("NEWLINE") ? {type: "NEWLINE"} : NEWLINE)]},
    {"name": "stmtSep$ebnf$1", "symbols": ["stmtSep$ebnf$1", "stmtSep$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "stmtSep", "symbols": ["stmtSep$ebnf$1"], "postprocess": discard},
    {"name": "stmt", "symbols": ["printStmt"], "postprocess": id},
    {"name": "stmt", "symbols": ["assignStmt"], "postprocess": id},
    {"name": "stmt", "symbols": [(lexer.has("END") ? {type: "END"} : END)], "postprocess": discard},
    {"name": "printStmt$ebnf$1", "symbols": ["expr"], "postprocess": id},
    {"name": "printStmt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "printStmt", "symbols": [(lexer.has("PRINT") ? {type: "PRINT"} : PRINT), "printStmt$ebnf$1"], "postprocess": 
        ([$1, $2]): PrintStmt =>
            ({ type: StmtType.PRINT, args: $2 ? [$2] : [], ...useLoc($1) })
            },
    {"name": "assignStmt$ebnf$1", "symbols": [(lexer.has("LET") ? {type: "LET"} : LET)], "postprocess": id},
    {"name": "assignStmt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "assignStmt", "symbols": ["assignStmt$ebnf$1", "lhsExpr", (lexer.has("EQ") ? {type: "EQ"} : EQ), "expr"], "postprocess": 
        ([$1, $2, $3, $4]): AssignStmt =>
            ({
              type: StmtType.ASSIGN,
              targetExpr: $2,
              valueExpr: $4,
              ...useLoc($1 || $2),
            })
            },
    {"name": "expr", "symbols": ["expr6"], "postprocess": id},
    {"name": "lhsExpr", "symbols": ["varRefExpr"], "postprocess": id},
    {"name": "expr6", "symbols": ["expr5"], "postprocess": id},
    {"name": "expr6$subexpression$1", "symbols": [(lexer.has("ADD") ? {type: "ADD"} : ADD)]},
    {"name": "expr6$subexpression$1", "symbols": [(lexer.has("SUB") ? {type: "SUB"} : SUB)]},
    {"name": "expr6", "symbols": ["expr6", "expr6$subexpression$1", "expr5"], "postprocess": buildBinaryOpExpr},
    {"name": "expr5", "symbols": ["expr4"], "postprocess": id},
    {"name": "expr5$subexpression$1", "symbols": [(lexer.has("MOD") ? {type: "MOD"} : MOD)]},
    {"name": "expr5", "symbols": ["expr5", "expr5$subexpression$1", "expr4"], "postprocess": buildBinaryOpExpr},
    {"name": "expr4", "symbols": ["expr3"], "postprocess": id},
    {"name": "expr4$subexpression$1", "symbols": [(lexer.has("INTDIV") ? {type: "INTDIV"} : INTDIV)]},
    {"name": "expr4", "symbols": ["expr4", "expr4$subexpression$1", "expr3"], "postprocess": buildBinaryOpExpr},
    {"name": "expr3", "symbols": ["expr2"], "postprocess": id},
    {"name": "expr3$subexpression$1", "symbols": [(lexer.has("MUL") ? {type: "MUL"} : MUL)]},
    {"name": "expr3$subexpression$1", "symbols": [(lexer.has("DIV") ? {type: "DIV"} : DIV)]},
    {"name": "expr3", "symbols": ["expr3", "expr3$subexpression$1", "expr2"], "postprocess": buildBinaryOpExpr},
    {"name": "expr2", "symbols": ["expr1"], "postprocess": id},
    {"name": "expr2$subexpression$1", "symbols": [(lexer.has("SUB") ? {type: "SUB"} : SUB)]},
    {"name": "expr2", "symbols": ["expr2$subexpression$1", "expr1"], "postprocess": buildUnaryOpExpr},
    {"name": "expr1", "symbols": ["expr0"], "postprocess": id},
    {"name": "expr1", "symbols": ["expr1", (lexer.has("EXP") ? {type: "EXP"} : EXP), "expr0"], "postprocess": buildBinaryOpExpr},
    {"name": "expr0", "symbols": ["varRefExpr"], "postprocess": id},
    {"name": "expr0", "symbols": ["literalExpr"], "postprocess": id},
    {"name": "expr0", "symbols": [(lexer.has("LPAREN") ? {type: "LPAREN"} : LPAREN), "expr", (lexer.has("RPAREN") ? {type: "RPAREN"} : RPAREN)], "postprocess": ([$1, $2, $3]) => ({ ...$2, ...useLoc($1) })},
    {"name": "varRefExpr", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER)], "postprocess": 
        ([$1]): VarRefExpr =>
            ({ type: ExprType.VAR_REF, name: $1.value, ...useLoc($1) })
            },
    {"name": "literalExpr", "symbols": [(lexer.has("STRING_LITERAL") ? {type: "STRING_LITERAL"} : STRING_LITERAL)], "postprocess": 
        ([$1]): LiteralExpr =>
            ({ type: ExprType.LITERAL, value: $1.value, ...useLoc($1) })
            }
  ],
  ParserStart: "program",
};

export default grammar;
