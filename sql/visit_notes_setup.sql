-- Step 1: Add doctor notes and patient-visible summary to appointment
ALTER TABLE appointment
  ADD COLUMN DoctorNotes TEXT NULL,
  ADD COLUMN PatientSummary TEXT NULL;
