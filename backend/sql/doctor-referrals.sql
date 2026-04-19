START TRANSACTION;

-- Enables doctor-approved referrals from a primary care doctor to a specialist.
-- Existing databases that already have this table will be left unchanged.
CREATE TABLE IF NOT EXISTS referral (
  ReferralID INT AUTO_INCREMENT PRIMARY KEY,
  PatientID INT NOT NULL,
  PrimaryCareDoctorID INT NOT NULL,
  SpecialistDoctorID INT NOT NULL,
  ApprovalDate DATE NOT NULL,
  ExpirationDate DATE NULL,
  Status VARCHAR(20) NOT NULL DEFAULT 'Approved',
  INDEX idx_referral_patient_specialist (PatientID, SpecialistDoctorID, Status, ExpirationDate),
  INDEX idx_referral_primary_doctor (PrimaryCareDoctorID),
  INDEX idx_referral_specialist_doctor (SpecialistDoctorID),
  CONSTRAINT fk_referral_patient
    FOREIGN KEY (PatientID) REFERENCES patient(PatientID),
  CONSTRAINT fk_referral_primary_doctor
    FOREIGN KEY (PrimaryCareDoctorID) REFERENCES doctor(EmployeeID),
  CONSTRAINT fk_referral_specialist_doctor
    FOREIGN KEY (SpecialistDoctorID) REFERENCES doctor(EmployeeID)
);

COMMIT;

-- Verification
SELECT ReferralID, PatientID, PrimaryCareDoctorID, SpecialistDoctorID, ApprovalDate, ExpirationDate, Status
FROM referral
ORDER BY ReferralID DESC;
