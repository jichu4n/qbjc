TYPE EmployeeRecord
  employee AS Employee
  startDate AS STRING
END TYPE

TYPE Contact
  name AS STRING
  email AS STRING
END TYPE

TYPE Employee
  contact AS Contact
  id AS LONG
END TYPE

' Test initialization and direct usage.
DIM r1 AS EmployeeRecord
PRINT "["; r1.employee.id; "] "; r1.employee.contact.name
r1.startDate = "1975-04-04"
r1.employee.id = 1
r1.employee.contact.name = "Bill Gates"
PRINT "["; r1.employee.id; "] "; r1.employee.contact.name

' Test assignment.
DIM r2 AS EmployeeRecord
r2 = r1
r2.employee.id = 2
r2.employee.contact.name = "Paul Allen"
PRINT "["; r1.employee.id; "] "; r1.employee.contact.name
PRINT "["; r2.employee.id; "] "; r2.employee.contact.name


' Test array of UDTs.
CONST numEmployees = 5
DIM a1(1 TO numEmployees) AS EmployeeRecord
PRINT a1(numEmployees).employee.id
FOR i = 1 TO numEmployees
  a1(i).employee.id = 2 ^ (i - 1)
  a1(i).employee.contact.name = "Test" + STR$(i)
NEXT i
PRINT a1(numEmployees).employee.id

' Test passing UDT to procedures.
SUB PrintEmployeeRecord (r AS EmployeeRecord)
  PRINT "["; r.employee.id; "] "; r.employee.contact.name
END SUB
SUB PrintEmployeeRecords (a() AS EmployeeRecord)
  FOR i = 1 TO UBOUND(a)
    PrintEmployeeRecord a(i)
  NEXT
END SUB
PrintEmployeeRecords a1

SUB ClearEmployeeRecord (r AS EmployeeRecord)
  DIM newRecord AS EmployeeRecord
  r = newRecord
END SUB

ClearEmployeeRecord (r1) ' This should have no effect
PrintEmployeeRecord r1
ClearEmployeeRecord r1 ' This should actually clear out r1
PrintEmployeeRecord r1

ClearEmployeeRecord (a1(1)) ' This should have no effect
PrintEmployeeRecord a1(1)
ClearEmployeeRecord a1(1) ' This should actually clear out r1
PrintEmployeeRecord a1(1)

' EXPECT {
'   "io": [
'     {"output": "[ 0 ] \n"},
'     {"output": "[ 1 ] Bill Gates\n"},
'
'     {"output": "[ 1 ] Bill Gates\n"},
'     {"output": "[ 2 ] Paul Allen\n"},
'
'     {"output": " 0 \n"},
'     {"output": " 16 \n"},
'
'     {"output": "[ 1 ] Test 1\n"},
'     {"output": "[ 2 ] Test 2\n"},
'     {"output": "[ 4 ] Test 3\n"},
'     {"output": "[ 8 ] Test 4\n"},
'     {"output": "[ 16 ] Test 5\n"},
'
'     {"output": "[ 1 ] Bill Gates\n"},
'     {"output": "[ 0 ] \n"},
'
'     {"output": "[ 1 ] Test 1\n"},
'     {"output": "[ 0 ] \n"}
'   ]
' }
