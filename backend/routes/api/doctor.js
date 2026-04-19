const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../../db');

const router = express.Router();

const STAFF_SECRET = 'staffsecret';
const MAX_BIO_LENGTH = 800;
const DOCTOR_FEATURE_SQL_HINT = 'Run backend/sql/doctor-review-system.sql and backend/sql/doctor-profile-image.sql to enable doctor profile features.';

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
         a.OfficeID,
         a.AppointmentDate,
         a.AppointmentTime,
         a.ReasonForVisit,
         a.StatusCode,
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
       ORDER BY a.AppointmentDate ASC, a.AppointmentTime ASC
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
         a.AppointmentDate,
         a.AppointmentTime
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

    res.json({
      success: true,
      profile,
      upcomingAppointments: appointments,
      patientAppointmentInfo: appointments,
      patientSummary,
      reviews,
      unreadReviewCount: Number(reviewSummary?.UnreadReviewCount || 0),
      reviewSummary: {
        reviewCount: Number(reviewSummary?.ReviewCount || 0),
        averageRating: Number(reviewSummary?.AverageRating || 0),
      },
    });
  } catch (err) {
    console.error(err);
    if (isDoctorFeatureSchemaMissing(err)) {
      return res.status(409).json({ success: false, error: DOCTOR_FEATURE_SQL_HINT });
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

module.exports = router;
