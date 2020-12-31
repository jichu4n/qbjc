@preprocessor typescript

@{%
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
  NopStmt,
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

function buildNopStmt(node: Token | AstNode, exprs?: Array<Expr>): NopStmt {
  return {
    type: StmtType.NOP,
    exprs,
    ...useLoc(node),
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
          udts: [...a.udts, ...b.udts],
        }))
    %}

moduleComponentWithSep ->
      stmtWithSep  {%
          ([$1]): Module => ({
            stmts: [$1],
            procs: [],
            udts: [],
          })
      %}
    | proc stmtSep  {%
          ([$1, $2]): Module => ({
            stmts: [],
            procs: $1 ? [$1] : [],
            udts: [],
          })
    %}
    | udt stmtSep  {%
          ([$1, $2]): Module => ({
            stmts: [],
            procs: [],
            udts: $1 ? [$1] : [],
          })
    %}

proc ->
      fnProc  {% id %}
    | subProc  {% id %}
    | procDecl  {% discard %}

fnProc ->
    %FUNCTION %IDENTIFIER (%LPAREN params %RPAREN):? %STATIC:? stmts %END %FUNCTION  {%
        ([$1, $2, $3, $4, $5, $6, $7]): FnProc => ({
          type: ProcType.FN,
          name: $2.value,
          params: $3 ? $3[1] : [],
          stmts: $5,
          isDefaultStatic: !!$4,
          ...useLoc($1),
        })
    %}

subProc ->
    %SUB %IDENTIFIER (%LPAREN params %RPAREN):? %STATIC:? stmts %END %SUB  {%
        ([$1, $2, $3, $4, $5, $6, $7]): SubProc => ({
          type: ProcType.SUB,
          name: $2.value,
          params: $3 ? $3[1] : [],
          stmts: $5,
          isDefaultStatic: !!$4,
          ...useLoc($1),
        })
    %}

procDecl ->
    %DECLARE (%FUNCTION | %SUB) %IDENTIFIER (%LPAREN params %RPAREN):?  {% discard %}

params ->
      null  {% (): Array<Param> => [] %}
    | (param %COMMA):* param  {%
        ([$1, $2]) => [...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []), $2]
    %}

param ->
      %IDENTIFIER singularTypeExprOrDefault  {%
          ([$1, $2]): Param => ({
            name: $1.value,
            typeExpr: $2,
            ...useLoc($1),
          })
    %}
    | %IDENTIFIER %LPAREN %RPAREN singularTypeExprOrDefault  {%
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
    %}

udt ->
    %TYPE %IDENTIFIER fieldExprs %END %TYPE  {%
        ([$1, $2, $3, $4, $5]): Udt => ({
          name: $2.value,
          fieldSpecExprs: $3,
          ...useLoc($1),
        })
    %}

fieldExprs ->
      stmtSep:?  {% (): Array<FieldSpecExpr> => [] %}
    | stmtSep:? (fieldExpr stmtSep):* fieldExpr stmtSep:?  {%
        ([$1, $2, $3, $4]): Array<FieldSpecExpr> => [
          ...($2 ? $2.map(([$2_1, $2_2]: Array<any>) => $2_1) : []),
          $3,
        ]
    %}

fieldExpr ->
    %IDENTIFIER singularTypeExpr  {%
        ([$1, $2]): FieldSpecExpr => ({
          name: $1.value,
          typeExpr: $2,
          ...useLoc($1),
        })
    %}

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
      dimStmt  {% id %}
    | assignStmt  {% id %}
    | constStmt  {% id %}
    | gotoStmt  {% id %}
    | ifStmt  {% id %}
    | selectStmt  {% id %}
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
    | callStmt  {% id %}
    | exitProcStmt  {% id %}
    | endStmt  {% id %}
    | swapStmt  {% id %}
    | printStmt  {% id %}
    | inputStmt  {% id %}
    | defTypeStmt  {% id %}
    | nopStmt  {% id %}
    | dataStmt  {% id %}
    | readStmt  {% id %}
    | restoreStmt  {% id %}

labelStmt ->
      %NUMERIC_LITERAL  {%
        ([$1], _, reject): LabelStmt | Reject =>
            $1.isFirstTokenOnLine ? {
              type: StmtType.LABEL,
              label: $1.value,
              ...useLoc($1),
            } : reject
    %}
    | %IDENTIFIER %COLON  {%
        ([$1, $2], _, reject): LabelStmt | Reject =>
          // A line like "f: f:" should parse as a label "f" followed by an invocation of the
          // sub "f", so need to explicitly disambiguate here.
          $1.isFirstTokenOnLine ? {
            type: StmtType.LABEL,
            label: $1.value,
            ...useLoc($1),
          } : reject
    %}

