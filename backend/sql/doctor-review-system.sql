ALTER TABLE doctor
ADD COLUMN IF NOT EXISTS Bio TEXT NULL;

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
