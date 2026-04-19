const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { register, login, logout } = require('../auth');

const router = express.Router();

const PATIENT_SECRET = 'secretkey';
const COMPLETED_STATUS_CODE = 4;
const REVIEW_SQL_HINT = 'Run backend/sql/doctor-review-system.sql to enable doctor reviews.';
const DOCTOR_DIRECTORY_SQL_HINT = 'Run backend/sql/doctor-profile-image.sql to enable doctor profile images.';

const isPatientFeatureSchemaMissing = (err) =>
  err && (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_FIELD_ERROR');

const getPatientId = (req) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return null;
    const data = jwt.verify(token, PATIENT_SECRET);
    return data.id;
  } catch {
    return null;
  }
};

router.post('/login', login);
router.post('/register', register);
router.get('/logout', logout);

router.get('/api/profile', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  try {
    const [rows] = await db.query('SELECT * FROM patient WHERE PatientID = ?', [patientId]);
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Error loading profile' });
  }
});

router.post('/update-profile', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  const {
    fName,
    mName,
    lName,
    dob,
    phone,
    address,
    genderCode,
    raceCode,
    ethnicityCode,
    hasInsurance,
  } = req.body;

  try {
    await db.query(
      `UPDATE patient
       SET FName = ?, MName = ?, LName = ?, Dob = ?,
           PhoneNumber = ?, Address = ?,
           GenderCode = ?, RaceCode = ?, EthnicityCode = ?, HasInsurance = ?
       WHERE PatientID = ?`,
      [
        fName,
        mName || null,
        lName,
        dob || null,
        phone,
        address,
        genderCode || null,
        raceCode || null,
        ethnicityCode || null,
        hasInsurance ? 1 : 0,
        patientId,
      ]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed.' });
  }
});

router.get('/api/doctors', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  try {
    const [doctors] = await db.query(
      `SELECT
         e.EmployeeID,
         e.FirstName,
         e.LastName,
         d.Specialty,
         d.Bio,
         d.ProfileImageUrl,
         dept.DepartmentName,
         COALESCE(reviewSummary.ReviewCount, 0) AS ReviewCount,
         COALESCE(reviewSummary.AverageRating, 0) AS AverageRating
       FROM employee e
       LEFT JOIN doctor d ON e.EmployeeID = d.EmployeeID
       LEFT JOIN department dept ON e.DepartmentID = dept.DepartmentID
       LEFT JOIN (
         SELECT DoctorID, COUNT(*) AS ReviewCount, AVG(Rating) AS AverageRating
         FROM doctor_review
         GROUP BY DoctorID
       ) AS reviewSummary
         ON reviewSummary.DoctorID = e.EmployeeID
       WHERE e.Role = 'Doctor'
       ORDER BY e.LastName, e.FirstName`
    );
    res.json(doctors);
  } catch (err) {
    console.error(err);
    if (isPatientFeatureSchemaMissing(err)) {
      return res.status(409).json({ error: `${REVIEW_SQL_HINT} ${DOCTOR_DIRECTORY_SQL_HINT}` });
    }
    res.status(500).json({ error: 'Database Error' });
  }
});

