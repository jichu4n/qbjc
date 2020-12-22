PRINT "Hello", "world"
PRINT "Hello", "world",
PRINT
PRINT "Hello"; "world"
PRINT "Hello"; "world";
PRINT
PRINT ,,,
PRINT ,,,"hi"

' EXPECT {
'   "io": [
'     {"output": "Hello         world\n"},
'     {"output": "Hello         world         "},
'     {"output": "\n"},
'     {"output": "Helloworld\n"},
'     {"output": "Helloworld"},
'     {"output": "\n"},
'     {"output": "                                          "},
'     {"output": "                                          hi\n"}
'   ]
' }
