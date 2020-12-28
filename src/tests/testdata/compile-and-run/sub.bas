' Test invocation with CALL keyword.
CALL f1
CALL f2("yo")

' Test short form invocation.
f1: f1: f1: f1  ' First "f1: " should be parsed as label
f2 "yo"

SUB f1
  PRINT "hi"
END SUB
SUB f2(x AS STRING)
  PRINT x
END SUB

' Exit from sub.
count_down 3
SUB count_down (x AS INTEGER)
  PRINT x
  IF x = 0 THEN EXIT SUB
  count_down x - 1
END SUB

' Static vars.
count_up 3
SUB count_up (x AS INTEGER)
  STATIC t
  PRINT t
  IF t < x THEN
    t = t + 1
    count_up x
  END IF
END SUB

' EXPECT {
'   "io": [
'     {"output": "hi\n"},
'     {"output": "yo\n"},
'
'     {"output": "hi\n"},
'     {"output": "hi\n"},
'     {"output": "hi\n"},
'     {"output": "yo\n"},
'
'     {"output": " 3 \n"},
'     {"output": " 2 \n"},
'     {"output": " 1 \n"},
'     {"output": " 0 \n"},
'
'     {"output": " 0 \n"},
'     {"output": " 1 \n"},
'     {"output": " 2 \n"},
'     {"output": " 3 \n"}
'   ]
' }
