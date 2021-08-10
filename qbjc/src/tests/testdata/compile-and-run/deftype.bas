DEFSTR S-U, C
DEFINT A-B

s1 = "hello"
FUNCTION u1(c)
  u1 = c + "world"
END FUNCTION

PRINT s1; u1(", "); a1


' EXPECT {
'   "io": [
'     {"output": "hello, world 0 \n"}
'   ]
' }

