// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var COLON: any;
declare var NEWLINE: any;
declare var NUMERIC_LITERAL: any;
declare var IDENTIFIER: any;
declare var LET: any;
declare var EQ: any;
declare var GOTO: any;
declare var IF: any;
declare var THEN: any;
declare var ELSE: any;
declare var ELSEIF: any;
declare var END: any;
declare var WHILE: any;
declare var WEND: any;
declare var DO: any;
declare var LOOP: any;
declare var UNTIL: any;
declare var EXIT: any;
declare var FOR: any;
declare var TO: any;
declare var STEP: any;
declare var NEXT: any;
declare var GOSUB: any;
declare var RETURN: any;
declare var PRINT: any;
declare var COMMA: any;
declare var SEMICOLON: any;
declare var INPUT: any;
declare var STRING_LITERAL: any;
declare var OR: any;
declare var AND: any;
declare var NOT: any;
declare var NE: any;
declare var GT: any;
declare var GTE: any;
declare var LT: any;
declare var LTE: any;
declare var ADD: any;
declare var SUB: any;
declare var MOD: any;
declare var INTDIV: any;
declare var MUL: any;
declare var DIV: any;
declare var EXP: any;
declare var LPAREN: any;
declare var RPAREN: any;

import {Token} from 'moo';
import lexer from './lexer';
import {
  AstNode,
  Module,
  Expr,
  ExprType,
  BinaryOpExpr,
  UnaryOpExpr,
  LiteralExpr,
  VarRefExpr,
  LhsExpr,
  Stmt,
  Stmts,
  StmtType,
  LabelStmt,
  GotoStmt,
  AssignStmt,
  IfStmt,
  CondLoopStructure,
  CondLoopStmt,
  UncondLoopStmt,
  ExitLoopStmt,
  ForStmt,
  NextStmt,
  ExitForStmt,
  GosubStmt,
  ReturnStmt,
  EndStmt,
  PrintStmt,
  PrintSep,
  InputStmt,
} from '../ast/ast';

// ----
// Helper functions.
// ----

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

function buildBinaryOpExpr([$1, $2, $3]: Array<any>): BinaryOpExpr {
  return {
    type: ExprType.BINARY_OP,
    op: id($2).type.toLowerCase(),
    leftExpr: $1,
    rightExpr: $3,
    ...useLoc($1),
  };
}

function buildUnaryOpExpr([$1, $2]: Array<any>): UnaryOpExpr {
  return {
    type: ExprType.UNARY_OP,
    op: id($1).type.toLowerCase(),
    rightExpr: $2,
    ...useLoc($1),
  };
}

