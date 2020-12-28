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


' Exit from inside sub.
countdown 3
SUB countdown (x AS INTEGER)
  PRINT x
  IF x = 0 THEN EXIT SUB
  countdown x - 1
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
'     {"output": " 0 \n"}
'   ]
' }
