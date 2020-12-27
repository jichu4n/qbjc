FOR i = 1 TO 3
  CALL f1
  CALL f2("yo")
NEXT
SUB f1
  PRINT "hi"
END SUB
SUB f2(x AS STRING)
  PRINT x
END SUB

' EXPECT {
'   "io": [
'     {"output": "hi\n"},
'     {"output": "yo\n"},
'     {"output": "hi\n"},
'     {"output": "yo\n"},
'     {"output": "hi\n"},
'     {"output": "yo\n"}
'   ]
' }
