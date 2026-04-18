START TRANSACTION;

INSERT INTO employee
(
  FirstName,
  LastName,
  Birthdate,
  GenderCode,
  RaceCode,
  EthnicityCode,
  Role,
  Address,
  PhoneNumber,
  Email,
  Password,
  DepartmentID
)
VALUES
(
  'Riley',
  'Receptionist',
  NULL,
  NULL,
  NULL,
  NULL,
  'Receptionist',
  'Front Desk',
  '5551234567',
  'receptionist.dev@clinic.local',
  'admin123',
  (SELECT DepartmentID FROM department ORDER BY DepartmentID LIMIT 1)
);

SET @ReceptionistEmployeeID = LAST_INSERT_ID();

SELECT EmployeeID, FirstName, LastName, Role, Email
FROM employee
WHERE EmployeeID = @ReceptionistEmployeeID;

COMMIT;

SELECT EmployeeID, FirstName, LastName, Role, Email
FROM employee
WHERE Role = 'Receptionist'
ORDER BY EmployeeID DESC;
