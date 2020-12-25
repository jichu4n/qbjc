@preprocessor typescript

@{%
import {Token} from 'moo';
import lexer from './lexer';
import {
  AstNode,
  Module,
  ProcType,
  FnProc,
  Param,
  Expr,
  ExprType,
  BinaryOpExpr,
  UnaryOpExpr,
  LiteralExpr,
  VarRefExpr,
  FnCallExpr,
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

%}

@lexer lexer

# ----
# Program structure
# ----

module ->
    stmtSep:? moduleComponentWithSep:+  {%
        ([$1, $2]): Module => $2.reduce((a: Module, b: Module) => ({
          stmts: [...a.stmts, ...b.stmts],
          procs: [...a.procs, ...b.procs],
        }))
    %}

moduleComponentWithSep ->
      stmtWithSep  {%
          ([$1]): Module => ({
            stmts: [$1],
            procs: [],
          })
      %}
    | proc stmtSep  {%
          ([$1, $2]): Module => ({
            stmts: [],
            procs: [$1],
          })
    %}

proc ->
    fnProc  {% id %}

fnProc ->
    %FUNCTION %IDENTIFIER (%LPAREN params %RPAREN):? stmts %END %FUNCTION  {%
        ([$1, $2, $3, $4, $5, $6]): FnProc => ({
          type: ProcType.FN,
          name: $2.value,
          params: $3 ? id($3)[1] : [],
          stmts: $4,
          ...useLoc($1),
        })
    %}

params ->
      null  {% (): Array<Param> => [] %}
    | (param %COMMA):* param  {% ([$1, $2]) => [...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []), $2] %}

param ->
    %IDENTIFIER  {% ([$1]): Param => ({ name: $1.value }) %}

# ----
# Statements
# ----
stmts ->
    stmtSep:? stmtWithSep:*  {% ([$1, $2]) => $2 %}

stmtSep ->
    (%COLON | %NEWLINE):+  {% discard %}

stmtWithSep ->
      labelStmt stmtSep:?  {% id %}
    | nonLabelStmt stmtSep  {% id %}

nonLabelStmt ->
      assignStmt  {% id %}
    | gotoStmt  {% id %}
    | ifStmt  {% id %}
    | whileStmt  {% id %}
    | doWhileStmt  {% id %}
    | doUntilStmt  {% id %}
    | loopWhileStmt  {% id %}
    | loopUntilStmt  {% id %}
    | doLoopStmt  {% id %}
    | exitLoopStmt  {% id %}
    | forStmt  {% id %}
    | nextStmt  {% id %}
    | exitForStmt  {% id %}
    | gosubStmt  {% id %}
    | returnStmt  {% id %}
    | endStmt  {% id %}
    | printStmt  {% id %}
    | inputStmt  {% id %}

labelStmt ->
      %NUMERIC_LITERAL  {%
        ([$1]): LabelStmt =>
            ({ type: StmtType.LABEL, label: $1.value, ...useLoc($1) })
    %}
    | %IDENTIFIER %COLON  {%
        ([$1, $2]): LabelStmt =>
            ({ type: StmtType.LABEL, label: $1.value, ...useLoc($1) })
    %}

assignStmt ->
    %LET:? lhsExpr %EQ expr  {%
        ([$1, $2, $3, $4]): AssignStmt =>
            ({
              type: StmtType.ASSIGN,
              targetExpr: $2,
              valueExpr: $4,
              ...useLoc($1 || $2),
            })
    %}

gotoStmt ->
    %GOTO labelRef  {%
        ([$1, $2]): GotoStmt =>
            ({ type: StmtType.GOTO, destLabel: $2, ...useLoc($1) })
    %}

ifStmt ->
      singleLineIfStmt  {% id %}
    | blockIfStmt  {% id %}

singleLineIfStmt ->
    %IF expr %THEN singleLineStmts (%ELSE singleLineStmts):?  {%
        ([$1, $2, $3, $4, $5, $6]): IfStmt =>
            ({
              type: StmtType.IF,
              ifBranches: [ { condExpr: $2, stmts: $4 } ],
              elseBranch: $5 ? (([$5_1, $5_2]) => $5_2)($5) : [],
              ...useLoc($1),
            })
    %}

