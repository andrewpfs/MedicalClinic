SET @bio_column_exists = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'doctor'
    AND COLUMN_NAME = 'Bio'
);

SET @add_bio_sql = IF(
  @bio_column_exists = 0,
  'ALTER TABLE doctor ADD COLUMN Bio TEXT NULL',
  'SELECT ''doctor.Bio already exists'' AS Message'
);

PREPARE add_bio_stmt FROM @add_bio_sql;
EXECUTE add_bio_stmt;
DEALLOCATE PREPARE add_bio_stmt;

CREATE TABLE IF NOT EXISTS doctor_review (
  ReviewID INT NOT NULL AUTO_INCREMENT,
  AppointmentID INT NOT NULL,
  PatientID INT NOT NULL,
  DoctorID INT NOT NULL,
  Rating TINYINT NOT NULL,
  Comment TEXT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  IsSeenByDoctor TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (ReviewID),
  UNIQUE KEY uq_doctor_review_appointment (AppointmentID),
  KEY idx_doctor_review_doctor (DoctorID),
  KEY idx_doctor_review_patient (PatientID),
  CONSTRAINT fk_doctor_review_appointment FOREIGN KEY (AppointmentID) REFERENCES appointment (AppointmentID),
  CONSTRAINT fk_doctor_review_patient FOREIGN KEY (PatientID) REFERENCES patient (PatientID),
  CONSTRAINT fk_doctor_review_doctor FOREIGN KEY (DoctorID) REFERENCES doctor (EmployeeID),
  CONSTRAINT chk_doctor_review_rating CHECK (Rating BETWEEN 1 AND 5)
);
