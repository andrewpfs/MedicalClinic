const express = require('express');
const router = express.Router();
const db = require('../../db');

router.get('/', async (req, res) => {
  try {
    const [appointments] = await db.query(`
      SELECT
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
      ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC
      LIMIT 25
    `);

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
      ORDER BY v.DateTime DESC, v.VisitID DESC
      LIMIT 25
    `);

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
      ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      upcomingAppointments: appointments,
      patientAppointmentInfo: appointments,
      visitLogs,
      appointmentOptions
    });
  } catch (err) {
    console.error(err);
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

    res.json({
      success: true,
      message: 'Visit entry added successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;