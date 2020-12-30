' Test initial values for undeclared variables.
PRINT a; "'"; b$; "'"
PRINT f1
FUNCTION f1
  f1 = x
END FUNCTION

' Test declaring local and global variables via DIM
DIM c AS STRING
DIM SHARED d AS STRING
PRINT "'"; c; "' '"; d; "'"
c = "foo"
d = "hello"
LET z = f2
FUNCTION f2
  PRINT "'"; c; "' '"; d; "'"
END FUNCTION
PRINT "'"; c; "' '"; d; "'"

' Test CONST.
CONST e = "test", f = 500
LET z = f3
FUNCTION f3
  CONST g = 42
  PRINT e; f; g
END FUNCTION
PRINT e; f; g

' Test SHARED.
DIM h$ AS STRING
SUB s1
  SHARED h$
  h$ = "hello"
END SUB
SUB s2
  SHARED h$
  PRINT h$
END SUB
s1
s2

' EXPECT {
'   "io": [
'     {"output": " 0 ''\n"},
'     {"output": " 0 \n"},
'
'     {"output": "'' ''\n"},
'     {"output": "' 0 ' 'hello'\n"},
'     {"output": "'foo' 'hello'\n"},
'
'     {"output": "test 500  42 \n"},
'     {"output": "test 500  0 \n"},
'
'     {"output": "hello\n"}
'   ]
' }
