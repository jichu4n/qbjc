x = 1
start:
  IF x < 3 THEN
    PRINT x; "< 3"
  ELSEIF x = 3 THEN
    PRINT x; "= 3"
  ELSE
    PRINT x; "> 3"
  END IF
  x = x + 1
  IF x <= 5 THEN GOTO start

' Multiple statements in single line IF.
IF x >= 5 THEN PRINT x; : PRINT x; : PRINT x
PRINT x

' EXPECT {
'   "io": [
'     {"output": " 1 < 3\n"},
'     {"output": " 2 < 3\n"},
'     {"output": " 3 = 3\n"},
'     {"output": " 4 > 3\n"},
'     {"output": " 5 > 3\n"},
'     {"output": " 6  6  6 \n"},
'     {"output": " 6 \n"}
'   ]
' }
