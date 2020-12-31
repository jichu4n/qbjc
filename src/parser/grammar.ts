// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var FUNCTION: any;
declare var IDENTIFIER: any;
declare var LPAREN: any;
declare var RPAREN: any;
declare var STATIC: any;
declare var END: any;
declare var SUB: any;
declare var DECLARE: any;
declare var COMMA: any;
declare var TYPE: any;
declare var COLON: any;
declare var NEWLINE: any;
declare var NUMERIC_LITERAL: any;
declare var DIM: any;
declare var SHARED: any;
declare var TO: any;
declare var LET: any;
declare var EQ: any;
declare var CONST: any;
declare var GOTO: any;
declare var IF: any;
declare var THEN: any;
declare var ELSE: any;
declare var ELSEIF: any;
declare var SELECT: any;
declare var CASE: any;
declare var IS: any;
declare var NE: any;
declare var GT: any;
declare var GTE: any;
declare var LT: any;
declare var LTE: any;
declare var WHILE: any;
declare var WEND: any;
declare var DO: any;
declare var LOOP: any;
declare var UNTIL: any;
declare var EXIT: any;
declare var FOR: any;
declare var STEP: any;
declare var NEXT: any;
declare var GOSUB: any;
declare var RETURN: any;
declare var CALL: any;
declare var SYSTEM: any;
declare var SWAP: any;
declare var PRINT: any;
declare var USING: any;
declare var SEMICOLON: any;
declare var INPUT: any;
declare var STRING_LITERAL: any;
declare var LINE: any;
declare var DEFINT: any;
declare var DEFSNG: any;
declare var DEFDBL: any;
declare var DEFLNG: any;
declare var DEFSTR: any;
declare var DATA: any;
declare var READ: any;
declare var RESTORE: any;
declare var LOCATE: any;
declare var INTEGER: any;
declare var LONG: any;
declare var SINGLE: any;
declare var DOUBLE: any;
declare var STRING: any;
declare var MUL: any;
declare var AS: any;
declare var OR: any;
declare var AND: any;
declare var NOT: any;
declare var ADD: any;
declare var MOD: any;
declare var INTDIV: any;
declare var DIV: any;
declare var EXP: any;
declare var DOT: any;

import _ from 'lodash';
import {Token} from 'moo';
import lexer from './lexer';
import {
  AstNode,
  Module,
  FnProc,
  SubProc,
  Param,
  DataTypeExprType,
  SingularTypeExpr,
  Udt,
  FieldSpecExpr,
  Expr,
  ExprType,
  BinaryOpExpr,
  BinaryOp,
  UnaryOp,
  UnaryOpExpr,
  LiteralExpr,
  VarRefExpr,
  FnCallExpr,
  MemberExpr,
  LhsExpr,
  Stmt,
  Stmts,
  StmtType,
  LabelStmt,
  DimStmt,
  DimType,
  VarDecl,
  ArrayDimensionSpecExpr,
  GotoStmt,
  AssignStmt,
  ConstStmt,
  ConstDef,
  IfStmt,
  SelectStmt,
  CaseExprType,
  CaseExpr,
  CondLoopStructure,
  CondLoopStmt,
  UncondLoopStmt,
  ExitLoopStmt,
  ForStmt,
  NextStmt,
  ExitForStmt,
  GosubStmt,
  ReturnStmt,
  CallStmt,
  ExitProcStmt,
  EndStmt,
  SwapStmt,
  PrintStmt,
  PrintSep,
  InputStmt,
  InputType,
  DefTypeStmt,
  DefTypeRange,
  DataStmt,
  ReadStmt,
  RestoreStmt,
} from '../lib/ast';
import {
  integerSpec,
  longSpec,
  singleSpec,
  doubleSpec,
  stringSpec,
  ProcType,
} from '../lib/types';
import {DataItem, DataItemValue} from '../lib/data-item';

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
    ...useLoc(id($1)),
  };
}

function buildDataItem(tokenOrAstNode: Token | AstNode, value: DataItemValue): DataItem {
  const {line, col} = useLoc(tokenOrAstNode).loc;
  return [[line, col], value];
}

/** Type of the 'reject' parameter passed to postprocessors. */
type Reject = Object | undefined;

