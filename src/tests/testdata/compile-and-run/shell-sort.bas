' Example from Microsoft QuickBASIC BASIC: Language Reference
'
' Sort the word list using a Shell sort.
SUB ShellSort (Array$(), Num%) STATIC
    Span% = Num% \ 2
    DO WHILE Span% > 0
    FOR I% = Span% TO Num% - 1

        J% = I% - Span% + 1
    FOR J% = (I% - Span% + 1) TO 1 STEP -Span%

    IF Array$(J%) <= Array$(J% + Span%) THEN EXIT FOR
    ' Swap array elements that are out of order.
    SWAP Array$(J%), Array$(J% + Span%)
NEXT J%

    NEXT I%
    Span% = Span% \ 2
    LOOP
END SUB


CONST N = 9
DIM A1(N) AS STRING
FOR i = 1 TO N
  LINE INPUT A1(i)
NEXT
ShellSort A1, N
FOR i = 1 TO N
  PRINT A1(i)
NEXT

' EXPECT {
'   "io": [
'     {"input": "yz"},
'     {"input": "jkl"},
'     {"input": "vwx"},
'     {"input": "mno"},
'     {"input": "pqr"},
'     {"input": "abc"},
'     {"input": "stu"},
'     {"input": "ghi"},
'     {"input": "def"},
'
'     {"output": "abc\n"},
'     {"output": "def\n"},
'     {"output": "ghi\n"},
'     {"output": "jkl\n"},
'     {"output": "mno\n"},
'     {"output": "pqr\n"},
'     {"output": "stu\n"},
'     {"output": "vwx\n"},
'     {"output": "yz\n"}
'   ]
' }