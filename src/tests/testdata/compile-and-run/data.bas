READ a, b, c$, d$
PRINT a; b; c$; d$

RESTORE label2
READ e$
PRINT e$

SUB s1
  RESTORE
  READ a, b$, c$, d$
  PRINT a; b$; c$; d$
END SUB
s1

END

label1:
  DATA 42,,hello
label2:
  DATA "hello world"


' EXPECT {
'   "io": [
'     {"output": " 42  0 hellohello world\n"},
'     {"output": "hello world\n"},
'     {"output": " 42 hellohello world\n"}
'   ]
' }