dimStmt ->
      %DIM %SHARED:? varDecls  {%
          ([$1, $2, $3]): DimStmt => ({
            type: StmtType.DIM,
            dimType: $2 ? DimType.SHARED : DimType.LOCAL,
            varDecls: $3,
            ...useLoc($1),
          })
    %}
    | %STATIC varDecls  {%
          ([$1, $2]): DimStmt => ({
            type: StmtType.DIM,
            dimType: DimType.STATIC,
            varDecls: $2,
            ...useLoc($1),
          })
    %}
    | %SHARED varDecls  {%
          ([$1, $2]): DimStmt => ({
            type: StmtType.DIM,
            dimType: DimType.SHARED,
            varDecls: $2,
            ...useLoc($1),
          })
    %}

varDecls ->
    (varDecl %COMMA):* varDecl  {%
        ([$1, $2]): Array<VarDecl> => [
          ...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []),
          $2,
        ]
    %}

varDecl ->
      %IDENTIFIER singularTypeExprOrDefault  {%
        ([$1, $2]): VarDecl => ({
          name: $1.value,
          typeExpr: $2,
          ...useLoc($1),
        })
    %}
    | %IDENTIFIER %LPAREN dimensionSpecExprs %RPAREN singularTypeExprOrDefault  {%
        ([$1, $2, $3, $4, $5]): VarDecl => ({
          name: $1.value,
          typeExpr: {
            type: DataTypeExprType.ARRAY,
            elementTypeExpr: $5,
            dimensionSpecExprs: $3,
            ...useLoc($1),
          },
          ...useLoc($1),
        })
    %}

dimensionSpecExprs ->
    (dimensionSpecExpr %COMMA):* dimensionSpecExpr  {%
        ([$1, $2]): Array<ArrayDimensionSpecExpr> => [
          ...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []),
          $2,
        ]
    %}

dimensionSpecExpr ->
      expr  {% ([$1]): ArrayDimensionSpecExpr => ({ maxIdxExpr: $1, ...useLoc($1) }) %}
    | expr %TO expr  {%
        ([$1, $2, $3]): ArrayDimensionSpecExpr => ({
          minIdxExpr: $1,
          maxIdxExpr: $3,
          ...useLoc($1),
        })
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

constStmt ->
    %CONST constDefs  {%
        ([$1, $2]): ConstStmt => ({ type: StmtType.CONST, constDefs: $2, ...useLoc($1) })
    %}

constDefs ->
    (constDef %COMMA):* constDef  {%
        ([$1, $2]): Array<ConstDef> => [
          ...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []),
          $2,
        ]
    %}

constDef ->
    %IDENTIFIER %EQ expr  {%
        ([$1, $2, $3]): ConstDef => ({ name: $1.value, valueExpr: $3, ...useLoc($1) })
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
              ifBranches: [ { condExpr: $2, stmts: $4, ...useLoc($1) } ],
              elseBranch: $5 ? { stmts: $5[1], ...useLoc($5[0]) } : null,
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
    %}

selectStmt ->
    %SELECT %CASE expr stmtSep:?
        (%CASE caseExprs stmts):+
        (%CASE %ELSE stmts):?
        %END %SELECT  {%
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
    %}

caseExprs ->
      (caseExpr %COMMA):* caseExpr  {%
          ([$1, $2]): Array<CaseExpr> =>
              [...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []), $2]
      %}