router.post('/book', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  const { doctorId, date, reason } = req.body;
  const formattedDate = `${date.replace('T', ' ')}:00`;

  try {
    const [conflict] = await db.query(
      `SELECT AppointmentID
       FROM appointment
       WHERE DoctorID = ? AND AppointmentDate = ? AND StatusCode != 3`,
      [doctorId, formattedDate]
    );

    if (conflict.length > 0) {
      return res.status(409).json({
        error: 'This doctor already has an appointment at that date and time. Please choose a different time.',
      });
    }

    await db.query(
      `INSERT INTO appointment
        (PatientID, DoctorID, AppointmentDate, StatusCode, ReasonForVisit)
       VALUES (?, ?, ?, ?, ?)`,
      [patientId, doctorId, formattedDate, 1, reason || null]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('SQL ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/api/doctor-shifts', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  const { doctorId, start, end } = req.query;

  try {
    const [rows] = await db.query(
      `SELECT ShiftDate, StartTime, EndTime
       FROM employee_shift
       WHERE EmployeeID = ? AND ShiftDate BETWEEN ? AND ?`,
      [doctorId, start, end]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Failed to load shifts' });
  }
});

router.get('/api/booked-slots', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  const { doctorId, start, end } = req.query;

  try {
    const [rows] = await db.query(
      `SELECT AppointmentDate,
              AppointmentTime,
              CASE WHEN PatientID = ? THEN 'patient' ELSE 'doctor' END AS conflictType
       FROM appointment
       WHERE (DoctorID = ? OR PatientID = ?)
         AND AppointmentDate BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
         AND StatusCode != 3`,
      [patientId, doctorId, patientId, start, end]
    );

    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Failed to load booked slots' });
  }
});

router.get('/api/visits', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  try {
    const [rows] = await db.query(
      `SELECT
         a.AppointmentID,
         a.PatientID,
         a.DoctorID,
         a.AppointmentDate,
         a.AppointmentTime,
         a.StatusCode,
         a.ReasonForVisit,
         e.FirstName,
         e.LastName,
         s.AppointmentText AS Status,
         dr.ReviewID,
         dr.Rating AS ReviewRating,
         dr.Comment AS ReviewComment,
         dr.CreatedAt AS ReviewCreatedAt,
         CASE WHEN dr.ReviewID IS NULL THEN 0 ELSE 1 END AS HasReview,
         CASE
           WHEN a.StatusCode = ? AND dr.ReviewID IS NULL THEN 1
           ELSE 0
         END AS CanReview
       FROM appointment a
       JOIN appointmentstatus s ON a.StatusCode = s.AppointmentCode
       JOIN employee e ON a.DoctorID = e.EmployeeID
       LEFT JOIN doctor_review dr ON dr.AppointmentID = a.AppointmentID
       WHERE a.PatientID = ?
       ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC`,
      [COMPLETED_STATUS_CODE, patientId]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    if (isPatientFeatureSchemaMissing(err)) {
      return res.status(409).json({ error: REVIEW_SQL_HINT });
    }
    res.status(500).json({ error: 'Error fetching visits' });
  }
});

router.post('/api/reviews', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  const appointmentId = Number(req.body.appointmentId);
  const rating = Number(req.body.rating);
  const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';

  if (!appointmentId) {
    return res.status(400).json({ error: 'A valid appointment is required.' });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be a whole number between 1 and 5.' });
  }

  if (comment.length > 1000) {
    return res.status(400).json({ error: 'Comment must be 1000 characters or fewer.' });
  }

  try {
    const [[appointment]] = await db.query(
      `SELECT AppointmentID, PatientID, DoctorID, StatusCode
       FROM appointment
       WHERE AppointmentID = ?
       LIMIT 1`,
      [appointmentId]
    );

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found.' });
    }

    if (Number(appointment.PatientID) !== Number(patientId)) {
      return res.status(403).json({ error: 'You can only review your own appointments.' });
    }

    if (Number(appointment.StatusCode) !== COMPLETED_STATUS_CODE) {
      return res.status(400).json({ error: 'Reviews can only be submitted for completed appointments.' });
    }

    const [[existingReview]] = await db.query(
      'SELECT ReviewID FROM doctor_review WHERE AppointmentID = ? LIMIT 1',
      [appointmentId]
    );

    if (existingReview) {
      return res.status(409).json({ error: 'A review has already been submitted for this appointment.' });
    }

    await db.query(
      `INSERT INTO doctor_review
        (AppointmentID, PatientID, DoctorID, Rating, Comment, IsSeenByDoctor)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [appointmentId, patientId, appointment.DoctorID, rating, comment || null]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);

    if (isPatientFeatureSchemaMissing(err)) {
      return res.status(409).json({ error: REVIEW_SQL_HINT });
    }

    if (err && err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A review has already been submitted for this appointment.' });
    }

    res.status(500).json({ error: 'Failed to save review.' });
  }
});

router.post('/cancel-appointment', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  const { appointmentId } = req.body;

  try {
    const [rows] = await db.query(
      'SELECT * FROM appointment WHERE AppointmentID = ? AND PatientID = ?',
      [appointmentId, patientId]
    );

    if (rows.length === 0) return res.status(403).json({ error: 'Not authorized' });

    await db.query('UPDATE appointment SET StatusCode = 3 WHERE AppointmentID = ?', [appointmentId]);
    await db.query(
      "UPDATE transaction SET Status = 'Void' WHERE AppointmentID = ? AND Status = 'Pending'",
      [appointmentId]
    );
    await db.query(
      `INSERT INTO notification (PatientID, Message, Type, Link)
       VALUES (?, CONCAT('Your appointment on ', DATE_FORMAT(?, '%M %d, %Y'), ' has been cancelled.'), 'appointment', '/patient/visits')`,
      [patientId, rows[0].AppointmentDate]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

router.post('/reschedule-appointment', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  const { appointmentId, newDate } = req.body;
  const formattedDate = `${newDate.replace('T', ' ')}:00`;

  try {
    const [rows] = await db.query(
      'SELECT * FROM appointment WHERE AppointmentID = ? AND PatientID = ?',
      [appointmentId, patientId]
    );

    if (rows.length === 0) return res.status(403).json({ error: 'Not authorized' });

    const [conflict] = await db.query(
      `SELECT AppointmentID
       FROM appointment
       WHERE DoctorID = ?
         AND AppointmentDate = ?
         AND StatusCode != 3
         AND AppointmentID != ?`,
      [rows[0].DoctorID, formattedDate, appointmentId]
    );

    if (conflict.length > 0) {
      return res.status(409).json({ error: 'That time slot is already booked.' });
    }

    await db.query('UPDATE appointment SET AppointmentDate = ? WHERE AppointmentID = ?', [
      formattedDate,
      appointmentId,
    ]);
    await db.query(
      `INSERT INTO notification (PatientID, Message, Type, Link)
       VALUES (?, CONCAT('Your appointment has been rescheduled to ', DATE_FORMAT(?, '%M %d, %Y at %h:%i %p'), '.'), 'appointment', '/patient/visits')`,
      [patientId, formattedDate]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reschedule appointment' });
  }
});

router.get('/api/payments', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  try {
    const [invoices] = await db.query(
      `SELECT DISTINCT
         t.TransactionID,
         t.Amount,
         a.AppointmentDate,
         e.LastName AS DoctorName
       FROM transaction t
       JOIN appointment a ON t.AppointmentID = a.AppointmentID
       JOIN employee e ON a.DoctorID = e.EmployeeID
       WHERE t.PatientID = ?
         AND t.Status = 'Pending'
         AND a.StatusCode = 1`,
      [patientId]
    );

    res.json(invoices);
  } catch {
    res.status(500).json({ error: 'Error loading invoices' });
  }
});

router.post('/pay', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  const { transactionId } = req.body;

  try {
    await db.query("UPDATE transaction SET Status = 'Posted' WHERE TransactionID = ?", [transactionId]);
    await db.query(
      `UPDATE appointment
       SET StatusCode = 2
       WHERE AppointmentID = (SELECT AppointmentID FROM transaction WHERE TransactionID = ?)`,
      [transactionId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Payment failed.' });
  }
});

router.get('/api/payment-history', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  try {
    const [rows] = await db.query(
      `SELECT DISTINCT
         t.TransactionID,
         t.Amount,
         a.AppointmentDate,
         e.LastName AS DoctorName
       FROM transaction t
       JOIN appointment a ON t.AppointmentID = a.AppointmentID
       JOIN employee e ON a.DoctorID = e.EmployeeID
       WHERE t.PatientID = ?
         AND t.Status = 'Posted'
       ORDER BY a.AppointmentDate DESC`,
      [patientId]
    );

    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error loading payment history' });
  }
});

router.get('/api/payment-methods', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  try {
    const [rows] = await db.query(
      'SELECT * FROM payment_method WHERE PatientID = ? ORDER BY IsDefault DESC',
      [patientId]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error loading payment methods' });
  }
});

router.post('/api/payment-methods', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  const { cardType, lastFour, isDefault } = req.body;

  try {
    if (isDefault) {
      await db.query('UPDATE payment_method SET IsDefault = 0 WHERE PatientID = ?', [patientId]);
    }

    await db.query(
      `INSERT INTO payment_method (PatientID, CardType, LastFour, IsDefault)
       VALUES (?, ?, ?, ?)`,
      [patientId, cardType, lastFour, isDefault ? 1 : 0]
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Error adding payment method' });
  }
});

router.delete('/api/payment-methods/:id', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  try {
    await db.query(
      'DELETE FROM payment_method WHERE PaymentMethodID = ? AND PatientID = ?',
      [req.params.id, patientId]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Error removing payment method' });
  }
});

router.get('/api/notifications', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  try {
    const [rows] = await db.query(
      'SELECT * FROM notification WHERE PatientID = ? ORDER BY CreatedAt DESC LIMIT 20',
      [patientId]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Error loading notifications' });
  }
});

router.patch('/api/notifications/:id/read', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  try {
    await db.query(
      'UPDATE notification SET IsRead = 1 WHERE NotificationID = ? AND PatientID = ?',
      [req.params.id, patientId]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Error marking notification as read' });
  }
});

router.patch('/api/notifications/read-all', async (req, res) => {
  const patientId = getPatientId(req);
  if (!patientId) return res.status(401).json({ error: 'Not logged in' });

  try {
    await db.query('UPDATE notification SET IsRead = 1 WHERE PatientID = ?', [patientId]);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Error marking all as read' });
  }
});

module.exports = router;
