READ a, b, c$
PRINT a; b; c$
END

label1:
  DATA 42,,hello
label2:
  DATA "hello world"


' EXPECT {
'   "io": [
'     {"output": " 42  0 hello\n"}
'   ]
' }