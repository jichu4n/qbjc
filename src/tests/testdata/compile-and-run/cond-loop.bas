x = 1
WHILE x <= 5
  PRINT x
  x = x + 1
WEND

x = 11
DO WHILE x <= 15
  PRINT x
  x = x + 1
LOOP

x = 21
DO UNTIL x > 25
  PRINT x
  x = x + 1
LOOP

x = 31
DO
  PRINT x
  x = x + 1
LOOP WHILE x <= 35

x = 41
DO
  PRINT x
  x = x + 1
LOOP UNTIL x > 45

' EXPECT {
'   "io": [
'     {"output": " 1 \n"},
'     {"output": " 2 \n"},
'     {"output": " 3 \n"},
'     {"output": " 4 \n"},
'     {"output": " 5 \n"},
'     {"output": " 11 \n"},
'     {"output": " 12 \n"},
'     {"output": " 13 \n"},
'     {"output": " 14 \n"},
'     {"output": " 15 \n"},
'     {"output": " 21 \n"},
'     {"output": " 22 \n"},
'     {"output": " 23 \n"},
'     {"output": " 24 \n"},
'     {"output": " 25 \n"},
'     {"output": " 31 \n"},
'     {"output": " 32 \n"},
'     {"output": " 33 \n"},
'     {"output": " 34 \n"},
'     {"output": " 35 \n"},
'     {"output": " 41 \n"},
'     {"output": " 42 \n"},
'     {"output": " 43 \n"},
'     {"output": " 44 \n"},
'     {"output": " 45 \n"}
'   ]
' }

