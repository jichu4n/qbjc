' Example from Microsoft QuickBASIC BASIC: Language Reference
FOR i = 1 TO 2
    INPUT "Binary number = ",Binary$   'Input binary number as
                                        'string.
    Length = LEN(Binary$)              'Get length of string.
    Decimal = 0

    FOR K = 1 TO Length
        'Get individual digits from string, from left to right.
        Digit$ = MID$(Binary$,K,1)
        'Test for valid binary digit.
        IF Digit$="0" OR Digit$="1" THEN
        'Convert digit characters to numbers.
        Decimal = 2*Decimal + VAL(Digit$)
        ELSE
        PRINT "Error--invalid binary digit: ";Digit$
        EXIT FOR
        END IF
    NEXT
    PRINT "Decimal number ="; Decimal
NEXT i

' Example from Microsoft QuickBASIC BASIC: Language Reference
FOR i = 1 TO 3
    ' Get a name.
    DO
        INPUT "Enter name: ", Nm$
    LOOP UNTIL LEN(Nm$)>=3

    ' Convert lowercase letters to uppercase.
    Nm$ = UCASE$(Nm$)

    ' Look for MS., MRS., or MR. to set Sex$.
    IF INSTR(Nm$,"MS.") > 0 OR INSTR(Nm$,"MRS.") > 0 THEN
        Sex$ = "F"
    ELSEIF INSTR(Nm$,"MR.") > 0 THEN
        Sex$ = "M"
    ELSE
        ' Can't deduce sex, so query user.
        DO
            INPUT "Enter sex (M/F): ", Sex$
            Sex$ = UCASE$(Sex$)
        LOOP WHILE Sex$ <> "M" AND Sex$ <> "F"
    END IF

    PRINT "Sex$ = "; Sex$
NEXT

' EXPECT {
'   "io": [
'     {"output": "Binary number = "},
'     {"input": "10110"},
'     {"output": "Decimal number = 22 \n"},
'
'     {"output": "Binary number = "},
'     {"input": "10001"},
'     {"output": "Decimal number = 17 \n"},
'
'     {"output": "Enter name: "},
'     {"input": "Elspeth Brandtkeep"},
'     {"output": "Enter sex (M/F): "},
'     {"input": "x"},
'     {"output": "Enter sex (M/F): "},
'     {"input": "F"},
'     {"output": "Sex$ = F\n"},
'
'     {"output": "Enter name: "},
'     {"input": "Mr. Bill Gates"},
'     {"output": "Sex$ = M\n"},
'
'     {"output": "Enter name: "},
'     {"input": "Mrs. Melinda Gates"},
'     {"output": "Sex$ = F\n"}
'   ]
' }

