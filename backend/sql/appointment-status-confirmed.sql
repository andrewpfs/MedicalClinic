INSERT INTO appointmentstatus (AppointmentText, AppointmentCode)
SELECT 'Confirmed', 5
WHERE NOT EXISTS (
  SELECT 1
  FROM appointmentstatus
  WHERE AppointmentCode = 5 OR LOWER(AppointmentText) = 'confirmed'
);
