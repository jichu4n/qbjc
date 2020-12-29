' Test assignment and reference
PRINT A1(5, 5)
FOR i = 1 TO 10
  FOR j = 1 TO 10
    A1(i, j) = i * 10 + j
NEXT j, i
PRINT A1(4, 2)

DIM A2(4) AS INTEGER
A2(1) = 5
A2(2) = 7
A2(3) = 9
A2(4) = -2
sum = 0
FOR i = LBOUND(A2) TO UBOUND(A2)
    sum = sum + A2(i)
NEXT i
PRINT sum


' Test exotic indices
CONST N = 100
DIM A3(1 TO N, -N TO -1) AS STRING
PRINT LBOUND(A3); UBOUND(A3); LBOUND(A3, 2); UBOUND(A3, 2)
FOR i = 1 TO N
  FOR j = -N TO -1
    A3(i, j) = STR$(i) + " * 10 + " + STR$(j) + " = " + STR$(i * 10 + j)
NEXT j, i
PRINT A3(42, -42)
PRINT A3(N, -N)


' Pass array element by reference
DIM A4(3) AS STRING, A5(3, 3) AS STRING
FOR i = 1 TO 3
  f1 A4(i), i
  f1 A5(i, i), i
NEXT i
SUB f1 (s AS STRING, i AS INTEGER)
  s = STR$(i * 100 + i * 10 + i)
END SUB
PRINT A4(3)
PRINT A5(2, 2)


' EXPECT {
'   "io": [
'     {"output": " 0 \n"},
'     {"output": " 42 \n"},
'
'     {"output": " 19 \n"},
'
'     {"output": " 1  100 -100 -1 \n"},
'     {"output": " 42 * 10 + -42 =  378\n"},
'     {"output": " 100 * 10 + -100 =  900\n"},
'
'     {"output": " 333\n"},
'     {"output": " 222\n"}
'   ]
' }
