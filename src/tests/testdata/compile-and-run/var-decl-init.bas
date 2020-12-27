PRINT a; "'"; b$; "'"
PRINT f1
FUNCTION f1
  f1 = x
END FUNCTION

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

' EXPECT {
'   "io": [
'     {"output": " 0 ''\n"},
'     {"output": " 0 \n"},
'
'     {"output": "'' ''\n"},
'     {"output": "' 0 ' 'hello'\n"},
'     {"output": "'foo' 'hello'\n"}
'   ]
' }
