' Tests for case sensitivity.

DIM x AS INTEGER
x = 5
PRINT X
F1 X

sub f1(t as integer)
  shared X
  print x
  call F2(T)
  PRINT T
end sub

sub f2(r as integer)
  R = 42
  PRINT r
END SUB


TYPE Person
  Name AS STRING
END TYPE

dim p as person
P.name = "Bill Gates"
print p.NAME

gosub F3
f3_end:
end

f3:
  PRINT P.name
  RETURN F3_END


' EXPECT {
'   "io": [
'     {"output": " 5 \n"},
'     {"output": " 5 \n"},
'     {"output": " 42 \n"},
'     {"output": " 42 \n"},
'     {"output": "Bill Gates\n"},
'     {"output": "Bill Gates\n"}
'   ]
' }
