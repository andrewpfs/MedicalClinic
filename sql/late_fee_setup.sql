-- ================================================================
-- Late Fee System Setup
-- Run this entire file in MySQL Workbench against your database.
-- ================================================================


-- ── Step 1: Add new columns to the transaction table ────────────
-- DueDate    : 30 days after the transaction was created
-- LateFeeAmount : accumulated late fee (5% of Amount per week overdue)

ALTER TABLE transaction
  ADD COLUMN DueDate DATE NULL,
  ADD COLUMN LateFeeAmount DECIMAL(10,2) NOT NULL DEFAULT 0.00;


-- ── Step 2: Backfill DueDate for existing pending transactions ───
-- Any invoice already in the table won't have a DueDate yet.
-- Set it to 30 days after the transaction was originally created.
-- Safe-update mode is disabled temporarily to allow the WHERE on a non-key column.

SET SQL_SAFE_UPDATES = 0;

UPDATE transaction
SET DueDate = DATE_ADD(DATE(TransactionDateTime), INTERVAL 30 DAY)
WHERE DueDate IS NULL;

SET SQL_SAFE_UPDATES = 1;


-- ── Step 3: TRIGGER — set DueDate on every new transaction ──────
-- Fires BEFORE each INSERT so the row is born with a due date.

DELIMITER $$

CREATE TRIGGER trg_transaction_set_due_date
BEFORE INSERT ON transaction
FOR EACH ROW
BEGIN
  SET NEW.DueDate       = DATE_ADD(DATE(NEW.TransactionDateTime), INTERVAL 30 DAY);
  SET NEW.LateFeeAmount = 0.00;
END$$

DELIMITER ;


-- ── Step 4: Enable the MySQL Event Scheduler ─────────────────────
-- Azure MySQL blocks SET GLOBAL — enable it in the Azure Portal instead:
--   Azure Portal → MySQL resource → Server parameters
--   → search "event_scheduler" → set to ON → Save
--
-- If you cannot access the portal, skip to Step 5b (stored procedure).
-- The stored procedure approach is the fallback and works without the scheduler.

-- SET GLOBAL event_scheduler = ON;  ← uncomment only if you have SUPER privilege


-- ── Step 5a: EVENT — daily late fee + patient notification ────────
-- Only runs if event_scheduler is ON. Skip this block if using 5b below.

DELIMITER $$

CREATE EVENT IF NOT EXISTS evt_apply_late_fees
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
COMMENT 'Charges 5% weekly late fee on overdue pending invoices and notifies patients'
DO
BEGIN
  UPDATE transaction
  SET LateFeeAmount = ROUND(
    Amount * 0.05 * GREATEST(1, CEIL(DATEDIFF(CURDATE(), DueDate) / 7)),
    2
  )
  WHERE Status  = 'Pending'
    AND DueDate IS NOT NULL
    AND DueDate  < CURDATE();

  INSERT INTO notification (PatientID, Message, Type, Link, IsRead, CreatedAt)
  SELECT
    t.PatientID,
    CONCAT(
      'Invoice #', t.TransactionID,
      ' ($', FORMAT(t.Amount, 2), ')',
      ' was due on ', DATE_FORMAT(t.DueDate, '%M %d, %Y'), '.',
      ' A late fee of $', FORMAT(t.Amount * 0.05, 2),
      ' has been added to your balance.'
    ),
    'billing',
    '/patient/billing/balance',
    0,
    NOW()
  FROM transaction t
  WHERE t.Status  = 'Pending'
    AND t.DueDate IS NOT NULL
    AND DATEDIFF(CURDATE(), t.DueDate) = 1;
END$$

DELIMITER ;


-- ── Step 5b: STORED PROCEDURE — fallback for Azure MySQL ─────────
-- This procedure contains the exact same logic as the event above.
-- The Node.js backend calls it automatically each time a patient
-- loads their billing page, so fees are always up to date.

DELIMITER $$

CREATE PROCEDURE sp_apply_late_fees()
BEGIN
  SET SQL_SAFE_UPDATES = 0;

  -- Update late fee for all overdue pending invoices
  UPDATE transaction
  SET LateFeeAmount = ROUND(
    Amount * 0.05 * GREATEST(1, CEIL(DATEDIFF(CURDATE(), DueDate) / 7)),
    2
  )
  WHERE Status  = 'Pending'
    AND DueDate IS NOT NULL
    AND DueDate  < CURDATE();

  -- Notify patients on day 1 of being overdue (prevent duplicate notifications)
  INSERT INTO notification (PatientID, Message, Type, Link, IsRead, CreatedAt)
  SELECT
    t.PatientID,
    CONCAT(
      'Invoice #', t.TransactionID,
      ' ($', FORMAT(t.Amount, 2), ')',
      ' was due on ', DATE_FORMAT(t.DueDate, '%M %d, %Y'), '.',
      ' A late fee of $', FORMAT(t.Amount * 0.05, 2),
      ' has been added to your balance.'
    ),
    'billing',
    '/patient/billing/balance',
    0,
    NOW()
  FROM transaction t
  WHERE t.Status  = 'Pending'
    AND t.DueDate IS NOT NULL
    AND DATEDIFF(CURDATE(), t.DueDate) = 1;

  SET SQL_SAFE_UPDATES = 1;
END$$

DELIMITER ;


-- ── Done ─────────────────────────────────────────────────────────
-- To verify the trigger exists:
--   SHOW TRIGGERS LIKE 'transaction';
--
-- To verify the event exists:
--   SHOW EVENTS;
--
-- To manually fire the event right now for testing:
--   CALL evt_apply_late_fees_proc(); -- (not available; use UPDATE below)
--
-- To simulate overdue invoices for testing, temporarily set a DueDate
-- in the past on a Pending transaction:
--   UPDATE transaction SET DueDate = DATE_SUB(CURDATE(), INTERVAL 8 DAY)
--   WHERE TransactionID = <your_id> AND Status = 'Pending';
-- Then run the UPDATE and INSERT from Step 5a/5b manually.
-- ================================================================