caseExpr ->
      expr  {%
          ([$1]): CaseExpr => ({
            type: CaseExprType.VALUE,
            valueExpr: $1,
          })
    %}
    | expr %TO expr  {%
          ([$1, $2, $3]): CaseExpr => ({
            type: CaseExprType.RANGE,
            lowerBoundExpr: $1,
            upperBoundExpr: $3,
          })
    %}
    | %IS (%EQ | %NE | %GT | %GTE | %LT | %LTE) expr  {%
          ([$1, $2, $3]): CaseExpr => ({
            type: CaseExprType.COMP,
            op: id($2).type.toLowerCase(),
            rightExpr: $3,
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

callStmt ->
      %CALL %IDENTIFIER (%LPAREN exprs %RPAREN):?  {%
          ([$1, $2, $3]): CallStmt => ({
            type: StmtType.CALL,
            name: $2.value,
            argExprs: $3 ? $3[1] : [],
            ...useLoc($1),
          })
      %}
    | %IDENTIFIER exprs  {%
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
    %}

exitProcStmt ->
      %EXIT %FUNCTION  {%
        ([$1, $2]): ExitProcStmt => ({
          type: StmtType.EXIT_PROC,
          procType: ProcType.FN,
          ...useLoc($1),
        })
      %}
    | %EXIT %SUB  {%
        ([$1, $2]): ExitProcStmt => ({
          type: StmtType.EXIT_PROC,
          procType: ProcType.SUB,
          ...useLoc($1),
        })
      %}

endStmt ->
    (%END | %SYSTEM)  {% ([$1]): EndStmt => ({ type: StmtType.END, ...useLoc(id($1)) }) %}

swapStmt ->
    %SWAP lhsExpr %COMMA lhsExpr  {%
        ([$1, $2, $3, $4]): SwapStmt => ({
          type: StmtType.SWAP,
          leftExpr: $2,
          rightExpr: $4,
          ...useLoc($1),
        })
    %}

printStmt ->
    %PRINT (%USING expr %SEMICOLON):? printArgs  {%
        ([$1, $2, $3]): PrintStmt => ({
          type: StmtType.PRINT,
          args: $3,
          formatExpr: $2 ? $2[1] : null,
          ...useLoc($1), })
    %}

printArgs ->
      null  {% () => [] %}
    | expr  {% ([$1]) => [$1] %}
    | (expr:? printSep):+ expr:?  {% 
        ([$1, $2]) => [
          ..._.flatMap($1, ([$1_1, $1_2]) => [...($1_1 ? [$1_1]: []), $1_2]),
          ...($2 ? [$2] : []),
        ]
    %}

printSep ->
      %COMMA  {% () => PrintSep.COMMA %}
    | %SEMICOLON  {% () => PrintSep.SEMICOLON %}

inputStmt ->
      %INPUT (%STRING_LITERAL inputStmtPromptSep):? lhsExprs  {%
          ([$1, $2, $3]): InputStmt => ({
            type: StmtType.INPUT,
            prompt: $2 ? `${$2[0].value}${$2[1] ? '? ': ''}` : '? ',
            inputType: InputType.TOKENIZED,
            targetExprs: $3,
            ...useLoc($1),
          })
    %}
    | %LINE %INPUT (%STRING_LITERAL inputStmtPromptSep):? lhsExpr  {%
          ([$1, $2, $3, $4]): InputStmt => ({
            type: StmtType.INPUT,
            prompt: $3 ? $3[0].value : '',
            inputType: InputType.LINE,
            targetExprs: [$4],
            ...useLoc($1),
          })
    %}

inputStmtPromptSep ->
      %COMMA  {% () => false %}
    | %SEMICOLON  {% () => true %}

defTypeStmt ->
      %DEFINT defTypeRanges  {%
        ([$1, $2]): DefTypeStmt => ({
          type: StmtType.DEF_TYPE,
          typeSpec: integerSpec(),
          ranges: $2,
          ...useLoc($1),
        })
    %}
    | %DEFSNG defTypeRanges  {%
        ([$1, $2]): DefTypeStmt => ({
          type: StmtType.DEF_TYPE,
          typeSpec: singleSpec(),
          ranges: $2,
          ...useLoc($1),
        })
    %}
    | %DEFDBL defTypeRanges  {%
        ([$1, $2]): DefTypeStmt => ({
          type: StmtType.DEF_TYPE,
          typeSpec: doubleSpec(),
          ranges: $2,
          ...useLoc($1),
        })
    %}
    | %DEFLNG defTypeRanges  {%
        ([$1, $2]): DefTypeStmt => ({
          type: StmtType.DEF_TYPE,
          typeSpec: longSpec(),
          ranges: $2,
          ...useLoc($1),
        })
    %}
    | %DEFSTR defTypeRanges  {%
        ([$1, $2]): DefTypeStmt => ({
          type: StmtType.DEF_TYPE,
          typeSpec: stringSpec(),
          ranges: $2,
          ...useLoc($1),
        })
    %}

defTypeRanges ->
    (defTypeRange %COMMA):* defTypeRange {%
          ([$1, $2]) => [...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []), $2]
    %}

defTypeRange ->
      %IDENTIFIER  {%
        ([$1]): DefTypeRange => ({
          minPrefix: $1.value,
          maxPrefix: $1.value,
          ...useLoc($1),
        })
    %}
    | %IDENTIFIER %SUB %IDENTIFIER  {%
        ([$1, $2, $3]): DefTypeRange => ({
          minPrefix: $1.value,
          maxPrefix: $3.value,
          ...useLoc($1),
        })
    %}

nopStmt ->
      %RANDOMIZE expr  {% ([$1, $2]) => buildNopStmt($1, [$2]) %}

dataStmt ->
    %DATA (dataItem %COMMA):* dataItem  {%
      ([$1, $2, $3]): DataStmt => ({
        type: StmtType.DATA,
        data: [
          ...$2 ? $2.map(([$2_1, $2_2]: Array<any>) => $2_1) : [],
          $3,
        ],
        ...useLoc($1),
      })
    %}

dataItem ->
      null  {% () => buildDataItem(lexer.lastToken!, null) %}
    | literalExpr  {% ([$1]) => buildDataItem($1, $1.value) %}
    | %IDENTIFIER  {% ([$1]) => buildDataItem($1, $1.value) %}

readStmt ->
    %READ lhsExprs  {%
      ([$1, $2]): ReadStmt => ({
        type: StmtType.READ,
        targetExprs: $2,
        ...useLoc($1),
      })
    %}

restoreStmt ->
    %RESTORE labelRef:?  {%
        ([$1, $2]): RestoreStmt =>
            ({ type: StmtType.RESTORE, destLabel: $2, ...useLoc($1) })
    %}

singleLineStmts ->
    %COLON:* nonLabelStmt (%COLON:+ nonLabelStmt):*  {%
        ([$1, $2, $3]): Stmts => [$2, ...$3.map(([$3_1, $3_2]: Array<any>) => $3_2)]
    %}

lhsExprs ->
      (lhsExpr %COMMA):* lhsExpr  {%
          ([$1, $2]) => [...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []), $2]
      %}

labelRef ->
    (%IDENTIFIER | %NUMERIC_LITERAL)  {% ([$1]) => id($1).value %}

elementaryTypeSpec ->
      %INTEGER  {% () => integerSpec() %}
    | %LONG  {% () => longSpec() %}
    | %SINGLE  {% () => singleSpec() %}
    | %DOUBLE  {% () => doubleSpec() %}
    | %STRING (%MUL expr2):?  {% () => stringSpec() %}

singularTypeExpr ->
      %AS elementaryTypeSpec  {% ([$1, $2]): SingularTypeExpr  => ({
        type: DataTypeExprType.ELEMENTARY,
        typeSpec: $2,
        ...useLoc($1),
      })
    %}
    | %AS %IDENTIFIER  {% ([$1, $2]): SingularTypeExpr  => ({
        type: DataTypeExprType.UDT,
        name: $2.value,
        ...useLoc($1),
      })
    %}

singularTypeExprOrDefault ->
      null  {% ([$1]): SingularTypeExpr => ({
        type: DataTypeExprType.ELEMENTARY,
        loc: {line: lexer.lastToken!.line, col: lexer.lastToken!.col},
      })
    %}
    | singularTypeExpr  {% id %}

# ----
# Expressions
# ----

# An expression.
expr ->
    expr10  {% id %}

# An expression that can be assigned to.
lhsExpr ->
      varRefExpr  {% id %}
    # We actually only allow array subscript expressions here, but array subscript expressions are
    # actually parsed as FnCallExprs. See comment for fnCallExpr rule below.
    | fnCallExpr  {% id %}
    | memberExpr  {% id %}

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
    | memberExpr  {% id %}
    | %LPAREN expr %RPAREN  {%
        ([$1, $2, $3]): UnaryOpExpr => ({
          type: ExprType.UNARY_OP,
          op: UnaryOp.PARENS,
          rightExpr: $2,
          ...useLoc($1),
        })
    %}

varRefExpr ->
    %IDENTIFIER  {%
        ([$1]): VarRefExpr =>
            ({ type: ExprType.VAR_REF, name: $1.value, ...useLoc($1) })
    %}

# Note that this syntax can either represent a function call or an array subscript expression. There
# is no way to disambiguate at the parsing layer, so we always parse such syntax as FnCallExpr and
# disambiguate later during semantic analysis.
fnCallExpr ->
    %IDENTIFIER %LPAREN exprs %RPAREN  {%
        ([$1, $2, $3, $4]): FnCallExpr => ({
          type: ExprType.FN_CALL,
          name: $1.value,
          argExprs: $3,
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

memberExpr ->
    lhsExpr %DOT %IDENTIFIER  {%
        ([$1, $2, $3]): MemberExpr => ({
          type: ExprType.MEMBER,
          udtExpr: $1,
          fieldName: $3.value,
          ...useLoc($1),
        })
    %}

exprs ->
      null  {% (): Array<Expr> => [] %}
    | (expr %COMMA):* expr  {%
          ([$1, $2]): Array<Expr> =>
              [...($1 ? $1.map(([$1_1, $1_2]: Array<any>) => $1_1) : []), $2]
      %}
