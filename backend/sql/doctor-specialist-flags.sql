START TRANSACTION;

-- Referral eligibility is controlled by doctor.IsPrimaryCare.
-- Doctors marked 0 appear as referral specialists; doctors marked 1 remain primary care.
-- EmployeeID is used in the WHERE clauses so this runs under MySQL Workbench safe update mode.
UPDATE doctor
SET IsPrimaryCare = 0
WHERE EmployeeID IN (3360, 3380, 33607);

UPDATE doctor
SET IsPrimaryCare = 1
WHERE EmployeeID IN (3, 3320);

SELECT
  e.EmployeeID,
  e.FirstName,
  e.LastName,
  d.Specialty,
  d.IsPrimaryCare
FROM doctor d
JOIN employee e ON e.EmployeeID = d.EmployeeID
ORDER BY d.IsPrimaryCare, d.Specialty, e.LastName;

COMMIT;
