DEF FnDouble (x) = x + x
DEF FnQuadruple (x) = FnDouble(FnDouble(x))

PRINT fnquadruple(7)

' EXPECT {
'   "io": [
'     {"output": " 28 \n"}
'   ]
' }



