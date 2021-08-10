INPUT a$
PRINT a$

INPUT "a$,b$"; a$, b$
PRINT a$; ", "; b$

INPUT "a,b,c ", a, b, c
PRINT a; ","; b; ","; c

LINE INPUT a$
PRINT a$
LINE INPUT "Prompt: "; b$
PRINT b$

' EXPECT {
'   "io": [
'     {"output": "? "},
'     {"input": "foo"},
'     {"output": "foo\n"},
'
'     {"output": "a$,b$? "},
'     {"input": "\"hello, world\",test\"a"},
'     {"output": "hello, world, test\"a\n"},
'
'     {"output": "a,b,c "},
'     {"input": "1,500,-30"},
'     {"output": " 1 , 500 ,-30 \n"},
'
'     {"input": "hello, world"},
'     {"output": "hello, world\n"},
'     {"output": "Prompt: "},
'     {"input": "hello, world"},
'     {"output": "hello, world\n"}
'   ]
' }
