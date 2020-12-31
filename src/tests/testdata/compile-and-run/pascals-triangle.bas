CLS
' Example from Microsoft QuickBASIC BASIC: Language Reference

'Print the first MAXCOL columns of Pascal's Triangle, in which
'each number is the sum of the number immediately above it
'and the number immediately below it in the preceding column.

CONST MAXCOL=11
DIM A(MAXCOL,MAXCOL)
FOR M = 1 TO MAXCOL
    A(M,1) = 1 : A(M,M) = 1 'Top and bottom of each column is 1.
NEXT

FOR M = 3 TO MAXCOL
    FOR N = 2 TO M-1
    A(M,N) = A(M-1,N-1) + A(M-1,N)
    NEXT
NEXT
Startrow = 13                'Go to the middle of the screen.
FOR M = 1 TO MAXCOL
    Col = 6 * M
    Row = Startrow
    FOR N = 1 TO M
    LOCATE Row,Col : PRINT A(M,N)
    Row = Row + 2        'Go down 2 rows to print next number.
    NEXT
    PRINT
    Startrow = Startrow - 1  'Next column starts 1 row above
NEXT                        'preceding column.

' EXPECT {
'   "io": [
'     {"output": "\n"},
'     {"output": "\n"},
'     {"output": "                                                                   1 \n"},
'     {"output": "                                                             1 \n"},
'     {"output": "                                                       1           10 \n"},
'     {"output": "                                                 1           9 \n"},
'     {"output": "                                           1           8           45 \n"},
'     {"output": "                                     1           7           36 \n"},
'     {"output": "                               1           6           28          120 \n"},
'     {"output": "                         1           5           21          84 \n"},
'     {"output": "                   1           4           15          56          210 \n"},
'     {"output": "             1           3           10          35          126 \n"},
'     {"output": "       1           2           6           20          70          252 \n"},
'     {"output": "             1           3           10          35          126 \n"},
'     {"output": "                   1           4           15          56          210 \n"},
'     {"output": "                         1           5           21          84 \n"},
'     {"output": "                               1           6           28          120 \n"},
'     {"output": "                                     1           7           36 \n"},
'     {"output": "                                           1           8           45 \n"},
'     {"output": "                                                 1           9 \n"},
'     {"output": "                                                       1           10 \n"},
'     {"output": "                                                             1 \n"},
'     {"output": "                                                                   1 \n"},
'     {"output": "\n"},
'     {"output": "\n"}
'   ],
'   "enableAnsiTerminal": true
' }
