DIM n as INTEGER
FOR i = -5 TO 0
  n = i - 1 / 2
  PRINT n
NEXT
FOR i = 0 TO 5
  n = i + 1 / 2
  PRINT n
NEXT

' EXPECT {
'   "io": [
'     {"output": "-6 \n"},
'     {"output": "-4 \n"},
'     {"output": "-4 \n"},
'     {"output": "-2 \n"},
'     {"output": "-2 \n"},
'     {"output": " 0 \n"},
'     {"output": " 0 \n"},
'     {"output": " 2 \n"},
'     {"output": " 2 \n"},
'     {"output": " 4 \n"},
'     {"output": " 4 \n"},
'     {"output": " 6 \n"}
'   ]
' }