blockIfStmt ->
    %IF expr %THEN %NEWLINE stmts
        (%ELSEIF expr %THEN %NEWLINE stmts):*
        (%ELSE stmts):?
        %END %IF  {%
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
    %}

whileStmt ->
    %WHILE expr stmts %WEND  {%
        ([$1, $2, $3, $4]): CondLoopStmt =>
            ({
              type: StmtType.COND_LOOP,
              structure: CondLoopStructure.COND_EXPR_BEFORE_STMTS,
              condExpr: $2,
              isCondNegated: false,
              stmts: $3,
              ...useLoc($1),
            })
    %}

doWhileStmt ->
    %DO %WHILE expr stmts %LOOP  {%
        ([$1, $2, $3, $4, $5]): CondLoopStmt =>
            ({
              type: StmtType.COND_LOOP,
              structure: CondLoopStructure.COND_EXPR_BEFORE_STMTS,
              condExpr: $3,
              isCondNegated: false,
              stmts: $4,
              ...useLoc($1),
            })
    %}

doUntilStmt ->
    %DO %UNTIL expr stmts %LOOP  {%
        ([$1, $2, $3, $4, $5]): CondLoopStmt =>
            ({
              type: StmtType.COND_LOOP,
              structure: CondLoopStructure.COND_EXPR_BEFORE_STMTS,
              condExpr: $3,
              isCondNegated: true,
              stmts: $4,
              ...useLoc($1),
            })
    %}

loopWhileStmt ->
    %DO stmts %LOOP %WHILE expr  {%
        ([$1, $2, $3, $4, $5]): CondLoopStmt =>
            ({
              type: StmtType.COND_LOOP,
              structure: CondLoopStructure.COND_EXPR_AFTER_STMTS,
              condExpr: $5,
              isCondNegated: false,
              stmts: $2,
              ...useLoc($1),
            })
    %}

loopUntilStmt ->
    %DO stmts %LOOP %UNTIL expr  {%
        ([$1, $2, $3, $4, $5]): CondLoopStmt =>
            ({
              type: StmtType.COND_LOOP,
              structure: CondLoopStructure.COND_EXPR_AFTER_STMTS,
              condExpr: $5,
              isCondNegated: true,
              stmts: $2,
              ...useLoc($1),
            })
    %}

doLoopStmt ->
    %DO stmts %LOOP  {%
        ([$1, $2, $3]): UncondLoopStmt => ({ type: StmtType.UNCOND_LOOP, stmts: $2, ...useLoc($1) })
    %}

exitLoopStmt ->
    %EXIT %DO  {% ([$1, $2]): ExitLoopStmt => ({ type: StmtType.EXIT_LOOP, ...useLoc($1) }) %}

forStmt ->
    %FOR lhsExpr %EQ expr %TO expr (%STEP expr):?  {%
        ([$1, $2, $3, $4, $5, $6, $7]): ForStmt => ({
          type: StmtType.FOR,
          counterExpr: $2,
          startExpr: $4,
          endExpr: $6,
          stepExpr: $7 ? $7[1] : null,
          ...useLoc($1),
        })
    %}

nextStmt ->
    %NEXT lhsExprs:?  {%
        ([$1, $2]): NextStmt => ({ type: StmtType.NEXT, counterExprs: $2 ?? [], ...useLoc($1) })
    %}

exitForStmt ->
    %EXIT %FOR  {% ([$1, $2]): ExitForStmt => ({ type: StmtType.EXIT_FOR, ...useLoc($1) }) %}

gosubStmt ->
    %GOSUB labelRef  {%
        ([$1, $2]): GosubStmt =>
            ({ type: StmtType.GOSUB, destLabel: $2, ...useLoc($1) })
    %}

returnStmt ->
    %RETURN labelRef:?  {%
        ([$1, $2]): ReturnStmt =>
            ({ type: StmtType.RETURN, destLabel: $2, ...useLoc($1) })
    %}

endStmt ->
    %END  {% ([$1]): EndStmt => ({ type: StmtType.END, ...useLoc($1) }) %}

