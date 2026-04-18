const express = require('express');
const router = express.Router();
const db = require('../../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const STAFF_SECRET = 'staffsecret';
const CONFIRMED_STATUS_CODE = 5;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const getStaff = (req) => {
  try {
    const token = req.cookies.staffToken;
    if (!token) return null;
    return jwt.verify(token, STAFF_SECRET);
  } catch {
    return null;
  }
};

const staffCookieOptions = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: IS_PRODUCTION ? 'none' : 'lax',
};

async function loadReceptionistWorkspace(staffId) {
  const [patients] = await db.query(`
    SELECT PatientID, FName AS FirstName, LName AS LastName
    FROM patient ORDER BY LName, FName
  `);

  const [doctors] = await db.query(`
    SELECT d.EmployeeID, e.FirstName, e.LastName, d.Specialty
    FROM doctor d JOIN employee e ON d.EmployeeID = e.EmployeeID
    ORDER BY e.LastName, e.FirstName
  `);

  const [paymentMethods] = await db.query(`
    SELECT PaymentCode, PaymentText FROM paymentmethod ORDER BY PaymentCode
  `);

  const [appointments] = await db.query(`
    SELECT a.AppointmentID, a.PatientID, a.DoctorID, a.OfficeID,
      a.AppointmentDate, a.AppointmentTime, a.ReasonForVisit, a.StatusCode, a.CreatedVia,
      p.FName AS PatientFirstName, p.LName AS PatientLastName,
      e.FirstName AS DoctorFirstName, e.LastName AS DoctorLastName,
      e.Role AS DoctorRole, d.Specialty, s.AppointmentText AS StatusText
    FROM appointment a
    JOIN patient p ON a.PatientID = p.PatientID
    JOIN employee e ON a.DoctorID = e.EmployeeID
    LEFT JOIN doctor d ON a.DoctorID = d.EmployeeID
    LEFT JOIN appointmentstatus s ON a.StatusCode = s.AppointmentCode
    ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC LIMIT 25
  `);

  const [transactions] = await db.query(`
    SELECT t.TransactionID, t.AppointmentID, t.PatientID,
      p.FName AS PatientFirstName, p.LName AS PatientLastName,
      t.PaymentCode, pm.PaymentText, t.Amount, t.TransactionDateTime, t.Status,
      t.DueDate, t.LateFeeAmount
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
    WHERE es.EmployeeID = ?
    ORDER BY es.ShiftDate DESC, es.StartTime DESC LIMIT 25
  `, [staffId]);

  return { patients, doctors, paymentMethods, appointments, transactions, availability };
}

