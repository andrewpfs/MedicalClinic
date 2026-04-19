CREATE TABLE IF NOT EXISTS staff_notification (
  NotificationID INT AUTO_INCREMENT PRIMARY KEY,
  EmployeeID     INT NOT NULL,
  Message        TEXT NOT NULL,
  Type           VARCHAR(50) DEFAULT 'message',
  Link           VARCHAR(255) DEFAULT '/doctor',
  IsRead         TINYINT(1) DEFAULT 0,
  CreatedAt      DATETIME DEFAULT NOW()
);
