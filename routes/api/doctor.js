const express = require('express');
const router = express.Router();
const db = require('../../backend/db');
const jwt = require('jsonwebtoken');

const STAFF_SECRET = 'staffsecret';

const getStaff = (req) => {
  try {
    const token = req.cookies.staffToken;
    if (!token) return null;
    return jwt.verify(token, STAFF_SECRET);
  } catch {
    return null;
  }
};

router.get('/', async (req, res) => {
  const staff = getStaff(req);
  if (!staff) return res.status(401).json({ success: false, error: 'Not logged in' });
  const doctorId = staff.id;

  try {
    const [appointments] = await db.query(`
      SELECT
        a.AppointmentID,
        a.PatientID,
        a.DoctorID,
        a.OfficeID,
        a.AppointmentDate,
        a.AppointmentTime,
        p.FName AS PatientFirstName,
        p.LName AS PatientLastName,
        e.FirstName AS DoctorFirstName,
        e.LastName AS DoctorLastName,
        CASE
          WHEN s.AppointmentText = 'Paid' THEN 'Booked'
          ELSE s.AppointmentText
        END AS StatusText
      FROM appointment a
      JOIN patient p ON a.PatientID = p.PatientID
      JOIN employee e ON a.DoctorID = e.EmployeeID
      LEFT JOIN appointmentstatus s ON a.StatusCode = s.AppointmentCode
      WHERE a.DoctorID = ?
      ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC
      LIMIT 25
    `, [doctorId]);

    const [visitLogs] = await db.query(`
      SELECT
        v.VisitID,
        v.AppointmentID,
        v.Symptoms,
        v.Notes,
        v.DateTime,
        a.PatientID,
        a.DoctorID,
        p.FName AS PatientFirstName,
        p.LName AS PatientLastName,
        e.FirstName AS DoctorFirstName,
        e.LastName AS DoctorLastName
      FROM visit v
      JOIN appointment a ON v.AppointmentID = a.AppointmentID
      JOIN patient p ON a.PatientID = p.PatientID
      JOIN employee e ON a.DoctorID = e.EmployeeID
      WHERE a.DoctorID = ?
      ORDER BY v.DateTime DESC, v.VisitID DESC
      LIMIT 25
    `, [doctorId]);

    const [appointmentOptions] = await db.query(`
      SELECT
        a.AppointmentID,
        a.AppointmentDate,
        a.AppointmentTime,
        p.FName AS PatientFirstName,
        p.LName AS PatientLastName,
        e.FirstName AS DoctorFirstName,
        e.LastName AS DoctorLastName
      FROM appointment a
      JOIN patient p ON a.PatientID = p.PatientID
      JOIN employee e ON a.DoctorID = e.EmployeeID
      WHERE a.DoctorID = ?
      ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC
      LIMIT 50
    `, [doctorId]);

    res.json({
      success: true,
      upcomingAppointments,
      patientAppointmentInfo: appointments,
      visitLogs,
      appointmentOptions
    });
  } catch (err) {
    console.error('Doctor API error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.post('/visit', async (req, res) => {
  try {
    const { appointmentId, symptoms, notes, dateTime } = req.body;

    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        error: 'Appointment ID is required'
      });
    }

    await db.query(`
      INSERT INTO visit
      (AppointmentID, Symptoms, Notes, DateTime)
      VALUES (?, ?, ?, ?)
    `, [
      appointmentId,
      symptoms || null,
      notes || null,
      dateTime || new Date()
    ]);

    await db.query(
      'UPDATE appointment SET StatusCode = 4 WHERE AppointmentID = ?',
      [appointmentId]
    );

    res.json({
      success: true,
      message: 'Visit entry added and appointment marked as completed'
    });
  } catch (err) {
    console.error('Visit insert error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;