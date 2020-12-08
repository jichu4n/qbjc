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
  StmtType,
  AssignStmt,
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
    stmtSep:? (stmt stmtSep):*  {% ([$1, $2]) => $2.map(id) %}

stmtSep ->
    (%COLON | %NEWLINE):+  {% discard %}

stmt ->
      printStmt  {% id %}
    | assignStmt  {% id %}
    | %END  {% discard %}

printStmt ->
    %PRINT expr:?  {%
        ([$1, $2]): PrintStmt =>
            ({ type: StmtType.PRINT, args: $2 ? [$2] : [], ...useLoc($1) })
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

