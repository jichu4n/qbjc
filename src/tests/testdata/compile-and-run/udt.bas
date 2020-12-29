TYPE EmployeeRecord
  employee AS Employee
  ts AS STRING
END TYPE

TYPE Person
  name AS STRING
  email AS STRING
END TYPE

TYPE Employee
  person AS Person
  id AS LONG
END TYPE
