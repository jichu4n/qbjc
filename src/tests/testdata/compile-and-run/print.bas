PRINT "Hello", "world"
PRINT "Hello", "world",
PRINT
PRINT "Hello"; "world"
PRINT "Hello"; "world";
PRINT
PRINT ,,,
PRINT ,,,"hi"
PRINT 1; "+"; 2;

PRINT USING "[###]"; 3.5
PRINT USING "[###.##]"; 0.789

' EXPECT {
'   "io": [
'     {"output": "Hello         world\n"},
'     {"output": "Hello         world         "},
'     {"output": "\n"},
'     {"output": "Helloworld\n"},
'     {"output": "Helloworld"},
'     {"output": "\n"},
'     {"output": "                                          "},
'     {"output": "                                          hi\n"},
'     {"output": " 1 + 2 "},
'
'     {"output": "[  4]\n"},
'     {"output": "[  0.79]\n"}
'   ]
' }
