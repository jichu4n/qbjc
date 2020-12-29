PRINT A1(5, 5)
FOR i = 1 TO 10
  FOR j = 1 TO 10
    A1(i, j) = i * 10 + j
NEXT j, i
PRINT A1(4, 2)

CONST N = 100
DIM A2(100), A3(1 TO N, -N TO -1) AS STRING
PRINT LBOUND(A3); UBOUND(A3); LBOUND(A3, 2); UBOUND(A3, 2)
FOR i = 1 TO N
  FOR j = -N TO -1
    A3(i, j) = STR$(i) + " * 10 + " + STR$(j) + " = " + STR$(i * 10 + j)
NEXT j, i
PRINT A3(42, -42)
PRINT A3(N, -N)

' EXPECT {
'   "io": [
'     {"output": " 0 \n"},
'     {"output": " 42 \n"},
'     {"output": " 1  100 -100 -1 \n"},
'     {"output": " 42 * 10 + -42 =  378\n"},
'     {"output": " 100 * 10 + -100 =  900\n"}
'   ]
' }
