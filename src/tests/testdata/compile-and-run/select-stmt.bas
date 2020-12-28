FOR n = 0 TO 4
  SELECT CASE n
    CASE 0
      PRINT "ZERO"
    CASE 1, 2
      PRINT "ONE OR TWO"
    CASE ELSE
      PRINT "ELSE"
  END SELECT
NEXT

' EXPECT {
'   "io": [
'     {"output": "ZERO\n"},
'     {"output": "ONE OR TWO\n"},
'     {"output": "ONE OR TWO\n"},
'     {"output": "ELSE\n"},
'     {"output": "ELSE\n"}
'   ]
' }
