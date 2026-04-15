const express = require('express');
const router = express.Router();
const db = require('../db'); 
const { register, login, logout } = require('../auth');
const jwt = require('jsonwebtoken');

// ── JWT middleware ────────────────────────────────────────────────────────────
const getPatientId = (req) => {
    try {
        const token = req.cookies.accessToken;
        if (!token) return null;
        const data = jwt.verify(token, 'secretkey');
        return data.id;
    } catch {
        return null;
    }
};

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post('/login', login);
router.post('/register', register);
router.get('/logout', logout);

// ── API: profile data for React ───────────────────────────────────────────────
router.get('/api/profile', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const [rows] = await db.query('SELECT * FROM patient WHERE PatientID = ?', [patientId]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: 'Error loading profile' }); }
});

router.post('/update-profile', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    const { fName, mName, lName, dob, phone, address, genderCode, raceCode, ethnicityCode, hasInsurance } = req.body;
    try {
        await db.query(
            `UPDATE patient SET
                FName = ?, MName = ?, LName = ?, Dob = ?,
                PhoneNumber = ?, Address = ?,
                GenderCode = ?, RaceCode = ?, EthnicityCode = ?, HasInsurance = ?
             WHERE PatientID = ?`,
            [fName, mName || null, lName, dob || null, phone, address,
             genderCode || null, raceCode || null, ethnicityCode || null,
             hasInsurance ? 1 : 0, patientId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Update failed.' });
    }
});

// ── API: doctors list for React booking page ──────────────────────────────────
router.get('/api/doctors', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const [doctors] = await db.query("SELECT EmployeeID, FirstName, LastName FROM employee WHERE Role = 'Doctor'");
        res.json(doctors);
    } catch (err) { res.status(500).json({ error: 'Database Error' }); }
});

router.post('/book', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    const { doctorId, date, reason } = req.body;
    const formattedDate = date.replace('T', ' ') + ':00';
    try {
        const [conflict] = await db.query(
            `SELECT AppointmentID FROM appointment
             WHERE DoctorID = ? AND AppointmentDate = ? AND StatusCode != 3`,
            [doctorId, formattedDate]
        );
        if (conflict.length > 0) {
            return res.status(409).json({ error: 'This doctor already has an appointment at that date and time. Please choose a different time.' });
        }
        await db.query(
            'INSERT INTO appointment (PatientID, DoctorID, AppointmentDate, StatusCode, OfficeID, ReasonForVisit) VALUES (?, ?, ?, ?, ?, ?)',
            [patientId, doctorId, formattedDate, 1, 1, reason || null]
        );
        res.json({ success: true });
    } catch (err) { 
        console.error("SQL ERROR:", err.message);
        res.status(500).json({ error: err.message }); 
    }
});

// ── API: booked slots ─────────────────────────────────────────────────────────
router.get('/api/booked-slots', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    const { doctorId, start, end } = req.query;
    try {
        const [rows] = await db.query(
            `SELECT AppointmentDate,
                CASE WHEN DoctorID = ? THEN 'doctor' ELSE 'patient' END as conflictType
             FROM appointment
             WHERE (DoctorID = ? OR PatientID = ?)
             AND AppointmentDate BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
             AND StatusCode != 3`,
            [doctorId, doctorId, patientId, start, end]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load booked slots' });
    }
});

// ── API: visits for React ─────────────────────────────────────────────────────
router.get('/api/visits', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const [rows] = await db.query(
            `SELECT a.AppointmentID, a.AppointmentDate, e.FirstName, e.LastName, s.AppointmentText AS Status 
             FROM appointment a
             JOIN appointmentstatus s ON a.StatusCode = s.AppointmentCode
             JOIN employee e ON a.DoctorID = e.EmployeeID
             WHERE a.PatientID = ? 
             ORDER BY a.AppointmentDate DESC`, 
            [patientId]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: 'Error fetching visits' }); }
});

// ── API: cancel appointment ───────────────────────────────────────────────────
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
        await db.query("UPDATE transaction SET Status = 'Void' WHERE AppointmentID = ? AND Status = 'Pending'", [appointmentId]);
        await db.query(
            `INSERT INTO notification (PatientID, Message, Type, Link) VALUES (?, CONCAT('Your appointment on ', DATE_FORMAT(?, '%M %d, %Y'), ' has been cancelled.'), 'appointment', '/patient/visits')`,
            [patientId, rows[0].AppointmentDate]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to cancel appointment' });
    }
});

