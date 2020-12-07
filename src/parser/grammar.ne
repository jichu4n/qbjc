@preprocessor typescript

@{%
import lexer from './lexer';

function discard() {
  return null;
}
%}
@lexer lexer

program -> statements

statements ->
  statementSep:? (statement statementSep):*  {% ([$1, $2]) => $2.map(id) %}

statement ->
    %PRINT  {% id %}
  | %END  {% id %}

statementSep -> (%COLON | %NEWLINE):+  {% discard %}
