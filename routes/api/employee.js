const express = require('express');
const router = express.Router();
const db = require('../../db');
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

// ── Staff Login ───────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { employeeId, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT EmployeeID, FirstName, LastName, Role, Password FROM employee WHERE EmployeeID = ?',
      [employeeId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found.' });
    if (rows[0].Password !== password) return res.status(400).json({ error: 'Wrong password.' });

    const token = jwt.sign(
      { id: rows[0].EmployeeID, role: rows[0].Role, name: rows[0].FirstName },
      STAFF_SECRET,
      { expiresIn: '24h' }
    );
    res.cookie('staffToken', token, { httpOnly: true })
       .json({ success: true, role: rows[0].Role, name: rows[0].FirstName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Staff Session ─────────────────────────────────────────────────────────────
router.get('/session', (req, res) => {
  const staff = getStaff(req);
  if (!staff) return res.json({ isLoggedIn: false });
  res.json({ isLoggedIn: true, role: staff.role, name: staff.name });
});

// ── Staff Logout ──────────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  res.clearCookie('staffToken').json({ success: true });
});

// ── Get all data ──────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  if (!getStaff(req)) return res.status(401).json({ success: false, error: 'Not logged in' });
  try {
    const [patients] = await db.query(`
      SELECT PatientID, FName AS FirstName, LName AS LastName
      FROM patient ORDER BY LName, FName
    `);

    const [doctors] = await db.query(`
      SELECT d.EmployeeID, e.FirstName, e.LastName, d.Specialty
      FROM doctor d JOIN employee e ON d.EmployeeID = e.EmployeeID
      ORDER BY e.LastName, e.FirstName
    `);

    const [employees] = await db.query(`
      SELECT EmployeeID, FirstName, LastName, Role
      FROM employee ORDER BY LastName, FirstName
    `);

    const [paymentMethods] = await db.query(`
      SELECT PaymentCode, PaymentText FROM paymentmethod ORDER BY PaymentCode
    `);

    const [appointments] = await db.query(`
      SELECT a.AppointmentID, a.PatientID, a.DoctorID, a.OfficeID,
        a.AppointmentDate, a.AppointmentTime, a.ReasonForVisit, a.StatusCode,
        p.FName AS PatientFirstName, p.LName AS PatientLastName,
        e.FirstName AS DoctorFirstName, e.LastName AS DoctorLastName,
        s.AppointmentText AS StatusText
      FROM appointment a
      JOIN patient p ON a.PatientID = p.PatientID
      JOIN employee e ON a.DoctorID = e.EmployeeID
      LEFT JOIN appointmentstatus s ON a.StatusCode = s.AppointmentCode
      ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC LIMIT 25
    `);

    const [transactions] = await db.query(`
      SELECT t.TransactionID, t.AppointmentID, t.PatientID,
        p.FName AS PatientFirstName, p.LName AS PatientLastName,
        t.PaymentCode, pm.PaymentText, t.Amount, t.TransactionDateTime, t.Status
      FROM transaction t
      JOIN patient p ON t.PatientID = p.PatientID
      LEFT JOIN paymentmethod pm ON t.PaymentCode = pm.PaymentCode
      ORDER BY t.TransactionID DESC LIMIT 25
    `);

    const [availability] = await db.query(`
      SELECT es.ShiftID, es.EmployeeID, e.FirstName, e.LastName, e.Role,
        es.OfficeID, es.ShiftDate, es.StartTime, es.EndTime
      FROM employee_shift es
      JOIN employee e ON es.EmployeeID = e.EmployeeID
      ORDER BY es.ShiftDate DESC, es.StartTime DESC LIMIT 25
    `);

    res.json({ success: true, patients, doctors, employees, paymentMethods, appointments, transactions, availability });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/book', async (req, res) => {
  if (!getStaff(req)) return res.status(401).json({ success: false, error: 'Not logged in' });
  try {
    const { patientId, doctorId, appointmentDate, officeId, reasonForVisit } = req.body;
    if (!patientId || !doctorId || !appointmentDate || !officeId) {
      return res.status(400).json({ success: false, error: 'Missing required appointment fields' });
    }
    const dt = new Date(appointmentDate);
    if (Number.isNaN(dt.getTime())) {
      return res.status(400).json({ success: false, error: 'Invalid appointment date and time' });
    }
    const sqlDate = dt.toISOString().split('T')[0];
    const sqlTime = dt.toTimeString().split(' ')[0];
    await db.query(`
      INSERT INTO appointment (PatientID, DoctorID, OfficeID, AppointmentDate, AppointmentTime, ReasonForVisit, StatusCode, CreatedVia)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [patientId, doctorId, officeId, sqlDate, sqlTime, reasonForVisit || null, 1, 0]);
    res.json({ success: true, message: 'Appointment booked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/payment', async (req, res) => {
  if (!getStaff(req)) return res.status(401).json({ success: false, error: 'Not logged in' });
  try {
    const { appointmentId, patientId, paymentCode, amount, status } = req.body;
    if (!appointmentId || !patientId || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required payment fields' });
    }
    await db.query(`
      INSERT INTO transaction (AppointmentID, PatientID, PaymentCode, Amount, TransactionDateTime, Status)
      VALUES (?, ?, ?, ?, NOW(), ?)
    `, [appointmentId, patientId, paymentCode || null, amount, status || 'Posted']);
    res.json({ success: true, message: 'Payment recorded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/availability', async (req, res) => {
  if (!getStaff(req)) return res.status(401).json({ success: false, error: 'Not logged in' });
  try {
    const { employeeId, officeId, shiftDate, startTime, endTime } = req.body;
    if (!employeeId || !officeId || !shiftDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, error: 'Missing required availability fields' });
    }
    await db.query(`
      INSERT INTO employee_shift (EmployeeID, OfficeID, ShiftDate, StartTime, EndTime)
      VALUES (?, ?, ?, ?, ?)
    `, [employeeId, officeId, shiftDate, startTime, endTime]);
    res.json({ success: true, message: 'Availability saved successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
