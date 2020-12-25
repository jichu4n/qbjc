Test1:
  PRINT "Hello";
  GOSUB PrintSep
  PRINT "world"
  GOTO Test2

  PrintSep:
    PRINT ", ";
    RETURN

Test2:
  n = 3
  GOSUB CountDown
  GOTO Test3

  CountDown:
    PRINT n
    IF n > 0 THEN
      n = n - 1
      GOSUB CountDown
    END IF
    RETURN

Test3:
  ' Example from "Microsoft(R) QuickBASIC BASIC: Language Reference"
  PRINT "in module-level code"
  GOSUB Sub1
  PRINT "this line in main routine should be skipped"
  Label1:
      PRINT "back in module-level code"
      END

  Sub1:
      PRINT "in subroutine one"
      GOSUB Sub2
      PRINT "this line in subroutine one should be skipped"
  Label2:
      PRINT "back in subroutine one"
      RETURN Label1

  Sub2:
      PRINT "in subroutine two"
      RETURN Label2

' EXPECT {
'   "io": [
'     {"output": "Hello, world\n"},
'
'     {"output": " 3 \n"},
'     {"output": " 2 \n"},
'     {"output": " 1 \n"},
'     {"output": " 0 \n"},
'
'     {"output": "in module-level code\n"},
'     {"output": "in subroutine one\n"},
'     {"output": "in subroutine two\n"},
'     {"output": "back in subroutine one\n"},
'     {"output": "back in module-level code\n"}
'   ]
' }

