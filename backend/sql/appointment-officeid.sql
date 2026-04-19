START TRANSACTION;

-- Some development databases were created without appointment.OfficeID.
-- The app still reads and writes this field in receptionist/patient scheduling flows.
SET @appointment_office_column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointment'
    AND COLUMN_NAME = 'OfficeID'
);

SET @add_appointment_office_column_sql = IF(
  @appointment_office_column_exists = 0,
  'ALTER TABLE appointment ADD COLUMN OfficeID INT NULL AFTER DoctorID',
  'SELECT ''appointment.OfficeID already exists'' AS Message'
);

PREPARE add_appointment_office_column_stmt FROM @add_appointment_office_column_sql;
EXECUTE add_appointment_office_column_stmt;
DEALLOCATE PREPARE add_appointment_office_column_stmt;

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

UPDATE appointment
SET OfficeID = @default_office_id
WHERE AppointmentID > 0
  AND OfficeID IS NULL;

SET @appointment_office_index_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointment'
    AND COLUMN_NAME = 'OfficeID'
);

SET @add_appointment_office_index_sql = IF(
  @appointment_office_index_exists = 0,
  'ALTER TABLE appointment ADD INDEX idx_appointment_officeid (OfficeID)',
  'SELECT ''appointment.OfficeID index already exists'' AS Message'
);

PREPARE add_appointment_office_index_stmt FROM @add_appointment_office_index_sql;
EXECUTE add_appointment_office_index_stmt;
DEALLOCATE PREPARE add_appointment_office_index_stmt;

SET @appointment_office_fk_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointment'
    AND COLUMN_NAME = 'OfficeID'
    AND REFERENCED_TABLE_NAME = 'office'
);

SET @add_appointment_office_fk_sql = IF(
  @office_table_exists = 1 AND @appointment_office_fk_exists = 0,
  'ALTER TABLE appointment ADD CONSTRAINT fk_appointment_officeid FOREIGN KEY (OfficeID) REFERENCES office(OfficeID)',
  'SELECT ''appointment.OfficeID foreign key skipped or already exists'' AS Message'
);

PREPARE add_appointment_office_fk_stmt FROM @add_appointment_office_fk_sql;
EXECUTE add_appointment_office_fk_stmt;
DEALLOCATE PREPARE add_appointment_office_fk_stmt;

SELECT AppointmentID, PatientID, DoctorID, OfficeID, AppointmentDate, AppointmentTime
FROM appointment
ORDER BY AppointmentID DESC
LIMIT 10;

COMMIT;