printStmt ->
    %PRINT printArg:*  {%
        ([$1, $2]): PrintStmt => ({ type: StmtType.PRINT, args: $2, ...useLoc($1) })
    %}

printArg ->
      expr  {% ([$1]) => $1 %}
    | %COMMA  {% () => PrintSep.COMMA %}
    | %SEMICOLON  {% () => PrintSep.SEMICOLON %}

inputStmt ->
    %INPUT (%STRING_LITERAL inputStmtPromptSep):? lhsExprs  {%
        ([$1, $2, $3]): InputStmt => ({
          type: StmtType.INPUT,
          prompt: $2 ? `${$2[0].value}${$2[1] ? '? ': ''}` : '? ',
          targetExprs: $3,
          ...useLoc($1),
        })
    %}

inputStmtPromptSep ->
      %COMMA  {% () => false %}
    | %SEMICOLON  {% () => true %}

singleLineStmts ->
    %COLON:* nonLabelStmt (%COLON:+ nonLabelStmt):*  {%
        ([$1, $2, $3]): Stmts => [$2, ...$3.map(([$3_1, $3_2]: Array<any>) => $3_2)]
    %}

lhsExprs ->
      (lhsExpr %COMMA):* lhsExpr  {% ([$1, $2]) => [...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []), $2] %}

labelRef ->
    (%IDENTIFIER | %NUMERIC_LITERAL)  {% ([$1]) => id($1).value %}

# ----
# Expressions
# ----

# An expression.
expr ->
    expr10  {% id %}

# An expression that can be assigned to.
lhsExpr ->
    varRefExpr  {% id %}

expr10 ->
      expr9  {% id %}
    | expr10 (%OR) expr9  {% buildBinaryOpExpr %}

expr9 ->
      expr8  {% id %}
    | expr9 (%AND) expr8  {% buildBinaryOpExpr %}

expr8 ->
      expr7  {% id %}
    | (%NOT) expr7  {% buildUnaryOpExpr %}

expr7 ->
      expr6  {% id %}
    | expr6 (%EQ | %NE | %GT | %GTE | %LT | %LTE) expr6  {% buildBinaryOpExpr %}

expr6 ->
      expr5  {% id %}
    | expr6 (%ADD | %SUB) expr5  {% buildBinaryOpExpr %}

expr5 ->
      expr4  {% id %}
    | expr5 (%MOD) expr4  {% buildBinaryOpExpr %}

expr4 ->
      expr3  {% id %}
    | expr4 (%INTDIV) expr3  {% buildBinaryOpExpr %}

expr3 ->
      expr2  {% id %}
    | expr3 (%MUL | %DIV) expr2  {% buildBinaryOpExpr %}

expr2 ->
      expr1  {% id %}
    | (%SUB) expr1  {% buildUnaryOpExpr %}

expr1 ->
      expr0  {% id %}
    | expr1 (%EXP) expr0  {% buildBinaryOpExpr %}

expr0 ->
      varRefExpr  {% id %}
    | fnCallExpr  {% id %}
    | literalExpr  {% id %}
    | %LPAREN expr %RPAREN  {% ([$1, $2, $3]) => ({ ...$2, ...useLoc($1) }) %}

varRefExpr ->
    %IDENTIFIER  {%
        ([$1]): VarRefExpr =>
            ({ type: ExprType.VAR_REF, name: $1.value, ...useLoc($1) })
    %}

fnCallExpr ->
    %IDENTIFIER %LPAREN %RPAREN  {%
        ([$1, $2, $3]): FnCallExpr => ({
          type: ExprType.FN_CALL,
          name: $1.value,
          ...useLoc($1),
        })
    %}

literalExpr ->
      stringLiteralExpr  {% id %}
    | numericLiteralExpr  {% id %}

stringLiteralExpr ->
    %STRING_LITERAL  {%
        ([$1]): LiteralExpr =>
            ({ type: ExprType.LITERAL, value: $1.value, ...useLoc($1) })
    %}

numericLiteralExpr ->
    %NUMERIC_LITERAL  {%
        ([$1]): LiteralExpr =>
            ({ type: ExprType.LITERAL, value: parseFloat($1.value), ...useLoc($1) })
    %}

