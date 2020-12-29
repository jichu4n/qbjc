PRINT A1(5, 5)
FOR i = 1 TO 10
  FOR j = 1 TO 10
    A1(i, j) = i * 10 + j
NEXT j, i
PRINT A1(4, 2)

' EXPECT {
'   "io": [
'     {"output": " 0 \n"},
'     {"output": " 42 \n"}
'   ]
' }
