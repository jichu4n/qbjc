FOR n = 0 TO 4
  SELECT CASE n
    CASE 0
      PRINT "ZERO"
    CASE 1, 2
      PRINT "ONE OR TWO"
    CASE ELSE
      PRINT "ELSE"
  END SELECT
NEXT

' Example from Microsoft QuickBASIC BASIC: Language Reference
FOR i = 1 TO 6

  INPUT "Enter acceptable level of risk (1-10): ", Total
  SELECT CASE Total

      CASE IS >= 10
          PRINT "Maximum risk and potential return"
          PRINT "Choose stock investment plan"

      CASE  6 TO 9
          PRINT "High risk and potential return"
          PRINT "Choose corporate bonds"

      CASE  2 TO 5
          PRINT "Moderate risk and return"
          PRINT "Choose mutual fund"

      CASE 1
          PRINT "No risk, low return"
          PRINT "Choose IRA"

      CASE ELSE
          PRINT "RESPONSE OUT OF RANGE"

  END SELECT

NEXT

' EXPECT {
'   "io": [
'     {"output": "ZERO\n"},
'     {"output": "ONE OR TWO\n"},
'     {"output": "ONE OR TWO\n"},
'     {"output": "ELSE\n"},
'     {"output": "ELSE\n"},
'
'     {"output": "Enter acceptable level of risk (1-10): "},
'     {"input": "10"},
'     {"output": "Maximum risk and potential return\n"},
'     {"output": "Choose stock investment plan\n"},
'
'     {"output": "Enter acceptable level of risk (1-10): "},
'     {"input": "0"},
'     {"output": "RESPONSE OUT OF RANGE\n"},
'
'     {"output": "Enter acceptable level of risk (1-10): "},
'     {"input": "1"},
'     {"output": "No risk, low return\n"},
'     {"output": "Choose IRA\n"},
'
'     {"output": "Enter acceptable level of risk (1-10): "},
'     {"input": "2"},
'     {"output": "Moderate risk and return\n"},
'     {"output": "Choose mutual fund\n"},
'
'     {"output": "Enter acceptable level of risk (1-10): "},
'     {"input": "3"},
'     {"output": "Moderate risk and return\n"},
'     {"output": "Choose mutual fund\n"},
'
'     {"output": "Enter acceptable level of risk (1-10): "},
'     {"input": "12"},
'     {"output": "Maximum risk and potential return\n"},
'     {"output": "Choose stock investment plan\n"}
'   ]
' }
