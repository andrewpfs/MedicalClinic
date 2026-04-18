CREATE TABLE IF NOT EXISTS appointment_message (
  MessageID    INT AUTO_INCREMENT PRIMARY KEY,
  AppointmentID INT NOT NULL,
  SenderType   ENUM('patient', 'doctor') NOT NULL,
  SenderID     INT NOT NULL,
  Body         TEXT NOT NULL,
  SentAt       DATETIME DEFAULT NOW(),
  IsRead       TINYINT(1) DEFAULT 0,
  FOREIGN KEY (AppointmentID) REFERENCES appointment(AppointmentID) ON DELETE CASCADE
);
