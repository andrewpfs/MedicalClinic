const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../../db');

const router = express.Router();

const STAFF_SECRET = 'staffsecret';
const MAX_BIO_LENGTH = 800;
const DOCTOR_FEATURE_SQL_HINT = 'Run backend/sql/doctor-review-system.sql and backend/sql/doctor-profile-image.sql to enable doctor profile features.';
const REFERRAL_SQL_HINT = 'Run backend/sql/doctor-referrals.sql to enable doctor referrals.';

const getStaff = (req) => {
  try {
    const token = req.cookies.staffToken;
    if (!token) return null;
    return jwt.verify(token, STAFF_SECRET);
  } catch {
    return null;
  }
};

const requireDoctor = (req, res) => {
  const staff = getStaff(req);

  if (!staff) {
    res.status(401).json({ success: false, error: 'Not logged in' });
    return null;
  }

  if (staff.role !== 'Doctor') {
    res.status(403).json({ success: false, error: 'Doctor access only.' });
    return null;
  }

  return staff;
};

const isDoctorFeatureSchemaMissing = (err) =>
  err && (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_FIELD_ERROR');

const isReferralSchemaMissing = (err) =>
  err && (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_BAD_FIELD_ERROR');

router.get('/', async (req, res) => {
  const staff = requireDoctor(req, res);
  if (!staff) return;

  const doctorId = staff.id;

  try {
    const [[profile]] = await db.query(
      `SELECT
         e.EmployeeID,
         e.FirstName,
         e.LastName,
         e.Role,
         e.DepartmentID,
         d.Specialty,
         d.IsPrimaryCare,
         d.Bio,
         d.ProfileImageUrl,
         dept.DepartmentName
       FROM employee e
       LEFT JOIN doctor d ON e.EmployeeID = d.EmployeeID
       LEFT JOIN department dept ON e.DepartmentID = dept.DepartmentID
       WHERE e.EmployeeID = ?
       LIMIT 1`,
      [doctorId]
    );

    const [appointments] = await db.query(
      `SELECT
         a.AppointmentID,
         a.PatientID,
         a.DoctorID,
         NULL AS OfficeID,
         DATE_FORMAT(a.AppointmentDate, '%Y-%m-%d') AS AppointmentDate,
         TIME_FORMAT(a.AppointmentDate, '%H:%i') AS AppointmentTime,
         a.ReasonForVisit,
         a.StatusCode,
         a.DoctorNotes,
         a.PatientSummary,
         p.FName AS PatientFirstName,
         p.LName AS PatientLastName,
         e.FirstName AS DoctorFirstName,
         e.LastName AS DoctorLastName,
         s.AppointmentText AS StatusText
       FROM appointment a
       JOIN patient p ON a.PatientID = p.PatientID
       JOIN employee e ON a.DoctorID = e.EmployeeID
       LEFT JOIN appointmentstatus s ON a.StatusCode = s.AppointmentCode
       WHERE a.DoctorID = ?
       ORDER BY a.AppointmentDate ASC
       LIMIT 50`,
      [doctorId]
    );

    const [patientSummary] = await db.query(
      `SELECT
         p.PatientID,
         p.FName AS PatientFirstName,
         p.LName AS PatientLastName,
         COALESCE(pd.RelationshipType, 'Unassigned') AS RelationshipType,
         COUNT(DISTINCT a.AppointmentID) AS AppointmentCount,
         COUNT(DISTINCT v.VisitID) AS VisitCount,
         MAX(COALESCE(v.DateTime, a.AppointmentDate)) AS LastVisitDate
       FROM appointment a
       JOIN patient p ON a.PatientID = p.PatientID
       LEFT JOIN patient_doctor pd
         ON pd.PatientID = a.PatientID
        AND pd.DoctorID = a.DoctorID
        AND (pd.EndDate IS NULL OR pd.EndDate >= CURDATE())
       LEFT JOIN visit v ON v.AppointmentID = a.AppointmentID
       WHERE a.DoctorID = ?
       GROUP BY p.PatientID, p.FName, p.LName, pd.RelationshipType
       ORDER BY LastVisitDate DESC, p.LName ASC, p.FName ASC`,
      [doctorId]
    );

    const [reviews] = await db.query(
      `SELECT
         dr.ReviewID,
         dr.AppointmentID,
         dr.PatientID,
         dr.DoctorID,
         dr.Rating,
         dr.Comment,
         dr.CreatedAt,
         dr.IsSeenByDoctor,
         p.FName AS PatientFirstName,
         p.LName AS PatientLastName,
         a.AppointmentDate
       FROM doctor_review dr
       JOIN patient p ON dr.PatientID = p.PatientID
       JOIN appointment a ON dr.AppointmentID = a.AppointmentID
       WHERE dr.DoctorID = ?
       ORDER BY dr.IsSeenByDoctor ASC, dr.CreatedAt DESC
       LIMIT 12`,
      [doctorId]
    );

    const [[reviewSummary]] = await db.query(
      `SELECT
         COUNT(*) AS ReviewCount,
         COALESCE(AVG(Rating), 0) AS AverageRating,
         SUM(CASE WHEN IsSeenByDoctor = 0 THEN 1 ELSE 0 END) AS UnreadReviewCount
       FROM doctor_review
       WHERE DoctorID = ?`,
      [doctorId]
    );

    const [[msgCount]] = await db.query(
      `SELECT COUNT(*) AS UnreadMessageCount
       FROM appointment_message m
       JOIN appointment a ON m.AppointmentID = a.AppointmentID
       WHERE a.DoctorID = ? AND m.SenderType = 'patient' AND m.IsRead = 0`,
      [doctorId]
    );

    const [specialists] = await db.query(
      `SELECT
         d.EmployeeID,
         e.FirstName,
         e.LastName,
         d.Specialty,
         dept.DepartmentName
       FROM doctor d
       JOIN employee e ON d.EmployeeID = e.EmployeeID
       LEFT JOIN department dept ON e.DepartmentID = dept.DepartmentID
       WHERE d.IsPrimaryCare = 0
         AND d.EmployeeID <> ?
       ORDER BY e.LastName, e.FirstName`,
      [doctorId]
    );

    const [referrals] = await db.query(
      `SELECT
         r.ReferralID,
         r.PatientID,
         r.PrimaryCareDoctorID,
         r.SpecialistDoctorID,
         r.ApprovalDate,
         r.ExpirationDate,
         r.Status,
         p.FName AS PatientFirstName,
         p.LName AS PatientLastName,
         specialist.FirstName AS SpecialistFirstName,
         specialist.LastName AS SpecialistLastName,
         sd.Specialty AS SpecialistSpecialty
       FROM referral r
       JOIN patient p ON r.PatientID = p.PatientID
       JOIN employee specialist ON r.SpecialistDoctorID = specialist.EmployeeID
       LEFT JOIN doctor sd ON r.SpecialistDoctorID = sd.EmployeeID
       WHERE r.PrimaryCareDoctorID = ?
       ORDER BY r.ApprovalDate DESC, r.ReferralID DESC`,
      [doctorId]
    );

    const [incomingReferrals] = await db.query(
      `SELECT
         r.ReferralID,
         r.PatientID,
         r.PrimaryCareDoctorID,
         r.SpecialistDoctorID,
         r.ApprovalDate,
         r.ExpirationDate,
         r.Status,
         p.FName AS PatientFirstName,
         p.LName AS PatientLastName,
         primaryDoctor.FirstName AS PrimaryDoctorFirstName,
         primaryDoctor.LastName AS PrimaryDoctorLastName
       FROM referral r
       JOIN patient p ON r.PatientID = p.PatientID
       JOIN employee primaryDoctor ON r.PrimaryCareDoctorID = primaryDoctor.EmployeeID
       WHERE r.SpecialistDoctorID = ?
       ORDER BY r.ApprovalDate DESC, r.ReferralID DESC`,
      [doctorId]
    );

    res.json({
      success: true,
      profile,
      upcomingAppointments: appointments,
      patientAppointmentInfo: appointments,
      patientSummary,
      reviews,
      unreadReviewCount: Number(reviewSummary?.UnreadReviewCount || 0),
      unreadMessageCount: Number(msgCount?.UnreadMessageCount || 0),
      reviewSummary: {
        reviewCount: Number(reviewSummary?.ReviewCount || 0),
        averageRating: Number(reviewSummary?.AverageRating || 0),
      },
      specialists,
      referrals,
      incomingReferrals,
    });
  } catch (err) {
    console.error(err);
    if (isDoctorFeatureSchemaMissing(err)) {
      return res.status(409).json({
        success: false,
        error: `${isReferralSchemaMissing(err) ? `${DOCTOR_FEATURE_SQL_HINT} ${REFERRAL_SQL_HINT}` : DOCTOR_FEATURE_SQL_HINT} Database detail: ${err.message}`,
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/bio', async (req, res) => {
  const staff = requireDoctor(req, res);
  if (!staff) return;

  const bio = typeof req.body.bio === 'string' ? req.body.bio.trim() : '';

  if (bio.length > MAX_BIO_LENGTH) {
    return res.status(400).json({
      success: false,
      error: `Bio must be ${MAX_BIO_LENGTH} characters or fewer.`,
    });
  }

  try {
    const [result] = await db.query('UPDATE doctor SET Bio = ? WHERE EmployeeID = ?', [
      bio || null,
      staff.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Doctor profile not found.' });
    }

    res.json({ success: true, message: 'Bio updated successfully.' });
  } catch (err) {
    console.error(err);
    if (isDoctorFeatureSchemaMissing(err)) {
      return res.status(409).json({ success: false, error: DOCTOR_FEATURE_SQL_HINT });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/profile-image', (req, res) => {
  const staff = requireDoctor(req, res);
  if (!staff) return;

  return res.status(410).json({
    success: false,
    error: 'Doctor image uploads are disabled in this environment.',
  });
});

router.patch('/appointments/:id/notes', async (req, res) => {
  const staff = requireDoctor(req, res);
  if (!staff) return;

  const appointmentId = Number(req.params.id);
  if (!appointmentId) return res.status(400).json({ success: false, error: 'Invalid appointment ID.' });

  const doctorNotes = typeof req.body.doctorNotes === 'string' ? req.body.doctorNotes.trim() : null;
  const patientSummary = typeof req.body.patientSummary === 'string' ? req.body.patientSummary.trim() : null;

  try {
    const [result] = await db.query(
      'UPDATE appointment SET DoctorNotes = ?, PatientSummary = ? WHERE AppointmentID = ? AND DoctorID = ?',
      [doctorNotes || null, patientSummary || null, appointmentId, staff.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ success: false, error: 'Appointment not found.' });
    res.json({ success: true, message: 'Notes saved.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/appointments/:id/complete', async (req, res) => {
  const staff = requireDoctor(req, res);
  if (!staff) return;

  const appointmentId = Number(req.params.id);
  if (!appointmentId) return res.status(400).json({ success: false, error: 'Invalid appointment ID.' });

  try {
    const [result] = await db.query(
      'UPDATE appointment SET StatusCode = 4 WHERE AppointmentID = ? AND DoctorID = ? AND StatusCode NOT IN (3, 4)',
      [appointmentId, staff.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Appointment not found or already completed/cancelled.' });
    }
    res.json({ success: true, message: 'Appointment marked as complete.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/referrals', async (req, res) => {
  const staff = requireDoctor(req, res);
  if (!staff) return;

  const patientId = Number(req.body.patientId);
  const specialistDoctorId = Number(req.body.specialistDoctorId);
  const expirationDate = typeof req.body.expirationDate === 'string' ? req.body.expirationDate.trim() : '';

  if (!patientId || !specialistDoctorId) {
    return res.status(400).json({
      success: false,
      error: 'Patient and specialist are required.',
    });
  }

  if (specialistDoctorId === Number(staff.id)) {
    return res.status(400).json({
      success: false,
      error: 'Choose a different doctor as the specialist.',
    });
  }

  if (expirationDate) {
    const expirationTime = new Date(`${expirationDate}T00:00:00`).getTime();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(expirationTime) || expirationTime < today.getTime()) {
      return res.status(400).json({
        success: false,
        error: 'Expiration date must be today or later.',
      });
    }
  }

  try {
    const [[patientRelationship]] = await db.query(
      `SELECT AppointmentID
       FROM appointment
       WHERE PatientID = ? AND DoctorID = ?
       LIMIT 1`,
      [patientId, staff.id]
    );

    if (!patientRelationship) {
      return res.status(403).json({
        success: false,
        error: 'You can only refer patients who have an appointment history with you.',
      });
    }

    const [[specialist]] = await db.query(
      `SELECT d.EmployeeID, e.FirstName, e.LastName
       FROM doctor d
       JOIN employee e ON d.EmployeeID = e.EmployeeID
       WHERE d.EmployeeID = ? AND d.IsPrimaryCare = 0
       LIMIT 1`,
      [specialistDoctorId]
    );

    if (!specialist) {
      return res.status(400).json({
        success: false,
        error: 'Selected doctor is not marked as a specialist.',
      });
    }

    const [[existingReferral]] = await db.query(
      `SELECT ReferralID
       FROM referral
       WHERE PatientID = ?
         AND PrimaryCareDoctorID = ?
         AND SpecialistDoctorID = ?
         AND Status = 'Approved'
         AND (ExpirationDate IS NULL OR ExpirationDate >= CURDATE())
       LIMIT 1`,
      [patientId, staff.id, specialistDoctorId]
    );

    if (existingReferral) {
      return res.status(409).json({
        success: false,
        error: 'An active referral to this specialist already exists for this patient.',
      });
    }

    const expirationSql = expirationDate || null;
    const [result] = await db.query(
      `INSERT INTO referral
        (PatientID, PrimaryCareDoctorID, SpecialistDoctorID, ApprovalDate, ExpirationDate, Status)
       VALUES (?, ?, ?, CURDATE(), COALESCE(?, DATE_ADD(CURDATE(), INTERVAL 6 MONTH)), 'Approved')`,
      [patientId, staff.id, specialistDoctorId, expirationSql]
    );

    await db.query(
      `INSERT INTO notification (PatientID, Message, Type, Link)
       VALUES (?, ?, 'referral', '/patient/booking')`,
      [
        patientId,
        `Your doctor approved a referral to Dr. ${specialist.FirstName} ${specialist.LastName}.`,
      ]
    );

    res.status(201).json({
      success: true,
      referralId: result.insertId,
      message: 'Referral approved successfully.',
    });
  } catch (err) {
    console.error(err);
    if (isReferralSchemaMissing(err)) {
      return res.status(409).json({ success: false, error: REFERRAL_SQL_HINT });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/reviews/:reviewId/seen', async (req, res) => {
  const staff = requireDoctor(req, res);
  if (!staff) return;

  const reviewId = Number(req.params.reviewId);
  if (!reviewId) {
    return res.status(400).json({ success: false, error: 'A valid review ID is required.' });
  }

  try {
    const [result] = await db.query(
      `UPDATE doctor_review
       SET IsSeenByDoctor = 1
       WHERE ReviewID = ? AND DoctorID = ?`,
      [reviewId, staff.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Review not found.' });
    }

    res.json({ success: true, message: 'Review marked as seen.' });
  } catch (err) {
    console.error(err);
    if (isDoctorFeatureSchemaMissing(err)) {
      return res.status(409).json({ success: false, error: DOCTOR_FEATURE_SQL_HINT });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET all message threads for this doctor ───────────────────────────────────
router.get('/messages', async (req, res) => {
  const staff = requireDoctor(req, res);
  if (!staff) return;

  try {
    const [threads] = await db.query(
      `SELECT
         a.AppointmentID,
         a.AppointmentDate,
         p.PatientID,
         p.FName AS PatientFirstName,
         p.LName AS PatientLastName,
         COUNT(m.MessageID) AS MessageCount,
         SUM(CASE WHEN m.SenderType = 'patient' AND m.IsRead = 0 THEN 1 ELSE 0 END) AS UnreadCount,
         MAX(m.SentAt) AS LastMessageAt,
         (SELECT m2.Body FROM appointment_message m2 WHERE m2.AppointmentID = a.AppointmentID ORDER BY m2.SentAt DESC LIMIT 1) AS LastMessageBody
       FROM appointment a
       JOIN patient p ON a.PatientID = p.PatientID
       JOIN appointment_message m ON m.AppointmentID = a.AppointmentID
       WHERE a.DoctorID = ?
       GROUP BY a.AppointmentID, a.AppointmentDate, p.PatientID, p.FName, p.LName
       ORDER BY UnreadCount DESC, LastMessageAt DESC`,
      [staff.id]
    );
    res.json({ success: true, threads });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET single thread (marks patient messages read) ───────────────────────────
router.get('/messages/:appointmentId', async (req, res) => {
  const staff = requireDoctor(req, res);
  if (!staff) return;

  const appointmentId = Number(req.params.appointmentId);
  try {
    const [[appt]] = await db.query(
      `SELECT a.AppointmentID, a.PatientID, a.AppointmentDate,
              a.ReasonForVisit, a.DoctorNotes, a.PatientSummary, a.StatusCode,
              s.AppointmentText AS StatusText,
              p.FName AS PatientFirstName, p.LName AS PatientLastName
       FROM appointment a
       JOIN patient p ON a.PatientID = p.PatientID
       LEFT JOIN appointmentstatus s ON a.StatusCode = s.AppointmentCode
       WHERE a.AppointmentID = ? AND a.DoctorID = ?`,
      [appointmentId, staff.id]
    );
    if (!appt) return res.status(403).json({ success: false, error: 'Not authorized' });

    await db.query(
      "UPDATE appointment_message SET IsRead = 1 WHERE AppointmentID = ? AND SenderType = 'patient'",
      [appointmentId]
    );

    const [messages] = await db.query(
      'SELECT * FROM appointment_message WHERE AppointmentID = ? ORDER BY SentAt ASC',
      [appointmentId]
    );
    res.json({ success: true, messages, appointment: appt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST doctor sends a reply ─────────────────────────────────────────────────
router.post('/messages/:appointmentId', async (req, res) => {
  const staff = requireDoctor(req, res);
  if (!staff) return;

  const appointmentId = Number(req.params.appointmentId);
  const body = typeof req.body.body === 'string' ? req.body.body.trim() : '';
  if (!body) return res.status(400).json({ success: false, error: 'Message cannot be empty.' });

  try {
    const [[appt]] = await db.query(
      'SELECT AppointmentID, PatientID FROM appointment WHERE AppointmentID = ? AND DoctorID = ?',
      [appointmentId, staff.id]
    );
    if (!appt) return res.status(403).json({ success: false, error: 'Not authorized' });

    await db.query(
      'INSERT INTO appointment_message (AppointmentID, SenderType, SenderID, Body) VALUES (?, ?, ?, ?)',
      [appointmentId, 'doctor', staff.id, body]
    );

    await db.query(
      `INSERT INTO notification (PatientID, Message, Type, Link)
       VALUES (?, CONCAT('You have a new message from your doctor regarding appointment #', ?), 'message', '/patient/visits')`,
      [appt.PatientID, appointmentId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
