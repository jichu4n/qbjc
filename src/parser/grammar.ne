@preprocessor typescript

@{%
import {Token} from 'moo';
import lexer from './lexer';
import {
  AstNode,
  Module,
  ExprType,
  BinaryOpExpr,
  UnaryOpExpr,
  LiteralExpr,
  VarRefExpr,
  Stmt,
  Stmts,
  StmtType,
  LabelStmt,
  GotoStmt,
  AssignStmt,
  IfStmt,
  PrintStmt,
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
    expr: $2,
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

module -> stmts  {% ([$1]): Module => ({ stmts: $1 }) %}

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
    | printStmt  {% id %}

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
    %GOTO (%IDENTIFIER | %NUMERIC_LITERAL)  {%
        ([$1, $2]): GotoStmt =>
            ({ type: StmtType.GOTO, destLabel: id($2).value, ...useLoc($1) })
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
              elseBranch: $7 ? (([$7_1, $7_2]) => $7_2)($7) : [],
              ...useLoc($1),
            })
    %}

printStmt ->
    %PRINT expr:?  {%
        ([$1, $2]): PrintStmt =>
            ({ type: StmtType.PRINT, args: $2 ? [$2] : [], ...useLoc($1) })
    %}

singleLineStmts ->
    %COLON:* nonLabelStmt (%COLON:+ nonLabelStmt):*  {%
        ([$1, $2, $3]): Stmts => [$2, ...$3.map(([$3_1, $3_2]: Array<any>) => $3_2)]
    %}

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
    | literalExpr  {% id %}
    | %LPAREN expr %RPAREN  {% ([$1, $2, $3]) => ({ ...$2, ...useLoc($1) }) %}

varRefExpr ->
    %IDENTIFIER  {%
        ([$1]): VarRefExpr =>
            ({ type: ExprType.VAR_REF, name: $1.value, ...useLoc($1) })
    %}

literalExpr ->
      %STRING_LITERAL  {%
          ([$1]): LiteralExpr =>
              ({ type: ExprType.LITERAL, value: $1.value, ...useLoc($1) })
      %}
    | %NUMERIC_LITERAL  {%
          ([$1]): LiteralExpr =>
              ({ type: ExprType.LITERAL, value: parseFloat($1.value), ...useLoc($1) })
      %}