// ----
// Generated grammer for QBasic
// ----


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
    {"name": "module", "symbols": ["stmts"], "postprocess": ([$1]): Module => ({ stmts: $1 })},
    {"name": "stmts$ebnf$1", "symbols": ["stmtSep"], "postprocess": id},
    {"name": "stmts$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "stmts$ebnf$2", "symbols": []},
    {"name": "stmts$ebnf$2", "symbols": ["stmts$ebnf$2", "stmtWithSep"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "stmts", "symbols": ["stmts$ebnf$1", "stmts$ebnf$2"], "postprocess": ([$1, $2]) => $2},
    {"name": "stmtSep$ebnf$1$subexpression$1", "symbols": [(lexer.has("COLON") ? {type: "COLON"} : COLON)]},
    {"name": "stmtSep$ebnf$1$subexpression$1", "symbols": [(lexer.has("NEWLINE") ? {type: "NEWLINE"} : NEWLINE)]},
    {"name": "stmtSep$ebnf$1", "symbols": ["stmtSep$ebnf$1$subexpression$1"]},
    {"name": "stmtSep$ebnf$1$subexpression$2", "symbols": [(lexer.has("COLON") ? {type: "COLON"} : COLON)]},
    {"name": "stmtSep$ebnf$1$subexpression$2", "symbols": [(lexer.has("NEWLINE") ? {type: "NEWLINE"} : NEWLINE)]},
    {"name": "stmtSep$ebnf$1", "symbols": ["stmtSep$ebnf$1", "stmtSep$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "stmtSep", "symbols": ["stmtSep$ebnf$1"], "postprocess": discard},
    {"name": "stmtWithSep$ebnf$1", "symbols": ["stmtSep"], "postprocess": id},
    {"name": "stmtWithSep$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "stmtWithSep", "symbols": ["labelStmt", "stmtWithSep$ebnf$1"], "postprocess": id},
    {"name": "stmtWithSep", "symbols": ["nonLabelStmt", "stmtSep"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["assignStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["gotoStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["ifStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["whileStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["doWhileStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["doUntilStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["loopWhileStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["loopUntilStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["doLoopStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["exitLoopStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["forStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["nextStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["exitForStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["gosubStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["returnStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["endStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["printStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["inputStmt"], "postprocess": id},
    {"name": "labelStmt", "symbols": [(lexer.has("NUMERIC_LITERAL") ? {type: "NUMERIC_LITERAL"} : NUMERIC_LITERAL)], "postprocess": 
        ([$1]): LabelStmt =>
            ({ type: StmtType.LABEL, label: $1.value, ...useLoc($1) })
            },
    {"name": "labelStmt", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), (lexer.has("COLON") ? {type: "COLON"} : COLON)], "postprocess": 
        ([$1, $2]): LabelStmt =>
            ({ type: StmtType.LABEL, label: $1.value, ...useLoc($1) })
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
    {"name": "gotoStmt", "symbols": [(lexer.has("GOTO") ? {type: "GOTO"} : GOTO), "labelRef"], "postprocess": 
        ([$1, $2]): GotoStmt =>
            ({ type: StmtType.GOTO, destLabel: $2, ...useLoc($1) })
            },
    {"name": "ifStmt", "symbols": ["singleLineIfStmt"], "postprocess": id},
    {"name": "ifStmt", "symbols": ["blockIfStmt"], "postprocess": id},
    {"name": "singleLineIfStmt$ebnf$1$subexpression$1", "symbols": [(lexer.has("ELSE") ? {type: "ELSE"} : ELSE), "singleLineStmts"]},
    {"name": "singleLineIfStmt$ebnf$1", "symbols": ["singleLineIfStmt$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "singleLineIfStmt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "singleLineIfStmt", "symbols": [(lexer.has("IF") ? {type: "IF"} : IF), "expr", (lexer.has("THEN") ? {type: "THEN"} : THEN), "singleLineStmts", "singleLineIfStmt$ebnf$1"], "postprocess": 
        ([$1, $2, $3, $4, $5, $6]): IfStmt =>
            ({
              type: StmtType.IF,
              ifBranches: [ { condExpr: $2, stmts: $4 } ],
              elseBranch: $5 ? (([$5_1, $5_2]) => $5_2)($5) : [],
              ...useLoc($1),
            })
            },
    {"name": "blockIfStmt$ebnf$1", "symbols": []},
    {"name": "blockIfStmt$ebnf$1$subexpression$1", "symbols": [(lexer.has("ELSEIF") ? {type: "ELSEIF"} : ELSEIF), "expr", (lexer.has("THEN") ? {type: "THEN"} : THEN), (lexer.has("NEWLINE") ? {type: "NEWLINE"} : NEWLINE), "stmts"]},
    {"name": "blockIfStmt$ebnf$1", "symbols": ["blockIfStmt$ebnf$1", "blockIfStmt$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "blockIfStmt$ebnf$2$subexpression$1", "symbols": [(lexer.has("ELSE") ? {type: "ELSE"} : ELSE), "stmts"]},
    {"name": "blockIfStmt$ebnf$2", "symbols": ["blockIfStmt$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "blockIfStmt$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "blockIfStmt", "symbols": [(lexer.has("IF") ? {type: "IF"} : IF), "expr", (lexer.has("THEN") ? {type: "THEN"} : THEN), (lexer.has("NEWLINE") ? {type: "NEWLINE"} : NEWLINE), "stmts", "blockIfStmt$ebnf$1", "blockIfStmt$ebnf$2", (lexer.has("END") ? {type: "END"} : END), (lexer.has("IF") ? {type: "IF"} : IF)], "postprocess": 
        ([$1, $2, $3, $4, $5, $6, $7, $8, $9]): IfStmt =>
            ({
              type: StmtType.IF,
              ifBranches: [
                { condExpr: $2, stmts: $5 },
                ...$6.map(([$6_1, $6_2, $6_3, $6_4, $6_5]: Array<any>) => ({ condExpr: $6_2, stmts: $6_5})),
              ],
              elseBranch: $7 ? $7[1] : [],
              ...useLoc($1),
            })
            },
    {"name": "whileStmt", "symbols": [(lexer.has("WHILE") ? {type: "WHILE"} : WHILE), "expr", "stmts", (lexer.has("WEND") ? {type: "WEND"} : WEND)], "postprocess": 
        ([$1, $2, $3, $4]): CondLoopStmt =>
            ({
              type: StmtType.COND_LOOP,
              structure: CondLoopStructure.COND_EXPR_BEFORE_STMTS,
              condExpr: $2,
              isCondNegated: false,
              stmts: $3,
              ...useLoc($1),
            })
            },
    {"name": "doWhileStmt", "symbols": [(lexer.has("DO") ? {type: "DO"} : DO), (lexer.has("WHILE") ? {type: "WHILE"} : WHILE), "expr", "stmts", (lexer.has("LOOP") ? {type: "LOOP"} : LOOP)], "postprocess": 
        ([$1, $2, $3, $4, $5]): CondLoopStmt =>
            ({
              type: StmtType.COND_LOOP,
              structure: CondLoopStructure.COND_EXPR_BEFORE_STMTS,
              condExpr: $3,
              isCondNegated: false,
              stmts: $4,
              ...useLoc($1),
            })
            },
    {"name": "doUntilStmt", "symbols": [(lexer.has("DO") ? {type: "DO"} : DO), (lexer.has("UNTIL") ? {type: "UNTIL"} : UNTIL), "expr", "stmts", (lexer.has("LOOP") ? {type: "LOOP"} : LOOP)], "postprocess": 
        ([$1, $2, $3, $4, $5]): CondLoopStmt =>
            ({
              type: StmtType.COND_LOOP,
              structure: CondLoopStructure.COND_EXPR_BEFORE_STMTS,
              condExpr: $3,
              isCondNegated: true,
              stmts: $4,
              ...useLoc($1),
            })
            },
    {"name": "loopWhileStmt", "symbols": [(lexer.has("DO") ? {type: "DO"} : DO), "stmts", (lexer.has("LOOP") ? {type: "LOOP"} : LOOP), (lexer.has("WHILE") ? {type: "WHILE"} : WHILE), "expr"], "postprocess": 
        ([$1, $2, $3, $4, $5]): CondLoopStmt =>
            ({
              type: StmtType.COND_LOOP,
              structure: CondLoopStructure.COND_EXPR_AFTER_STMTS,
              condExpr: $5,
              isCondNegated: false,
              stmts: $2,
              ...useLoc($1),
            })
            },
    {"name": "loopUntilStmt", "symbols": [(lexer.has("DO") ? {type: "DO"} : DO), "stmts", (lexer.has("LOOP") ? {type: "LOOP"} : LOOP), (lexer.has("UNTIL") ? {type: "UNTIL"} : UNTIL), "expr"], "postprocess": 
        ([$1, $2, $3, $4, $5]): CondLoopStmt =>
            ({
              type: StmtType.COND_LOOP,
              structure: CondLoopStructure.COND_EXPR_AFTER_STMTS,
              condExpr: $5,
              isCondNegated: true,
              stmts: $2,
              ...useLoc($1),
            })
            },
    {"name": "doLoopStmt", "symbols": [(lexer.has("DO") ? {type: "DO"} : DO), "stmts", (lexer.has("LOOP") ? {type: "LOOP"} : LOOP)], "postprocess": 
        ([$1, $2, $3]): UncondLoopStmt => ({ type: StmtType.UNCOND_LOOP, stmts: $2, ...useLoc($1) })
            },
    {"name": "exitLoopStmt", "symbols": [(lexer.has("EXIT") ? {type: "EXIT"} : EXIT), (lexer.has("DO") ? {type: "DO"} : DO)], "postprocess": ([$1, $2]): ExitLoopStmt => ({ type: StmtType.EXIT_LOOP, ...useLoc($1) })},
    {"name": "forStmt$ebnf$1$subexpression$1", "symbols": [(lexer.has("STEP") ? {type: "STEP"} : STEP), "expr"]},
    {"name": "forStmt$ebnf$1", "symbols": ["forStmt$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "forStmt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "forStmt", "symbols": [(lexer.has("FOR") ? {type: "FOR"} : FOR), "lhsExpr", (lexer.has("EQ") ? {type: "EQ"} : EQ), "expr", (lexer.has("TO") ? {type: "TO"} : TO), "expr", "forStmt$ebnf$1"], "postprocess": 
        ([$1, $2, $3, $4, $5, $6, $7]): ForStmt => ({
          type: StmtType.FOR,
          counterExpr: $2,
          startExpr: $4,
          endExpr: $6,
          stepExpr: $7 ? $7[1] : null,
          ...useLoc($1),
        })
            },
    {"name": "nextStmt$ebnf$1", "symbols": ["lhsExprs"], "postprocess": id},
    {"name": "nextStmt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "nextStmt", "symbols": [(lexer.has("NEXT") ? {type: "NEXT"} : NEXT), "nextStmt$ebnf$1"], "postprocess": 
        ([$1, $2]): NextStmt => ({ type: StmtType.NEXT, counterExprs: $2 ?? [], ...useLoc($1) })
            },
    {"name": "exitForStmt", "symbols": [(lexer.has("EXIT") ? {type: "EXIT"} : EXIT), (lexer.has("FOR") ? {type: "FOR"} : FOR)], "postprocess": ([$1, $2]): ExitForStmt => ({ type: StmtType.EXIT_FOR, ...useLoc($1) })},
    {"name": "gosubStmt", "symbols": [(lexer.has("GOSUB") ? {type: "GOSUB"} : GOSUB), "labelRef"], "postprocess": 
        ([$1, $2]): GosubStmt =>
            ({ type: StmtType.GOSUB, destLabel: $2, ...useLoc($1) })
            },
    {"name": "returnStmt$ebnf$1", "symbols": ["labelRef"], "postprocess": id},
    {"name": "returnStmt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "returnStmt", "symbols": [(lexer.has("RETURN") ? {type: "RETURN"} : RETURN), "returnStmt$ebnf$1"], "postprocess": 
        ([$1, $2]): ReturnStmt =>
            ({ type: StmtType.RETURN, destLabel: $2, ...useLoc($1) })
            },
    {"name": "endStmt", "symbols": [(lexer.has("END") ? {type: "END"} : END)], "postprocess": ([$1]): EndStmt => ({ type: StmtType.END, ...useLoc($1) })},
    {"name": "printStmt$ebnf$1", "symbols": []},
    {"name": "printStmt$ebnf$1", "symbols": ["printStmt$ebnf$1", "printArg"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "printStmt", "symbols": [(lexer.has("PRINT") ? {type: "PRINT"} : PRINT), "printStmt$ebnf$1"], "postprocess": 
        ([$1, $2]): PrintStmt => ({ type: StmtType.PRINT, args: $2, ...useLoc($1) })
            },
    {"name": "printArg", "symbols": ["expr"], "postprocess": ([$1]) => $1},
    {"name": "printArg", "symbols": [(lexer.has("COMMA") ? {type: "COMMA"} : COMMA)], "postprocess": () => PrintSep.COMMA},
    {"name": "printArg", "symbols": [(lexer.has("SEMICOLON") ? {type: "SEMICOLON"} : SEMICOLON)], "postprocess": () => PrintSep.SEMICOLON},
    {"name": "inputStmt$ebnf$1$subexpression$1", "symbols": [(lexer.has("STRING_LITERAL") ? {type: "STRING_LITERAL"} : STRING_LITERAL), "inputStmtPromptSep"]},
    {"name": "inputStmt$ebnf$1", "symbols": ["inputStmt$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "inputStmt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "inputStmt", "symbols": [(lexer.has("INPUT") ? {type: "INPUT"} : INPUT), "inputStmt$ebnf$1", "lhsExprs"], "postprocess": 
        ([$1, $2, $3]): InputStmt => ({
          type: StmtType.INPUT,
          prompt: $2 ? `${$2[0].value}${$2[1] ? '? ': ''}` : '? ',
          targetExprs: $3,
          ...useLoc($1),
        })
            },
    {"name": "inputStmtPromptSep", "symbols": [(lexer.has("COMMA") ? {type: "COMMA"} : COMMA)], "postprocess": () => false},
    {"name": "inputStmtPromptSep", "symbols": [(lexer.has("SEMICOLON") ? {type: "SEMICOLON"} : SEMICOLON)], "postprocess": () => true},
    {"name": "singleLineStmts$ebnf$1", "symbols": []},
    {"name": "singleLineStmts$ebnf$1", "symbols": ["singleLineStmts$ebnf$1", (lexer.has("COLON") ? {type: "COLON"} : COLON)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "singleLineStmts$ebnf$2", "symbols": []},
    {"name": "singleLineStmts$ebnf$2$subexpression$1$ebnf$1", "symbols": [(lexer.has("COLON") ? {type: "COLON"} : COLON)]},
    {"name": "singleLineStmts$ebnf$2$subexpression$1$ebnf$1", "symbols": ["singleLineStmts$ebnf$2$subexpression$1$ebnf$1", (lexer.has("COLON") ? {type: "COLON"} : COLON)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "singleLineStmts$ebnf$2$subexpression$1", "symbols": ["singleLineStmts$ebnf$2$subexpression$1$ebnf$1", "nonLabelStmt"]},
    {"name": "singleLineStmts$ebnf$2", "symbols": ["singleLineStmts$ebnf$2", "singleLineStmts$ebnf$2$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "singleLineStmts", "symbols": ["singleLineStmts$ebnf$1", "nonLabelStmt", "singleLineStmts$ebnf$2"], "postprocess": 
        ([$1, $2, $3]): Stmts => [$2, ...$3.map(([$3_1, $3_2]: Array<any>) => $3_2)]
            },
    {"name": "lhsExprs", "symbols": ["lhsExpr"], "postprocess": ([$1]) => [$1]},
    {"name": "lhsExprs", "symbols": ["lhsExprs", (lexer.has("COMMA") ? {type: "COMMA"} : COMMA), "lhsExpr"], "postprocess": ([$1, $2, $3]) => [...$1, $3]},
    {"name": "labelRef$subexpression$1", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER)]},
    {"name": "labelRef$subexpression$1", "symbols": [(lexer.has("NUMERIC_LITERAL") ? {type: "NUMERIC_LITERAL"} : NUMERIC_LITERAL)]},
    {"name": "labelRef", "symbols": ["labelRef$subexpression$1"], "postprocess": ([$1]) => id($1).value},
    {"name": "expr", "symbols": ["expr10"], "postprocess": id},
    {"name": "lhsExpr", "symbols": ["varRefExpr"], "postprocess": id},
    {"name": "expr10", "symbols": ["expr9"], "postprocess": id},
    {"name": "expr10$subexpression$1", "symbols": [(lexer.has("OR") ? {type: "OR"} : OR)]},
    {"name": "expr10", "symbols": ["expr10", "expr10$subexpression$1", "expr9"], "postprocess": buildBinaryOpExpr},
    {"name": "expr9", "symbols": ["expr8"], "postprocess": id},
    {"name": "expr9$subexpression$1", "symbols": [(lexer.has("AND") ? {type: "AND"} : AND)]},
    {"name": "expr9", "symbols": ["expr9", "expr9$subexpression$1", "expr8"], "postprocess": buildBinaryOpExpr},
    {"name": "expr8", "symbols": ["expr7"], "postprocess": id},
    {"name": "expr8$subexpression$1", "symbols": [(lexer.has("NOT") ? {type: "NOT"} : NOT)]},
    {"name": "expr8", "symbols": ["expr8$subexpression$1", "expr7"], "postprocess": buildUnaryOpExpr},
    {"name": "expr7", "symbols": ["expr6"], "postprocess": id},
    {"name": "expr7$subexpression$1", "symbols": [(lexer.has("EQ") ? {type: "EQ"} : EQ)]},
    {"name": "expr7$subexpression$1", "symbols": [(lexer.has("NE") ? {type: "NE"} : NE)]},
    {"name": "expr7$subexpression$1", "symbols": [(lexer.has("GT") ? {type: "GT"} : GT)]},
    {"name": "expr7$subexpression$1", "symbols": [(lexer.has("GTE") ? {type: "GTE"} : GTE)]},
    {"name": "expr7$subexpression$1", "symbols": [(lexer.has("LT") ? {type: "LT"} : LT)]},
    {"name": "expr7$subexpression$1", "symbols": [(lexer.has("LTE") ? {type: "LTE"} : LTE)]},
    {"name": "expr7", "symbols": ["expr6", "expr7$subexpression$1", "expr6"], "postprocess": buildBinaryOpExpr},
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
    {"name": "expr1$subexpression$1", "symbols": [(lexer.has("EXP") ? {type: "EXP"} : EXP)]},
    {"name": "expr1", "symbols": ["expr1", "expr1$subexpression$1", "expr0"], "postprocess": buildBinaryOpExpr},
    {"name": "expr0", "symbols": ["varRefExpr"], "postprocess": id},
    {"name": "expr0", "symbols": ["literalExpr"], "postprocess": id},
    {"name": "expr0", "symbols": [(lexer.has("LPAREN") ? {type: "LPAREN"} : LPAREN), "expr", (lexer.has("RPAREN") ? {type: "RPAREN"} : RPAREN)], "postprocess": ([$1, $2, $3]) => ({ ...$2, ...useLoc($1) })},
    {"name": "varRefExpr", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER)], "postprocess": 
        ([$1]): VarRefExpr =>
            ({ type: ExprType.VAR_REF, name: $1.value, ...useLoc($1) })
            },
    {"name": "literalExpr", "symbols": ["stringLiteralExpr"], "postprocess": id},
    {"name": "literalExpr", "symbols": ["numericLiteralExpr"], "postprocess": id},
    {"name": "stringLiteralExpr", "symbols": [(lexer.has("STRING_LITERAL") ? {type: "STRING_LITERAL"} : STRING_LITERAL)], "postprocess": 
        ([$1]): LiteralExpr =>
            ({ type: ExprType.LITERAL, value: $1.value, ...useLoc($1) })
            },
    {"name": "numericLiteralExpr", "symbols": [(lexer.has("NUMERIC_LITERAL") ? {type: "NUMERIC_LITERAL"} : NUMERIC_LITERAL)], "postprocess": 
        ([$1]): LiteralExpr =>
            ({ type: ExprType.LITERAL, value: parseFloat($1.value), ...useLoc($1) })
            }
  ],
  ParserStart: "module",
};

export default grammar;
