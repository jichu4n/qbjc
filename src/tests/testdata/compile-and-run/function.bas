' Function without args.
PRINT f1
PRINT f1()
FUNCTION f1
  PRINT "answer =";
  f1 = 42
END FUNCTION

' Pass by reference and by value.
x = 100
PRINT f2(x, 42);
PRINT x
FUNCTION f2(a, b)
  a = a + b
  f2 = a
END FUNCTION

' Pass by reference through multiple function calls.
x = 3
PRINT "result ="; f3(x)
FUNCTION f3 (a)
  IF a > 0 THEN
    a = a - 1
    PRINT f3(a)
  END IF
  f3 = a
END FUNCTION

' Pass by value with parentheses.
FUNCTION f4(a)
  a = 0
  f4 = a
END FUNCTION
x = 42
PRINT f4(x);
PRINT x
y = 42
PRINT f4((y));
PRINT y

' EXPECT {
'   "io": [
'     {"output": "answer = 42 \n"},
'     {"output": "answer = 42 \n"},
'     {"output": " 142  142 \n"},
'
'     {"output": " 0 \n"},
'     {"output": " 0 \n"},
'     {"output": " 0 \n"},
'     {"output": "result = 0 \n"},
'
'     {"output": " 0  0 \n"},
'     {"output": " 0  42 \n"}
'   ]
' }
