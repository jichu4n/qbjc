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
PRINT USING "& ### &"; "foo"; 1000; "bar"
PRINT USING "$$###.##";456.78

' Disambiguating without separators
PRINT 3 ("hello") f1 ("hello") f1("hello") f2 ("hello", 3)

FUNCTION f1(s AS STRING)
  f1 = LEN(s)
END FUNCTION

FUNCTION f2(s AS STRING, n AS INTEGER)
  f2 = LEN(s) * n
END FUNCTION

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
'     {"output": "[  0.79]\n"},
'     {"output": "foo 1000 bar\n"},
'     {"output": " $456.78\n"},
'
'     {"output": " 3 hello 5  5  15 \n"}
'   ]
' }
