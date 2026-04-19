START TRANSACTION;

-- Some development databases were created without employee_shift.OfficeID.
-- The app uses this field when creating staff availability.
SET @employee_shift_office_column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employee_shift'
    AND COLUMN_NAME = 'OfficeID'
);

SET @add_employee_shift_office_column_sql = IF(
  @employee_shift_office_column_exists = 0,
  'ALTER TABLE employee_shift ADD COLUMN OfficeID INT NULL AFTER EmployeeID',
  'SELECT ''employee_shift.OfficeID already exists'' AS Message'
);

PREPARE add_employee_shift_office_column_stmt FROM @add_employee_shift_office_column_sql;
EXECUTE add_employee_shift_office_column_stmt;
DEALLOCATE PREPARE add_employee_shift_office_column_stmt;

SET @office_table_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'office'
);

SET @default_office_id = 1;

SET @default_office_sql = IF(
  @office_table_exists = 1,
  'SELECT COALESCE((SELECT OfficeID FROM office ORDER BY OfficeID LIMIT 1), 1) INTO @default_office_id',
  'SELECT 1 INTO @default_office_id'
);

PREPARE default_office_stmt FROM @default_office_sql;
EXECUTE default_office_stmt;
DEALLOCATE PREPARE default_office_stmt;

UPDATE employee_shift
SET OfficeID = @default_office_id
WHERE ShiftID > 0
  AND OfficeID IS NULL;

SET @employee_shift_office_index_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employee_shift'
    AND COLUMN_NAME = 'OfficeID'
);

SET @add_employee_shift_office_index_sql = IF(
  @employee_shift_office_index_exists = 0,
  'ALTER TABLE employee_shift ADD INDEX idx_employee_shift_officeid (OfficeID)',
  'SELECT ''employee_shift.OfficeID index already exists'' AS Message'
);

PREPARE add_employee_shift_office_index_stmt FROM @add_employee_shift_office_index_sql;
EXECUTE add_employee_shift_office_index_stmt;
DEALLOCATE PREPARE add_employee_shift_office_index_stmt;

SET @employee_shift_office_fk_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'employee_shift'
    AND COLUMN_NAME = 'OfficeID'
    AND REFERENCED_TABLE_NAME = 'office'
);

SET @add_employee_shift_office_fk_sql = IF(
  @office_table_exists = 1 AND @employee_shift_office_fk_exists = 0,
  'ALTER TABLE employee_shift ADD CONSTRAINT fk_employee_shift_officeid FOREIGN KEY (OfficeID) REFERENCES office(OfficeID)',
  'SELECT ''employee_shift.OfficeID foreign key skipped or already exists'' AS Message'
);

PREPARE add_employee_shift_office_fk_stmt FROM @add_employee_shift_office_fk_sql;
EXECUTE add_employee_shift_office_fk_stmt;
DEALLOCATE PREPARE add_employee_shift_office_fk_stmt;

SELECT ShiftID, EmployeeID, OfficeID, ShiftDate, StartTime, EndTime
FROM employee_shift
ORDER BY ShiftID DESC
LIMIT 10;

COMMIT;
