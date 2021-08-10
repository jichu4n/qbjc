FOR i = 1 TO 3
  PRINT i
NEXT

FOR i = 1 TO 1
  PRINT i
NEXT i

FOR i = 1 TO 0 
  PRINT i
NEXT i

FOR i = 1 TO 3
  PRINT i
  FOR j = i * 10 + 1 TO i * 10 + 3
    PRINT j
NEXT j, i

FOR i = 1 TO 3
  PRINT i
  FOR j = i * 10 + 1 TO i * 10 + 3
    PRINT j
  NEXT
NEXT

t = 1
s = 1
FOR i = 3 TO t STEP 0 - s
  PRINT i
  t = 100  ' This should not affect the loop
  s = 5    ' This should not affect the loop
NEXT

FOR i = 1 TO 3
  FOR j = i * 10 + 1 TO i * 10 + 3
    PRINT j
    EXIT FOR
  NEXT
  PRINT i
NEXT


' EXPECT {
'   "io": [
'     {"output": " 1 \n"},
'     {"output": " 2 \n"},
'     {"output": " 3 \n"},
'
'     {"output": " 1 \n"},
'
'     {"output": " 1 \n"},
'     {"output": " 11 \n"},
'     {"output": " 12 \n"},
'     {"output": " 13 \n"},
'     {"output": " 2 \n"},
'     {"output": " 21 \n"},
'     {"output": " 22 \n"},
'     {"output": " 23 \n"},
'     {"output": " 3 \n"},
'     {"output": " 31 \n"},
'     {"output": " 32 \n"},
'     {"output": " 33 \n"},
'
'     {"output": " 1 \n"},
'     {"output": " 11 \n"},
'     {"output": " 12 \n"},
'     {"output": " 13 \n"},
'     {"output": " 2 \n"},
'     {"output": " 21 \n"},
'     {"output": " 22 \n"},
'     {"output": " 23 \n"},
'     {"output": " 3 \n"},
'     {"output": " 31 \n"},
'     {"output": " 32 \n"},
'     {"output": " 33 \n"},
'
'     {"output": " 3 \n"},
'     {"output": " 2 \n"},
'     {"output": " 1 \n"},
'
'     {"output": " 11 \n"},
'     {"output": " 1 \n"},
'     {"output": " 21 \n"},
'     {"output": " 2 \n"},
'     {"output": " 31 \n"},
'     {"output": " 3 \n"}
'   ]
' }