// ----
// Generated grammer below
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
    {"name": "module$ebnf$1", "symbols": ["stmtSep"], "postprocess": id},
    {"name": "module$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "module$ebnf$2", "symbols": ["moduleComponentWithSep"]},
    {"name": "module$ebnf$2", "symbols": ["module$ebnf$2", "moduleComponentWithSep"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "module", "symbols": ["module$ebnf$1", "module$ebnf$2"], "postprocess": 
        ([$1, $2]): Module => $2.reduce((a: Module, b: Module) => ({
          stmts: [...a.stmts, ...b.stmts],
          procs: [...a.procs, ...b.procs],
          udts: [...a.udts, ...b.udts],
        }))
            },
    {"name": "moduleComponentWithSep", "symbols": ["stmtWithSep"], "postprocess": 
        ([$1]): Module => ({
          stmts: [$1],
          procs: [],
          udts: [],
        })
              },
    {"name": "moduleComponentWithSep", "symbols": ["proc", "stmtSep"], "postprocess": 
        ([$1, $2]): Module => ({
          stmts: [],
          procs: $1 ? [$1] : [],
          udts: [],
        })
            },
    {"name": "moduleComponentWithSep", "symbols": ["udt", "stmtSep"], "postprocess": 
        ([$1, $2]): Module => ({
          stmts: [],
          procs: [],
          udts: $1 ? [$1] : [],
        })
            },
    {"name": "proc", "symbols": ["fnProc"], "postprocess": id},
    {"name": "proc", "symbols": ["subProc"], "postprocess": id},
    {"name": "proc", "symbols": ["procDecl"], "postprocess": discard},
    {"name": "fnProc$ebnf$1$subexpression$1", "symbols": [(lexer.has("LPAREN") ? {type: "LPAREN"} : LPAREN), "params", (lexer.has("RPAREN") ? {type: "RPAREN"} : RPAREN)]},
    {"name": "fnProc$ebnf$1", "symbols": ["fnProc$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "fnProc$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "fnProc$ebnf$2", "symbols": [(lexer.has("STATIC") ? {type: "STATIC"} : STATIC)], "postprocess": id},
    {"name": "fnProc$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "fnProc", "symbols": [(lexer.has("FUNCTION") ? {type: "FUNCTION"} : FUNCTION), (lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), "fnProc$ebnf$1", "fnProc$ebnf$2", "stmts", (lexer.has("END") ? {type: "END"} : END), (lexer.has("FUNCTION") ? {type: "FUNCTION"} : FUNCTION)], "postprocess": 
        ([$1, $2, $3, $4, $5, $6, $7]): FnProc => ({
          type: ProcType.FN,
          name: $2.value,
          params: $3 ? $3[1] : [],
          stmts: $5,
          isDefaultStatic: !!$4,
          ...useLoc($1),
        })
            },
    {"name": "subProc$ebnf$1$subexpression$1", "symbols": [(lexer.has("LPAREN") ? {type: "LPAREN"} : LPAREN), "params", (lexer.has("RPAREN") ? {type: "RPAREN"} : RPAREN)]},
    {"name": "subProc$ebnf$1", "symbols": ["subProc$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "subProc$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "subProc$ebnf$2", "symbols": [(lexer.has("STATIC") ? {type: "STATIC"} : STATIC)], "postprocess": id},
    {"name": "subProc$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "subProc", "symbols": [(lexer.has("SUB") ? {type: "SUB"} : SUB), (lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), "subProc$ebnf$1", "subProc$ebnf$2", "stmts", (lexer.has("END") ? {type: "END"} : END), (lexer.has("SUB") ? {type: "SUB"} : SUB)], "postprocess": 
        ([$1, $2, $3, $4, $5, $6, $7]): SubProc => ({
          type: ProcType.SUB,
          name: $2.value,
          params: $3 ? $3[1] : [],
          stmts: $5,
          isDefaultStatic: !!$4,
          ...useLoc($1),
        })
            },
    {"name": "procDecl$subexpression$1", "symbols": [(lexer.has("FUNCTION") ? {type: "FUNCTION"} : FUNCTION)]},
    {"name": "procDecl$subexpression$1", "symbols": [(lexer.has("SUB") ? {type: "SUB"} : SUB)]},
    {"name": "procDecl$ebnf$1$subexpression$1", "symbols": [(lexer.has("LPAREN") ? {type: "LPAREN"} : LPAREN), "params", (lexer.has("RPAREN") ? {type: "RPAREN"} : RPAREN)]},
    {"name": "procDecl$ebnf$1", "symbols": ["procDecl$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "procDecl$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "procDecl", "symbols": [(lexer.has("DECLARE") ? {type: "DECLARE"} : DECLARE), "procDecl$subexpression$1", (lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), "procDecl$ebnf$1"], "postprocess": discard},
    {"name": "params", "symbols": [], "postprocess": (): Array<Param> => []},
    {"name": "params$ebnf$1", "symbols": []},
    {"name": "params$ebnf$1$subexpression$1", "symbols": ["param", (lexer.has("COMMA") ? {type: "COMMA"} : COMMA)]},
    {"name": "params$ebnf$1", "symbols": ["params$ebnf$1", "params$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "params", "symbols": ["params$ebnf$1", "param"], "postprocess": 
        ([$1, $2]) => [...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []), $2]
            },
    {"name": "param", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), "singularTypeExprOrDefault"], "postprocess": 
        ([$1, $2]): Param => ({
          name: $1.value,
          typeExpr: $2,
          ...useLoc($1),
        })
            },
    {"name": "param", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), (lexer.has("LPAREN") ? {type: "LPAREN"} : LPAREN), (lexer.has("RPAREN") ? {type: "RPAREN"} : RPAREN), "singularTypeExprOrDefault"], "postprocess": 
        ([$1, $2, $3, $4]): Param => ({
          name: $1.value,
          typeExpr: {
            type: DataTypeExprType.ARRAY,
            elementTypeExpr: $4,
            dimensionSpecExprs: [],
            ...useLoc($1),
          },
          ...useLoc($1),
        })
            },
    {"name": "udt", "symbols": [(lexer.has("TYPE") ? {type: "TYPE"} : TYPE), (lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), "fieldExprs", (lexer.has("END") ? {type: "END"} : END), (lexer.has("TYPE") ? {type: "TYPE"} : TYPE)], "postprocess": 
        ([$1, $2, $3, $4, $5]): Udt => ({
          name: $2.value,
          fieldSpecExprs: $3,
          ...useLoc($1),
        })
            },
    {"name": "fieldExprs$ebnf$1", "symbols": ["stmtSep"], "postprocess": id},
    {"name": "fieldExprs$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "fieldExprs", "symbols": ["fieldExprs$ebnf$1"], "postprocess": (): Array<FieldSpecExpr> => []},
    {"name": "fieldExprs$ebnf$2", "symbols": ["stmtSep"], "postprocess": id},
    {"name": "fieldExprs$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "fieldExprs$ebnf$3", "symbols": []},
    {"name": "fieldExprs$ebnf$3$subexpression$1", "symbols": ["fieldExpr", "stmtSep"]},
    {"name": "fieldExprs$ebnf$3", "symbols": ["fieldExprs$ebnf$3", "fieldExprs$ebnf$3$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "fieldExprs$ebnf$4", "symbols": ["stmtSep"], "postprocess": id},
    {"name": "fieldExprs$ebnf$4", "symbols": [], "postprocess": () => null},
    {"name": "fieldExprs", "symbols": ["fieldExprs$ebnf$2", "fieldExprs$ebnf$3", "fieldExpr", "fieldExprs$ebnf$4"], "postprocess": 
        ([$1, $2, $3, $4]): Array<FieldSpecExpr> => [
          ...($2 ? $2.map(([$2_1, $2_2]: Array<any>) => $2_1) : []),
          $3,
        ]
            },
    {"name": "fieldExpr", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), "singularTypeExpr"], "postprocess": 
        ([$1, $2]): FieldSpecExpr => ({
          name: $1.value,
          typeExpr: $2,
          ...useLoc($1),
        })
            },
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
    {"name": "nonLabelStmt", "symbols": ["dimStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["assignStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["constStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["gotoStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["ifStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["selectStmt"], "postprocess": id},
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
    {"name": "nonLabelStmt", "symbols": ["callStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["exitProcStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["endStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["swapStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["printStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["inputStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["defTypeStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["dataStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["readStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["restoreStmt"], "postprocess": id},
    {"name": "nonLabelStmt", "symbols": ["locateStmt"], "postprocess": id},
    {"name": "labelStmt", "symbols": [(lexer.has("NUMERIC_LITERAL") ? {type: "NUMERIC_LITERAL"} : NUMERIC_LITERAL)], "postprocess": 
        ([$1], _, reject): LabelStmt | Reject =>
            $1.isFirstTokenOnLine ? {
              type: StmtType.LABEL,
              label: $1.value,
              ...useLoc($1),
            } : reject
            },
    {"name": "labelStmt", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), (lexer.has("COLON") ? {type: "COLON"} : COLON)], "postprocess": 
        ([$1, $2], _, reject): LabelStmt | Reject =>
          // A line like "f: f:" should parse as a label "f" followed by an invocation of the
          // sub "f", so need to explicitly disambiguate here.
          $1.isFirstTokenOnLine ? {
            type: StmtType.LABEL,
            label: $1.value,
            ...useLoc($1),
          } : reject
            },
    {"name": "dimStmt$ebnf$1", "symbols": [(lexer.has("SHARED") ? {type: "SHARED"} : SHARED)], "postprocess": id},
    {"name": "dimStmt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "dimStmt", "symbols": [(lexer.has("DIM") ? {type: "DIM"} : DIM), "dimStmt$ebnf$1", "varDecls"], "postprocess": 
        ([$1, $2, $3]): DimStmt => ({
          type: StmtType.DIM,
          dimType: $2 ? DimType.SHARED : DimType.LOCAL,
          varDecls: $3,
          ...useLoc($1),
        })
            },
    {"name": "dimStmt", "symbols": [(lexer.has("STATIC") ? {type: "STATIC"} : STATIC), "varDecls"], "postprocess": 
        ([$1, $2]): DimStmt => ({
          type: StmtType.DIM,
          dimType: DimType.STATIC,
          varDecls: $2,
          ...useLoc($1),
        })
            },
    {"name": "dimStmt", "symbols": [(lexer.has("SHARED") ? {type: "SHARED"} : SHARED), "varDecls"], "postprocess": 
        ([$1, $2]): DimStmt => ({
          type: StmtType.DIM,
          dimType: DimType.SHARED,
          varDecls: $2,
          ...useLoc($1),
        })
            },
    {"name": "varDecls$ebnf$1", "symbols": []},
    {"name": "varDecls$ebnf$1$subexpression$1", "symbols": ["varDecl", (lexer.has("COMMA") ? {type: "COMMA"} : COMMA)]},
    {"name": "varDecls$ebnf$1", "symbols": ["varDecls$ebnf$1", "varDecls$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "varDecls", "symbols": ["varDecls$ebnf$1", "varDecl"], "postprocess": 
        ([$1, $2]): Array<VarDecl> => [
          ...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []),
          $2,
        ]
            },
    {"name": "varDecl", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), "singularTypeExprOrDefault"], "postprocess": 
        ([$1, $2]): VarDecl => ({
          name: $1.value,
          typeExpr: $2,
          ...useLoc($1),
        })
            },
    {"name": "varDecl$ebnf$1", "symbols": ["dimensionSpecExprs"], "postprocess": id},
    {"name": "varDecl$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "varDecl", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), (lexer.has("LPAREN") ? {type: "LPAREN"} : LPAREN), "varDecl$ebnf$1", (lexer.has("RPAREN") ? {type: "RPAREN"} : RPAREN), "singularTypeExprOrDefault"], "postprocess": 
        ([$1, $2, $3, $4, $5]): VarDecl => ({
          name: $1.value,
          typeExpr: {
            type: DataTypeExprType.ARRAY,
            elementTypeExpr: $5,
            dimensionSpecExprs: $3 ?? [],
            ...useLoc($1),
          },
          ...useLoc($1),
        })
            },
    {"name": "dimensionSpecExprs$ebnf$1", "symbols": []},
    {"name": "dimensionSpecExprs$ebnf$1$subexpression$1", "symbols": ["dimensionSpecExpr", (lexer.has("COMMA") ? {type: "COMMA"} : COMMA)]},
    {"name": "dimensionSpecExprs$ebnf$1", "symbols": ["dimensionSpecExprs$ebnf$1", "dimensionSpecExprs$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "dimensionSpecExprs", "symbols": ["dimensionSpecExprs$ebnf$1", "dimensionSpecExpr"], "postprocess": 
        ([$1, $2]): Array<ArrayDimensionSpecExpr> => [
          ...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []),
          $2,
        ]
            },
    {"name": "dimensionSpecExpr", "symbols": ["expr"], "postprocess": ([$1]): ArrayDimensionSpecExpr => ({ maxIdxExpr: $1, ...useLoc($1) })},
    {"name": "dimensionSpecExpr", "symbols": ["expr", (lexer.has("TO") ? {type: "TO"} : TO), "expr"], "postprocess": 
        ([$1, $2, $3]): ArrayDimensionSpecExpr => ({
          minIdxExpr: $1,
          maxIdxExpr: $3,
          ...useLoc($1),
        })
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
    {"name": "constStmt", "symbols": [(lexer.has("CONST") ? {type: "CONST"} : CONST), "constDefs"], "postprocess": 
        ([$1, $2]): ConstStmt => ({ type: StmtType.CONST, constDefs: $2, ...useLoc($1) })
            },
    {"name": "constDefs$ebnf$1", "symbols": []},
    {"name": "constDefs$ebnf$1$subexpression$1", "symbols": ["constDef", (lexer.has("COMMA") ? {type: "COMMA"} : COMMA)]},
    {"name": "constDefs$ebnf$1", "symbols": ["constDefs$ebnf$1", "constDefs$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "constDefs", "symbols": ["constDefs$ebnf$1", "constDef"], "postprocess": 
        ([$1, $2]): Array<ConstDef> => [
          ...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []),
          $2,
        ]
            },
    {"name": "constDef", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), (lexer.has("EQ") ? {type: "EQ"} : EQ), "expr"], "postprocess": 
        ([$1, $2, $3]): ConstDef => ({ name: $1.value, valueExpr: $3, ...useLoc($1) })
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
              ifBranches: [ { condExpr: $2, stmts: $4, ...useLoc($1) } ],
              elseBranch: $5 ? { stmts: $5[1], ...useLoc($5[0]) } : null,
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
                { condExpr: $2, stmts: $5, ...useLoc($1) },
                ...$6.map(
                  ([$6_1, $6_2, $6_3, $6_4, $6_5]: Array<any>) => ({
                    condExpr: $6_2,
                    stmts: $6_5,
                    ...useLoc($6_1),
                  })),
              ],
              elseBranch: $7 ? { stmts: $7[1], ...useLoc($7[0]) } : null,
              ...useLoc($1),
            })
            },
    {"name": "selectStmt$ebnf$1", "symbols": ["stmtSep"], "postprocess": id},
    {"name": "selectStmt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "selectStmt$ebnf$2$subexpression$1", "symbols": [(lexer.has("CASE") ? {type: "CASE"} : CASE), "caseExprs", "stmts"]},
    {"name": "selectStmt$ebnf$2", "symbols": ["selectStmt$ebnf$2$subexpression$1"]},
    {"name": "selectStmt$ebnf$2$subexpression$2", "symbols": [(lexer.has("CASE") ? {type: "CASE"} : CASE), "caseExprs", "stmts"]},
    {"name": "selectStmt$ebnf$2", "symbols": ["selectStmt$ebnf$2", "selectStmt$ebnf$2$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "selectStmt$ebnf$3$subexpression$1", "symbols": [(lexer.has("CASE") ? {type: "CASE"} : CASE), (lexer.has("ELSE") ? {type: "ELSE"} : ELSE), "stmts"]},
    {"name": "selectStmt$ebnf$3", "symbols": ["selectStmt$ebnf$3$subexpression$1"], "postprocess": id},
    {"name": "selectStmt$ebnf$3", "symbols": [], "postprocess": () => null},
    {"name": "selectStmt", "symbols": [(lexer.has("SELECT") ? {type: "SELECT"} : SELECT), (lexer.has("CASE") ? {type: "CASE"} : CASE), "expr", "selectStmt$ebnf$1", "selectStmt$ebnf$2", "selectStmt$ebnf$3", (lexer.has("END") ? {type: "END"} : END), (lexer.has("SELECT") ? {type: "SELECT"} : SELECT)], "postprocess": 
        ([$1, $2, $3, $4, $5, $6, $7, $8]): SelectStmt => ({
          type: StmtType.SELECT,
          testExpr: $3,
          ifBranches: $5.map(
            ([$5_1, $5_2, $5_3]: Array<any>) => ({
              condExprs: $5_2,
              stmts: $5_3,
              ...useLoc($5_1),
            })
          ),
          elseBranch: $6 ? { stmts: $6[2], ...useLoc($6[0]) } : null,
          ...useLoc($1),
        })
            },
    {"name": "caseExprs$ebnf$1", "symbols": []},
    {"name": "caseExprs$ebnf$1$subexpression$1", "symbols": ["caseExpr", (lexer.has("COMMA") ? {type: "COMMA"} : COMMA)]},
    {"name": "caseExprs$ebnf$1", "symbols": ["caseExprs$ebnf$1", "caseExprs$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "caseExprs", "symbols": ["caseExprs$ebnf$1", "caseExpr"], "postprocess": 
        ([$1, $2]): Array<CaseExpr> =>
            [...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []), $2]
              },
    {"name": "caseExpr", "symbols": ["expr"], "postprocess": 
        ([$1]): CaseExpr => ({
          type: CaseExprType.VALUE,
          valueExpr: $1,
        })
            },
    {"name": "caseExpr", "symbols": ["expr", (lexer.has("TO") ? {type: "TO"} : TO), "expr"], "postprocess": 
        ([$1, $2, $3]): CaseExpr => ({
          type: CaseExprType.RANGE,
          lowerBoundExpr: $1,
          upperBoundExpr: $3,
        })
            },
    {"name": "caseExpr$subexpression$1", "symbols": [(lexer.has("EQ") ? {type: "EQ"} : EQ)]},
    {"name": "caseExpr$subexpression$1", "symbols": [(lexer.has("NE") ? {type: "NE"} : NE)]},
    {"name": "caseExpr$subexpression$1", "symbols": [(lexer.has("GT") ? {type: "GT"} : GT)]},
    {"name": "caseExpr$subexpression$1", "symbols": [(lexer.has("GTE") ? {type: "GTE"} : GTE)]},
    {"name": "caseExpr$subexpression$1", "symbols": [(lexer.has("LT") ? {type: "LT"} : LT)]},
    {"name": "caseExpr$subexpression$1", "symbols": [(lexer.has("LTE") ? {type: "LTE"} : LTE)]},
    {"name": "caseExpr", "symbols": [(lexer.has("IS") ? {type: "IS"} : IS), "caseExpr$subexpression$1", "expr"], "postprocess": 
        ([$1, $2, $3]): CaseExpr => ({
          type: CaseExprType.COMP,
          op: id($2).type.toLowerCase(),
          rightExpr: $3,
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
    {"name": "callStmt$ebnf$1$subexpression$1", "symbols": [(lexer.has("LPAREN") ? {type: "LPAREN"} : LPAREN), "exprs", (lexer.has("RPAREN") ? {type: "RPAREN"} : RPAREN)]},
    {"name": "callStmt$ebnf$1", "symbols": ["callStmt$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "callStmt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "callStmt", "symbols": [(lexer.has("CALL") ? {type: "CALL"} : CALL), (lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), "callStmt$ebnf$1"], "postprocess": 
        ([$1, $2, $3]): CallStmt => ({
          type: StmtType.CALL,
          name: $2.value,
          argExprs: $3 ? $3[1] : [],
          ...useLoc($1),
        })
              },
    {"name": "callStmt", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), "exprs"], "postprocess": 
        ([$1, $2], _, reject): CallStmt | Reject => {
          // A line like "f: f:" should parse as a label "f" followed by an invocation of the
          // sub "f", so need to explicitly disambiguate here.
          if ($1.isFirstTokenOnLine && $2.length === 0) {
            const nextToken = lexer.peek();
            if (nextToken && nextToken.type === 'COLON') {
              return reject;
            }
          }
          // A line like "A(0) = 42" should parse as an assignment rather than a CALL statement.
          if ($2.length === 1 && $2[0].type === ExprType.BINARY_OP && $2[0].op === BinaryOp.EQ) {
              return reject;
          }
          return {
            type: StmtType.CALL,
            name: $1.value,
            argExprs: $2,
            ...useLoc($1),
          };
        }
            },
    {"name": "exitProcStmt", "symbols": [(lexer.has("EXIT") ? {type: "EXIT"} : EXIT), (lexer.has("FUNCTION") ? {type: "FUNCTION"} : FUNCTION)], "postprocess": 
        ([$1, $2]): ExitProcStmt => ({
          type: StmtType.EXIT_PROC,
          procType: ProcType.FN,
          ...useLoc($1),
        })
              },
    {"name": "exitProcStmt", "symbols": [(lexer.has("EXIT") ? {type: "EXIT"} : EXIT), (lexer.has("SUB") ? {type: "SUB"} : SUB)], "postprocess": 
        ([$1, $2]): ExitProcStmt => ({
          type: StmtType.EXIT_PROC,
          procType: ProcType.SUB,
          ...useLoc($1),
        })
              },
    {"name": "endStmt$subexpression$1", "symbols": [(lexer.has("END") ? {type: "END"} : END)]},
    {"name": "endStmt$subexpression$1", "symbols": [(lexer.has("SYSTEM") ? {type: "SYSTEM"} : SYSTEM)]},
    {"name": "endStmt", "symbols": ["endStmt$subexpression$1"], "postprocess": ([$1]): EndStmt => ({ type: StmtType.END, ...useLoc(id($1)) })},
    {"name": "swapStmt", "symbols": [(lexer.has("SWAP") ? {type: "SWAP"} : SWAP), "lhsExpr", (lexer.has("COMMA") ? {type: "COMMA"} : COMMA), "lhsExpr"], "postprocess": 
        ([$1, $2, $3, $4]): SwapStmt => ({
          type: StmtType.SWAP,
          leftExpr: $2,
          rightExpr: $4,
          ...useLoc($1),
        })
            },
    {"name": "printStmt$ebnf$1$subexpression$1", "symbols": [(lexer.has("USING") ? {type: "USING"} : USING), "expr", (lexer.has("SEMICOLON") ? {type: "SEMICOLON"} : SEMICOLON)]},
    {"name": "printStmt$ebnf$1", "symbols": ["printStmt$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "printStmt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "printStmt", "symbols": [(lexer.has("PRINT") ? {type: "PRINT"} : PRINT), "printStmt$ebnf$1", "printArgs"], "postprocess": 
        ([$1, $2, $3]): PrintStmt => ({
          type: StmtType.PRINT,
          args: $3,
          formatExpr: $2 ? $2[1] : null,
          ...useLoc($1), })
            },
    {"name": "printArgs", "symbols": [], "postprocess": () => []},
    {"name": "printArgs", "symbols": ["expr"], "postprocess": ([$1]) => [$1]},
    {"name": "printArgs$ebnf$1$subexpression$1$ebnf$1", "symbols": ["expr"], "postprocess": id},
    {"name": "printArgs$ebnf$1$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "printArgs$ebnf$1$subexpression$1", "symbols": ["printArgs$ebnf$1$subexpression$1$ebnf$1", "printSep"]},
    {"name": "printArgs$ebnf$1", "symbols": ["printArgs$ebnf$1$subexpression$1"]},
    {"name": "printArgs$ebnf$1$subexpression$2$ebnf$1", "symbols": ["expr"], "postprocess": id},
    {"name": "printArgs$ebnf$1$subexpression$2$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "printArgs$ebnf$1$subexpression$2", "symbols": ["printArgs$ebnf$1$subexpression$2$ebnf$1", "printSep"]},
    {"name": "printArgs$ebnf$1", "symbols": ["printArgs$ebnf$1", "printArgs$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "printArgs$ebnf$2", "symbols": ["expr"], "postprocess": id},
    {"name": "printArgs$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "printArgs", "symbols": ["printArgs$ebnf$1", "printArgs$ebnf$2"], "postprocess":  
        ([$1, $2]) => [
          ..._.flatMap($1, ([$1_1, $1_2]) => [...($1_1 ? [$1_1]: []), $1_2]),
          ...($2 ? [$2] : []),
        ]
            },
    {"name": "printSep", "symbols": [(lexer.has("COMMA") ? {type: "COMMA"} : COMMA)], "postprocess": () => PrintSep.COMMA},
    {"name": "printSep", "symbols": [(lexer.has("SEMICOLON") ? {type: "SEMICOLON"} : SEMICOLON)], "postprocess": () => PrintSep.SEMICOLON},
    {"name": "inputStmt$ebnf$1$subexpression$1", "symbols": [(lexer.has("STRING_LITERAL") ? {type: "STRING_LITERAL"} : STRING_LITERAL), "inputStmtPromptSep"]},
    {"name": "inputStmt$ebnf$1", "symbols": ["inputStmt$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "inputStmt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "inputStmt", "symbols": [(lexer.has("INPUT") ? {type: "INPUT"} : INPUT), "inputStmt$ebnf$1", "lhsExprs"], "postprocess": 
        ([$1, $2, $3]): InputStmt => ({
          type: StmtType.INPUT,
          prompt: $2 ? `${$2[0].value}${$2[1] ? '? ': ''}` : '? ',
          inputType: InputType.TOKENIZED,
          targetExprs: $3,
          ...useLoc($1),
        })
            },
    {"name": "inputStmt$ebnf$2$subexpression$1", "symbols": [(lexer.has("STRING_LITERAL") ? {type: "STRING_LITERAL"} : STRING_LITERAL), "inputStmtPromptSep"]},
    {"name": "inputStmt$ebnf$2", "symbols": ["inputStmt$ebnf$2$subexpression$1"], "postprocess": id},
    {"name": "inputStmt$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "inputStmt", "symbols": [(lexer.has("LINE") ? {type: "LINE"} : LINE), (lexer.has("INPUT") ? {type: "INPUT"} : INPUT), "inputStmt$ebnf$2", "lhsExpr"], "postprocess": 
        ([$1, $2, $3, $4]): InputStmt => ({
          type: StmtType.INPUT,
          prompt: $3 ? $3[0].value : '',
          inputType: InputType.LINE,
          targetExprs: [$4],
          ...useLoc($1),
        })
            },
    {"name": "inputStmtPromptSep", "symbols": [(lexer.has("COMMA") ? {type: "COMMA"} : COMMA)], "postprocess": () => false},
    {"name": "inputStmtPromptSep", "symbols": [(lexer.has("SEMICOLON") ? {type: "SEMICOLON"} : SEMICOLON)], "postprocess": () => true},
    {"name": "defTypeStmt", "symbols": [(lexer.has("DEFINT") ? {type: "DEFINT"} : DEFINT), "defTypeRanges"], "postprocess": 
        ([$1, $2]): DefTypeStmt => ({
          type: StmtType.DEF_TYPE,
          typeSpec: integerSpec(),
          ranges: $2,
          ...useLoc($1),
        })
            },
    {"name": "defTypeStmt", "symbols": [(lexer.has("DEFSNG") ? {type: "DEFSNG"} : DEFSNG), "defTypeRanges"], "postprocess": 
        ([$1, $2]): DefTypeStmt => ({
          type: StmtType.DEF_TYPE,
          typeSpec: singleSpec(),
          ranges: $2,
          ...useLoc($1),
        })
            },
    {"name": "defTypeStmt", "symbols": [(lexer.has("DEFDBL") ? {type: "DEFDBL"} : DEFDBL), "defTypeRanges"], "postprocess": 
        ([$1, $2]): DefTypeStmt => ({
          type: StmtType.DEF_TYPE,
          typeSpec: doubleSpec(),
          ranges: $2,
          ...useLoc($1),
        })
            },
    {"name": "defTypeStmt", "symbols": [(lexer.has("DEFLNG") ? {type: "DEFLNG"} : DEFLNG), "defTypeRanges"], "postprocess": 
        ([$1, $2]): DefTypeStmt => ({
          type: StmtType.DEF_TYPE,
          typeSpec: longSpec(),
          ranges: $2,
          ...useLoc($1),
        })
            },
    {"name": "defTypeStmt", "symbols": [(lexer.has("DEFSTR") ? {type: "DEFSTR"} : DEFSTR), "defTypeRanges"], "postprocess": 
        ([$1, $2]): DefTypeStmt => ({
          type: StmtType.DEF_TYPE,
          typeSpec: stringSpec(),
          ranges: $2,
          ...useLoc($1),
        })
            },
    {"name": "defTypeRanges$ebnf$1", "symbols": []},
    {"name": "defTypeRanges$ebnf$1$subexpression$1", "symbols": ["defTypeRange", (lexer.has("COMMA") ? {type: "COMMA"} : COMMA)]},
    {"name": "defTypeRanges$ebnf$1", "symbols": ["defTypeRanges$ebnf$1", "defTypeRanges$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "defTypeRanges", "symbols": ["defTypeRanges$ebnf$1", "defTypeRange"], "postprocess": 
        ([$1, $2]) => [...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []), $2]
            },
    {"name": "defTypeRange", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER)], "postprocess": 
        ([$1]): DefTypeRange => ({
          minPrefix: $1.value,
          maxPrefix: $1.value,
          ...useLoc($1),
        })
            },
    {"name": "defTypeRange", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), (lexer.has("SUB") ? {type: "SUB"} : SUB), (lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER)], "postprocess": 
        ([$1, $2, $3]): DefTypeRange => ({
          minPrefix: $1.value,
          maxPrefix: $3.value,
          ...useLoc($1),
        })
            },
    {"name": "dataStmt$ebnf$1", "symbols": []},
    {"name": "dataStmt$ebnf$1$subexpression$1", "symbols": ["dataItem", (lexer.has("COMMA") ? {type: "COMMA"} : COMMA)]},
    {"name": "dataStmt$ebnf$1", "symbols": ["dataStmt$ebnf$1", "dataStmt$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "dataStmt", "symbols": [(lexer.has("DATA") ? {type: "DATA"} : DATA), "dataStmt$ebnf$1", "dataItem"], "postprocess": 
        ([$1, $2, $3]): DataStmt => ({
          type: StmtType.DATA,
          data: [
            ...$2 ? $2.map(([$2_1, $2_2]: Array<any>) => $2_1) : [],
            $3,
          ],
          ...useLoc($1),
        })
            },
    {"name": "dataItem", "symbols": [], "postprocess": () => buildDataItem(lexer.lastToken!, null)},
    {"name": "dataItem", "symbols": ["literalExpr"], "postprocess": ([$1]) => buildDataItem($1, $1.value)},
    {"name": "dataItem", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER)], "postprocess": ([$1]) => buildDataItem($1, $1.value)},
    {"name": "readStmt", "symbols": [(lexer.has("READ") ? {type: "READ"} : READ), "lhsExprs"], "postprocess": 
        ([$1, $2]): ReadStmt => ({
          type: StmtType.READ,
          targetExprs: $2,
          ...useLoc($1),
        })
            },
    {"name": "restoreStmt$ebnf$1", "symbols": ["labelRef"], "postprocess": id},
    {"name": "restoreStmt$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "restoreStmt", "symbols": [(lexer.has("RESTORE") ? {type: "RESTORE"} : RESTORE), "restoreStmt$ebnf$1"], "postprocess": 
        ([$1, $2]): RestoreStmt =>
            ({ type: StmtType.RESTORE, destLabel: $2, ...useLoc($1) })
            },
    {"name": "locateStmt$ebnf$1", "symbols": []},
    {"name": "locateStmt$ebnf$1$subexpression$1$ebnf$1", "symbols": ["expr"], "postprocess": id},
    {"name": "locateStmt$ebnf$1$subexpression$1$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "locateStmt$ebnf$1$subexpression$1", "symbols": ["locateStmt$ebnf$1$subexpression$1$ebnf$1", (lexer.has("COMMA") ? {type: "COMMA"} : COMMA)]},
    {"name": "locateStmt$ebnf$1", "symbols": ["locateStmt$ebnf$1", "locateStmt$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "locateStmt", "symbols": [(lexer.has("LOCATE") ? {type: "LOCATE"} : LOCATE), "locateStmt$ebnf$1", "expr"], "postprocess": 
        // Hack: LOCATE is parsed as a CALL statement, and implemented as a built-in SUB.
        ([$1, $2, $3]): CallStmt => ({
          type: StmtType.CALL,
          name: 'locate',
          argExprs: [
            ...($2 ? $2.map(([$2_1, $2_2]: Array<any>) => $2_1 ?? {
              type: ExprType.LITERAL,
              value: NaN,
              ...useLoc($2_2),
            }) : []),
            $3,
          ],
          ...useLoc($1),
        })
            },
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
    {"name": "lhsExprs$ebnf$1", "symbols": []},
    {"name": "lhsExprs$ebnf$1$subexpression$1", "symbols": ["lhsExpr", (lexer.has("COMMA") ? {type: "COMMA"} : COMMA)]},
    {"name": "lhsExprs$ebnf$1", "symbols": ["lhsExprs$ebnf$1", "lhsExprs$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "lhsExprs", "symbols": ["lhsExprs$ebnf$1", "lhsExpr"], "postprocess": 
        ([$1, $2]) => [...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []), $2]
              },
    {"name": "labelRef$subexpression$1", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER)]},
    {"name": "labelRef$subexpression$1", "symbols": [(lexer.has("NUMERIC_LITERAL") ? {type: "NUMERIC_LITERAL"} : NUMERIC_LITERAL)]},
    {"name": "labelRef", "symbols": ["labelRef$subexpression$1"], "postprocess": ([$1]) => id($1).value},
    {"name": "elementaryTypeSpec", "symbols": [(lexer.has("INTEGER") ? {type: "INTEGER"} : INTEGER)], "postprocess": () => integerSpec()},
    {"name": "elementaryTypeSpec", "symbols": [(lexer.has("LONG") ? {type: "LONG"} : LONG)], "postprocess": () => longSpec()},
    {"name": "elementaryTypeSpec", "symbols": [(lexer.has("SINGLE") ? {type: "SINGLE"} : SINGLE)], "postprocess": () => singleSpec()},
    {"name": "elementaryTypeSpec", "symbols": [(lexer.has("DOUBLE") ? {type: "DOUBLE"} : DOUBLE)], "postprocess": () => doubleSpec()},
    {"name": "elementaryTypeSpec$ebnf$1$subexpression$1", "symbols": [(lexer.has("MUL") ? {type: "MUL"} : MUL), "expr2"]},
    {"name": "elementaryTypeSpec$ebnf$1", "symbols": ["elementaryTypeSpec$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "elementaryTypeSpec$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "elementaryTypeSpec", "symbols": [(lexer.has("STRING") ? {type: "STRING"} : STRING), "elementaryTypeSpec$ebnf$1"], "postprocess": () => stringSpec()},
    {"name": "singularTypeExpr", "symbols": [(lexer.has("AS") ? {type: "AS"} : AS), "elementaryTypeSpec"], "postprocess":  ([$1, $2]): SingularTypeExpr  => ({
          type: DataTypeExprType.ELEMENTARY,
          typeSpec: $2,
          ...useLoc($1),
        })
            },
    {"name": "singularTypeExpr", "symbols": [(lexer.has("AS") ? {type: "AS"} : AS), (lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER)], "postprocess":  ([$1, $2]): SingularTypeExpr  => ({
          type: DataTypeExprType.UDT,
          name: $2.value,
          ...useLoc($1),
        })
            },
    {"name": "singularTypeExprOrDefault", "symbols": [], "postprocess":  ([$1]): SingularTypeExpr => ({
          type: DataTypeExprType.ELEMENTARY,
          loc: {line: lexer.lastToken!.line, col: lexer.lastToken!.col},
        })
            },
    {"name": "singularTypeExprOrDefault", "symbols": ["singularTypeExpr"], "postprocess": id},
    {"name": "expr", "symbols": ["expr10"], "postprocess": id},
    {"name": "lhsExpr", "symbols": ["varRefExpr"], "postprocess": id},
    {"name": "lhsExpr", "symbols": ["fnCallExpr"], "postprocess": id},
    {"name": "lhsExpr", "symbols": ["memberExpr"], "postprocess": id},
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
    {"name": "expr0", "symbols": ["fnCallExpr"], "postprocess": id},
    {"name": "expr0", "symbols": ["literalExpr"], "postprocess": id},
    {"name": "expr0", "symbols": ["memberExpr"], "postprocess": id},
    {"name": "expr0", "symbols": [(lexer.has("LPAREN") ? {type: "LPAREN"} : LPAREN), "expr", (lexer.has("RPAREN") ? {type: "RPAREN"} : RPAREN)], "postprocess": 
        ([$1, $2, $3]): UnaryOpExpr => ({
          type: ExprType.UNARY_OP,
          op: UnaryOp.PARENS,
          rightExpr: $2,
          ...useLoc($1),
        })
            },
    {"name": "varRefExpr", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER)], "postprocess": 
        ([$1]): VarRefExpr =>
            ({ type: ExprType.VAR_REF, name: $1.value, ...useLoc($1) })
            },
    {"name": "fnCallExpr", "symbols": [(lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER), (lexer.has("LPAREN") ? {type: "LPAREN"} : LPAREN), "exprs", (lexer.has("RPAREN") ? {type: "RPAREN"} : RPAREN)], "postprocess": 
        ([$1, $2, $3, $4]): FnCallExpr => ({
          type: ExprType.FN_CALL,
          name: $1.value,
          argExprs: $3,
          ...useLoc($1),
        })
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
            },
    {"name": "memberExpr", "symbols": ["lhsExpr", (lexer.has("DOT") ? {type: "DOT"} : DOT), (lexer.has("IDENTIFIER") ? {type: "IDENTIFIER"} : IDENTIFIER)], "postprocess": 
        ([$1, $2, $3]): MemberExpr => ({
          type: ExprType.MEMBER,
          udtExpr: $1,
          fieldName: $3.value,
          ...useLoc($1),
        })
            },
    {"name": "exprs", "symbols": [], "postprocess": (): Array<Expr> => []},
    {"name": "exprs$ebnf$1", "symbols": []},
    {"name": "exprs$ebnf$1$subexpression$1", "symbols": ["expr", (lexer.has("COMMA") ? {type: "COMMA"} : COMMA)]},
    {"name": "exprs$ebnf$1", "symbols": ["exprs$ebnf$1", "exprs$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "exprs", "symbols": ["exprs$ebnf$1", "expr"], "postprocess": 
        ([$1, $2]): Array<Expr> =>
            [...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []), $2]
              }
  ],
  ParserStart: "module",
};

export default grammar;
