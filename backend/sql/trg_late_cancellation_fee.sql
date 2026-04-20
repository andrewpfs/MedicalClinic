-- Charges a $15 late cancellation fee when an appointment is cancelled
-- within 24 hours of the scheduled time.
-- StatusCode 3 = Cancelled.
-- Status='Cancellation' so the cancel route's void query (targets 'Pending') won't wipe this fee.

DELIMITER $$

CREATE TRIGGER trg_late_cancellation_fee
AFTER UPDATE ON appointment
FOR EACH ROW
BEGIN
  IF OLD.StatusCode != 3
     AND NEW.StatusCode = 3
     AND TIMESTAMP(OLD.AppointmentDate, COALESCE(OLD.AppointmentTime, '00:00:00')) <= DATE_ADD(NOW(), INTERVAL 24 HOUR)
  THEN
    INSERT INTO transaction
      (AppointmentID, PatientID, PaymentCode, Amount, TransactionDateTime, Status, DueDate)
    VALUES
      (NEW.AppointmentID, NEW.PatientID, NULL, 15.00, NOW(), 'Cancellation', DATE_ADD(CURDATE(), INTERVAL 30 DAY));
  END IF;
END$$

DELIMITER ;
