-- Seed realistic TransactionDateTime values for existing transactions
-- Spreads dates across the past 6 months based on TransactionID order

UPDATE transaction
SET TransactionDateTime = CASE
    WHEN TransactionID % 12 = 0  THEN DATE_SUB(NOW(), INTERVAL 175 DAY)
    WHEN TransactionID % 12 = 1  THEN DATE_SUB(NOW(), INTERVAL 155 DAY)
    WHEN TransactionID % 12 = 2  THEN DATE_SUB(NOW(), INTERVAL 135 DAY)
    WHEN TransactionID % 12 = 3  THEN DATE_SUB(NOW(), INTERVAL 115 DAY)
    WHEN TransactionID % 12 = 4  THEN DATE_SUB(NOW(), INTERVAL 98 DAY)
    WHEN TransactionID % 12 = 5  THEN DATE_SUB(NOW(), INTERVAL 80 DAY)
    WHEN TransactionID % 12 = 6  THEN DATE_SUB(NOW(), INTERVAL 62 DAY)
    WHEN TransactionID % 12 = 7  THEN DATE_SUB(NOW(), INTERVAL 45 DAY)
    WHEN TransactionID % 12 = 8  THEN DATE_SUB(NOW(), INTERVAL 30 DAY)
    WHEN TransactionID % 12 = 9  THEN DATE_SUB(NOW(), INTERVAL 18 DAY)
    WHEN TransactionID % 12 = 10 THEN DATE_SUB(NOW(), INTERVAL 8 DAY)
    ELSE                               DATE_SUB(NOW(), INTERVAL 2 DAY)
END
WHERE TransactionDateTime IS NULL;

-- Also seed DueDate for Pending transactions that are missing it
UPDATE transaction
SET DueDate = DATE_ADD(TransactionDateTime, INTERVAL 30 DAY)
WHERE DueDate IS NULL AND Status = 'Pending';

-- Seed LateFeeAmount for overdue Pending transactions (past due date)
UPDATE transaction
SET LateFeeAmount = ROUND(Amount * 0.10, 2)
WHERE Status = 'Pending'
  AND DueDate < NOW()
  AND (LateFeeAmount IS NULL OR LateFeeAmount = 0);
