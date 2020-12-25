PRINT get_answer()

FUNCTION get_answer
  PRINT "answer =";
  get_answer = 42
END FUNCTION

' EXPECT {
'   "io": [
'     {"output": "answer = 42 \n"}
'   ]
' }