// Staff Login
router.post('/login', async (req, res) => {
  const { employeeId, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT EmployeeID, FirstName, LastName, Role, Password FROM employee WHERE EmployeeID = ?',
      [employeeId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Employee not found.' });

    const storedPassword = rows[0].Password || '';
    const looksHashed = storedPassword.startsWith('$2');
    const passwordMatches = looksHashed
      ? await bcrypt.compare(password, storedPassword)
      : storedPassword === password;

    if (!passwordMatches) return res.status(400).json({ error: 'Wrong password.' });

    const token = jwt.sign(
      { id: rows[0].EmployeeID, role: rows[0].Role, name: rows[0].FirstName },
      STAFF_SECRET,
      { expiresIn: '24h' }
    );

    res.cookie('staffToken', token, staffCookieOptions)
      .json({ success: true, role: rows[0].Role, name: rows[0].FirstName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Staff Session
router.get('/session', (req, res) => {
  const staff = getStaff(req);
  if (!staff) return res.json({ isLoggedIn: false });
  res.json({ isLoggedIn: true, id: staff.id, role: staff.role, name: staff.name });
});

// Staff Logout
router.get('/logout', (req, res) => {
  res.clearCookie('staffToken', staffCookieOptions).json({ success: true });
});

// Broad employee workspace
router.get('/', async (req, res) => {
  const staff = getStaff(req);
  if (!staff) return res.status(401).json({ success: false, error: 'Not logged in' });
  if (staff.role === 'Receptionist') {
    return res.status(403).json({
      success: false,
      error: 'Receptionists must use the receptionist workspace endpoint.',
    });
  }

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
        a.AppointmentDate, a.AppointmentTime, a.ReasonForVisit, a.StatusCode, a.CreatedVia,
        p.FName AS PatientFirstName, p.LName AS PatientLastName,
        e.FirstName AS DoctorFirstName, e.LastName AS DoctorLastName,
        e.Role AS DoctorRole, d.Specialty, s.AppointmentText AS StatusText
      FROM appointment a
      JOIN patient p ON a.PatientID = p.PatientID
      JOIN employee e ON a.DoctorID = e.EmployeeID
      LEFT JOIN doctor d ON a.DoctorID = d.EmployeeID
      LEFT JOIN appointmentstatus s ON a.StatusCode = s.AppointmentCode
      ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC LIMIT 25
    `);

    const [transactions] = await db.query(`
      SELECT t.TransactionID, t.AppointmentID, t.PatientID,
        p.FName AS PatientFirstName, p.LName AS PatientLastName,
        t.PaymentCode, pm.PaymentText, t.Amount, t.TransactionDateTime, t.Status,
        t.DueDate, t.LateFeeAmount
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

// Receptionist workspace
router.get('/receptionist', async (req, res) => {
  const staff = getStaff(req);
  if (!staff) return res.status(401).json({ success: false, error: 'Not logged in' });
  if (staff.role !== 'Receptionist') {
    return res.status(403).json({ success: false, error: 'Receptionist access only.' });
  }

  try {
    const payload = await loadReceptionistWorkspace(staff.id);
    res.json({ success: true, ...payload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/appointments/:appointmentId/confirm', async (req, res) => {
  const staff = getStaff(req);
  if (!staff) return res.status(401).json({ success: false, error: 'Not logged in' });
  if (staff.role === 'Doctor') {
    return res.status(403).json({ success: false, error: 'Doctors cannot confirm appointments.' });
  }

  try {
    const appointmentId = Number(req.params.appointmentId);
    if (!appointmentId) {
      return res.status(400).json({ success: false, error: 'A valid appointment ID is required.' });
    }

    const [[confirmedStatus]] = await db.query(
      'SELECT AppointmentCode FROM appointmentstatus WHERE AppointmentCode = ? OR LOWER(AppointmentText) = ? LIMIT 1',
      [CONFIRMED_STATUS_CODE, 'confirmed']
    );

    if (!confirmedStatus) {
      return res.status(409).json({
        success: false,
        error: 'Confirmed status is missing from appointmentstatus. Run backend/sql/appointment-status-confirmed.sql first.',
      });
    }

    const [[appointment]] = await db.query(
      `SELECT a.AppointmentID, a.StatusCode, s.AppointmentText AS StatusText
       FROM appointment a
       LEFT JOIN appointmentstatus s ON a.StatusCode = s.AppointmentCode
       WHERE a.AppointmentID = ?`,
      [appointmentId]
    );

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    if (appointment.StatusCode === confirmedStatus.AppointmentCode) {
      return res.json({ success: true, message: 'Appointment is already confirmed.' });
    }

    if (appointment.StatusCode === 3 || appointment.StatusCode === 4) {
      return res.status(400).json({
        success: false,
        error: `Appointments marked ${appointment.StatusText || 'with this status'} cannot be confirmed.`,
      });
    }

    await db.query(
      'UPDATE appointment SET StatusCode = ? WHERE AppointmentID = ?',
      [confirmedStatus.AppointmentCode, appointmentId]
    );

    res.json({ success: true, message: 'Appointment confirmed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Nurse dashboard data
router.get('/nurse', async (req, res) => {
  const staff = getStaff(req);
  if (!staff) return res.status(401).json({ success: false, error: 'Not logged in' });
  const nurseId = staff.id;

  try {
    const [[nurseRow]] = await db.query(
      'SELECT n.AssignedDoctorID, e.FirstName AS DoctorFirst, e.LastName AS DoctorLast FROM nurse n JOIN employee e ON n.AssignedDoctorID = e.EmployeeID WHERE n.EmployeeID = ?',
      [nurseId]
    );

    const assignedDoctorId = nurseRow ? nurseRow.AssignedDoctorID : null;

    const apptQuery = assignedDoctorId
      ? `SELECT a.AppointmentID, a.PatientID, a.DoctorID, a.OfficeID,
           a.AppointmentDate, a.AppointmentTime, a.ReasonForVisit, a.StatusCode,
           p.FName AS PatientFirstName, p.LName AS PatientLastName,
           e.FirstName AS DoctorFirstName, e.LastName AS DoctorLastName,
           s.AppointmentText AS StatusText
         FROM appointment a
         JOIN patient p ON a.PatientID = p.PatientID
         JOIN employee e ON a.DoctorID = e.EmployeeID
         LEFT JOIN appointmentstatus s ON a.StatusCode = s.AppointmentCode
         WHERE a.DoctorID = ?
         ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC LIMIT 25`
      : `SELECT a.AppointmentID, a.PatientID, a.DoctorID, a.OfficeID,
           a.AppointmentDate, a.AppointmentTime, a.ReasonForVisit, a.StatusCode,
           p.FName AS PatientFirstName, p.LName AS PatientLastName,
           e.FirstName AS DoctorFirstName, e.LastName AS DoctorLastName,
           s.AppointmentText AS StatusText
         FROM appointment a
         JOIN patient p ON a.PatientID = p.PatientID
         JOIN employee e ON a.DoctorID = e.EmployeeID
         LEFT JOIN appointmentstatus s ON a.StatusCode = s.AppointmentCode
         ORDER BY a.AppointmentDate DESC, a.AppointmentTime DESC LIMIT 25`;

    const [appointments] = assignedDoctorId
      ? await db.query(apptQuery, [assignedDoctorId])
      : await db.query(apptQuery);

    const [patients] = await db.query('SELECT PatientID, FName AS FirstName, LName AS LastName FROM patient ORDER BY LName, FName');
    const [doctors] = await db.query('SELECT d.EmployeeID, e.FirstName, e.LastName, d.Specialty FROM doctor d JOIN employee e ON d.EmployeeID = e.EmployeeID ORDER BY e.LastName, e.FirstName');
    const [paymentMethods] = await db.query('SELECT PaymentCode, PaymentText FROM paymentmethod ORDER BY PaymentCode');
    const [availability] = await db.query(
      'SELECT es.ShiftID, es.EmployeeID, e.FirstName, e.LastName, e.Role, es.OfficeID, es.ShiftDate, es.StartTime, es.EndTime FROM employee_shift es JOIN employee e ON es.EmployeeID = e.EmployeeID WHERE es.EmployeeID = ? ORDER BY es.ShiftDate DESC LIMIT 25',
      [nurseId]
    );

    res.json({
      success: true,
      assignedDoctor: nurseRow || null,
      appointments,
      patients,
      doctors,
      paymentMethods,
      availability,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/book', async (req, res) => {
  const staff = getStaff(req);
  if (!staff) return res.status(401).json({ success: false, error: 'Not logged in' });

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
    `, [patientId, doctorId, officeId, sqlDate, sqlTime, reasonForVisit || null, 1, 1]);

    res.json({ success: true, message: 'Appointment booked successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/payment', async (req, res) => {
  const staff = getStaff(req);
  if (!staff) return res.status(401).json({ success: false, error: 'Not logged in' });

  try {
    const { appointmentId, patientId, paymentCode, amount, status, dueDate } = req.body;
    if (!appointmentId || !patientId || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required payment fields' });
    }

    await db.query(`
      INSERT INTO transaction (AppointmentID, PatientID, PaymentCode, Amount, TransactionDateTime, Status, DueDate)
      VALUES (?, ?, ?, ?, NOW(), ?, ?)
    `, [appointmentId, patientId, paymentCode || null, amount, status || 'Posted', dueDate || null]);

    res.json({ success: true, message: 'Payment recorded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/availability', async (req, res) => {
  const staff = getStaff(req);
  if (!staff) return res.status(401).json({ success: false, error: 'Not logged in' });

  try {
    const { officeId, shiftDate, startTime, endTime } = req.body;
    const requestedEmployeeId = req.body.employeeId || staff.id;

    if (!requestedEmployeeId || !officeId || !shiftDate || !startTime || !endTime) {
      return res.status(400).json({ success: false, error: 'Missing required availability fields' });
    }

    if (staff.role !== 'Admin' && Number(requestedEmployeeId) !== Number(staff.id)) {
      return res.status(403).json({ success: false, error: 'You are not allowed to create shifts for another employee.' });
    }

    await db.query(`
      INSERT INTO employee_shift (EmployeeID, OfficeID, ShiftDate, StartTime, EndTime)
      VALUES (?, ?, ?, ?, ?)
    `, [requestedEmployeeId, officeId, shiftDate, startTime, endTime]);

    res.json({ success: true, message: 'Availability saved successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/availability/:shiftId', async (req, res) => {
  const staff = getStaff(req);
  if (!staff) return res.status(401).json({ success: false, error: 'Not logged in' });

  try {
    const shiftId = Number(req.params.shiftId);
    if (!shiftId) {
      return res.status(400).json({ success: false, error: 'A valid shift ID is required.' });
    }

    const [[shift]] = await db.query(
      'SELECT ShiftID, EmployeeID, ShiftDate, StartTime, EndTime FROM employee_shift WHERE ShiftID = ? LIMIT 1',
      [shiftId]
    );

    if (!shift) {
      return res.status(404).json({ success: false, error: 'Shift not found.' });
    }

    const canManageShift = staff.role === 'Admin' || Number(shift.EmployeeID) === Number(staff.id);
    if (!canManageShift) {
      return res.status(403).json({ success: false, error: 'You are not allowed to remove this shift.' });
    }

    await db.query('DELETE FROM employee_shift WHERE ShiftID = ?', [shiftId]);

    res.json({
      success: true,
      message: `Shift on ${shift.ShiftDate} from ${shift.StartTime} to ${shift.EndTime} removed.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
