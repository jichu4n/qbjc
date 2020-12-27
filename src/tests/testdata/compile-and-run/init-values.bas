PRINT a; "'"; b$; "'"
PRINT f()

FUNCTION f()
  f = x
END FUNCTION

' EXPECT {
'   "io": [
'     {"output": " 0 ''\n"},
'     {"output": " 0 \n"}
'   ]
' }
