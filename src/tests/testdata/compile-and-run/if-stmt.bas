x = 1
start:
  IF x < 3 THEN
    PRINT "x < 3"
  ELSEIF x = 3 THEN
    PRINT "x = 3"
  ELSE
    PRINT "x > 3"
  END IF
  x = x + 1
  IF x <= 5 THEN GOTO start

' EXPECT {
'   "io": [
'     {"output": "x < 3\n"},
'     {"output": "x < 3\n"},
'     {"output": "x = 3\n"},
'     {"output": "x > 3\n"},
'     {"output": "x > 3\n"}
'   ]
' }