// ── API: reschedule appointment ───────────────────────────────────────────────
router.post('/reschedule-appointment', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    const { appointmentId, newDate } = req.body;
    const formattedDate = newDate.replace('T', ' ') + ':00';
    try {
        const [rows] = await db.query(
            'SELECT * FROM appointment WHERE AppointmentID = ? AND PatientID = ?',
            [appointmentId, patientId]
        );
        if (rows.length === 0) return res.status(403).json({ error: 'Not authorized' });
        const [conflict] = await db.query(
            `SELECT AppointmentID FROM appointment WHERE DoctorID = ? AND AppointmentDate = ? AND StatusCode != 3 AND AppointmentID != ?`,
            [rows[0].DoctorID, formattedDate, appointmentId]
        );
        if (conflict.length > 0) return res.status(409).json({ error: 'That time slot is already booked.' });
        await db.query('UPDATE appointment SET AppointmentDate = ? WHERE AppointmentID = ?', [formattedDate, appointmentId]);
        await db.query(
            `INSERT INTO notification (PatientID, Message, Type, Link) VALUES (?, CONCAT('Your appointment has been rescheduled to ', DATE_FORMAT(?, '%M %d, %Y at %h:%i %p'), '.'), 'appointment', '/patient/visits')`,
            [patientId, formattedDate]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to reschedule appointment' });
    }
});

// ── API: payments for React ───────────────────────────────────────────────────
router.get('/api/payments', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const [invoices] = await db.query(
            `SELECT DISTINCT t.TransactionID, t.Amount, a.AppointmentDate, e.LastName as DoctorName
             FROM transaction t
             JOIN appointment a ON t.AppointmentID = a.AppointmentID
             JOIN employee e ON a.DoctorID = e.EmployeeID
             WHERE t.PatientID = ? 
             AND t.Status = 'Pending' 
             AND a.StatusCode = 1`,
            [patientId]
        );
        res.json(invoices);
    } catch (err) { res.status(500).json({ error: 'Error loading invoices' }); }
});

router.post('/pay', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    const { transactionId } = req.body;
    try {
        await db.query("UPDATE transaction SET Status = 'Posted' WHERE TransactionID = ?", [transactionId]);
        await db.query(
            `UPDATE appointment SET StatusCode = 2 
             WHERE AppointmentID = (SELECT AppointmentID FROM transaction WHERE TransactionID = ?)`,
            [transactionId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Payment failed.' });
    }
});

// ── API: payment history ──────────────────────────────────────────────────────
router.get('/api/payment-history', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const [rows] = await db.query(
            `SELECT DISTINCT t.TransactionID, t.Amount, a.AppointmentDate, e.LastName as DoctorName
             FROM transaction t
             JOIN appointment a ON t.AppointmentID = a.AppointmentID
             JOIN employee e ON a.DoctorID = e.EmployeeID
             WHERE t.PatientID = ?
             AND t.Status = 'Posted'
             ORDER BY a.AppointmentDate DESC`,
            [patientId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error loading payment history' });
    }
});

// ── API: get payment methods ──────────────────────────────────────────────────
router.get('/api/payment-methods', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const [rows] = await db.query(
            'SELECT * FROM payment_method WHERE PatientID = ? ORDER BY IsDefault DESC',
            [patientId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error loading payment methods' });
    }
});

// ── API: add payment method ───────────────────────────────────────────────────
router.post('/api/payment-methods', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    const { cardType, lastFour, isDefault } = req.body;
    try {
        if (isDefault) {
            await db.query('UPDATE payment_method SET IsDefault = 0 WHERE PatientID = ?', [patientId]);
        }
        await db.query(
            'INSERT INTO payment_method (PatientID, CardType, LastFour, IsDefault) VALUES (?, ?, ?, ?)',
            [patientId, cardType, lastFour, isDefault ? 1 : 0]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error adding payment method' });
    }
});

// ── API: delete payment method ────────────────────────────────────────────────
router.delete('/api/payment-methods/:id', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        await db.query(
            'DELETE FROM payment_method WHERE PaymentMethodID = ? AND PatientID = ?',
            [req.params.id, patientId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error removing payment method' });
    }
});

// ── API: get notifications ────────────────────────────────────────────────────
router.get('/api/notifications', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const [rows] = await db.query(
            `SELECT * FROM notification WHERE PatientID = ? ORDER BY CreatedAt DESC LIMIT 20`,
            [patientId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error loading notifications' });
    }
});

// ── API: mark one notification as read ────────────────────────────────────────
router.patch('/api/notifications/:id/read', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        await db.query(
            'UPDATE notification SET IsRead = 1 WHERE NotificationID = ? AND PatientID = ?',
            [req.params.id, patientId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error marking notification as read' });
    }
});

// ── API: mark all notifications as read ───────────────────────────────────────
router.patch('/api/notifications/read-all', async (req, res) => {
    const patientId = getPatientId(req);
    if (!patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        await db.query(
            'UPDATE notification SET IsRead = 1 WHERE PatientID = ?',
            [patientId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error marking all as read' });
    }
});

module.exports = router;
