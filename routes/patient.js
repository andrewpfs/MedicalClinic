const express = require('express');
const router = express.Router();
const db = require('../db'); 
const { register, login, logout } = require('../auth');

router.get('/login', (req, res) => {
    res.render('patient/login'); 
});

router.post('/login', login);

// ── API: profile data for React ──────────────────────────────────────────────
router.get('/api/profile', async (req, res) => {
    if (!req.session.patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const [rows] = await db.query('SELECT * FROM patient WHERE PatientID = ?', [req.session.patientId]);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: 'Error loading profile' }); }
});

router.get('/profile', async (req, res) => {
    if (!req.session.patientId) return res.redirect('/patient/login');
    try {
        const [rows] = await db.query('SELECT * FROM patient WHERE PatientID = ?', [req.session.patientId]);
        res.render('patient/profile', { 
            patient: rows[0], 
            message: req.query.updated ? "Profile updated successfully!" : null 
        });
    } catch (err) { res.status(500).send("Error loading profile"); }
});

router.post('/update-profile', async (req, res) => {
    const { phone, email } = req.body;
    const patientId = req.session.patientId;
    try {
        await db.query(
            'UPDATE patient SET PhoneNumber = ?, Email = ? WHERE PatientID = ?',
            [phone, email, patientId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Update failed.' });
    }
});

router.post('/update-profile', async (req, res) => {
    const { phone, email } = req.body;
    const patientId = req.session.patientId;
    try {
        await db.query(
            'UPDATE patient SET PhoneNumber = ?, Email = ? WHERE PatientID = ?',
            [phone, email, patientId]
        );
        req.headers.accept?.includes('application/json')
            ? res.json({ success: true })
            : res.redirect('/patient/profile?updated=true');
    } catch (err) {
        console.error(err);
        res.status(500).send("Update failed. Check database column lengths.");
    }
});

// ── API: doctors list for React booking page ─────────────────────────────────
router.get('/api/doctors', async (req, res) => {
    if (!req.session.patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const [doctors] = await db.query("SELECT EmployeeID, FirstName, LastName FROM employee WHERE Role = 'Doctor'");
        res.json(doctors);
    } catch (err) { res.status(500).json({ error: 'Database Error' }); }
});

router.get('/booking', async (req, res) => {
    try {
        const [doctors] = await db.query("SELECT EmployeeID, FirstName, LastName FROM employee WHERE Role = 'Doctor'");
        res.render('patient/booking', { doctors: doctors }); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
});

router.post('/book', async (req, res) => {
    if (!req.session.patientId) return res.status(401).json({ error: 'Not logged in' });
    const { doctorId, date } = req.body;
    // Store exactly what the user selected, no conversion
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
            'INSERT INTO appointment (PatientID, DoctorID, AppointmentDate, StatusCode, OfficeID) VALUES (?, ?, ?, ?, ?)', 
            [req.session.patientId, doctorId, formattedDate, 1, 1] 
        );
        res.json({ success: true });
    } catch (err) { 
        console.error("SQL ERROR:", err.message);
        if (err.message.includes('already has an appointment')) {
            return res.status(409).json({ error: 'This doctor already has an appointment at that date and time. Please choose a different time.' });
        }
        if (err.message.includes('You already have')) {
            return res.status(409).json({ error: 'You already have an appointment scheduled at that date and time.' });
        }
        res.status(500).json({ error: err.message }); 
    }
});

// ── API: visits for React ─────────────────────────────────────────────────────
router.get('/api/visits', async (req, res) => {
    if (!req.session.patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const [rows] = await db.query(
            `SELECT a.AppointmentID, a.AppointmentDate, e.FirstName, e.LastName, s.AppointmentText AS Status 
             FROM appointment a
             JOIN appointmentstatus s ON a.StatusCode = s.AppointmentCode
             JOIN employee e ON a.DoctorID = e.EmployeeID
             WHERE a.PatientID = ? 
             ORDER BY a.AppointmentDate DESC`, 
            [req.session.patientId]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: 'Error fetching visits' }); }
});

router.get('/visits', async (req, res) => {
    if (!req.session.patientId) return res.redirect('/patient/login');
    try {
        const [rows] = await db.query(
            `SELECT a.AppointmentID, a.AppointmentDate, e.FirstName, e.LastName, s.AppointmentText AS Status 
             FROM appointment a
             JOIN appointmentstatus s ON a.StatusCode = s.AppointmentCode
             JOIN employee e ON a.DoctorID = e.EmployeeID
             WHERE a.PatientID = ? 
             ORDER BY a.AppointmentDate DESC`, 
            [req.session.patientId]
        );
        res.render('patient/visits', { visits: rows });
    } catch (err) { 
        console.error(err);
        res.status(500).send("Error fetching visits report."); 
    }
});

// ── API: payments for React ───────────────────────────────────────────────────
router.get('/api/payments', async (req, res) => {
    if (!req.session.patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const [invoices] = await db.query(
            `SELECT DISTINCT t.TransactionID, t.Amount, a.AppointmentDate, e.LastName as DoctorName
             FROM transaction t
             JOIN appointment a ON t.AppointmentID = a.AppointmentID
             JOIN employee e ON a.DoctorID = e.EmployeeID
             WHERE t.PatientID = ? 
             AND t.Status = 'Pending' 
             AND a.StatusCode = 1`,
            [req.session.patientId]
        );
        res.json(invoices);
    } catch (err) { res.status(500).json({ error: 'Error loading invoices' }); }
});

router.get('/payments', async (req, res) => {
    if (!req.session.patientId) return res.redirect('/patient/login');
    try {
        const [invoices] = await db.query(
            `SELECT DISTINCT t.TransactionID, t.Amount, a.AppointmentDate, e.LastName as DoctorName
             FROM transaction t
             JOIN appointment a ON t.AppointmentID = a.AppointmentID
             JOIN employee e ON a.DoctorID = e.EmployeeID
             WHERE t.PatientID = ? 
             AND t.Status = 'Pending' 
             AND a.StatusCode = 1`,
            [req.session.patientId]
        );
        res.render('patient/payments', { invoices: invoices }); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading invoices.");
    }
});

router.post('/pay', async (req, res) => {
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

router.get('/api/booked-slots', async (req, res) => {
    if (!req.session.patientId) return res.status(401).json({ error: 'Not logged in' });
    const { doctorId, start, end } = req.query;
    try {
        const [rows] = await db.query(
            `SELECT AppointmentDate,
                CASE WHEN DoctorID = ? THEN 'doctor' ELSE 'patient' END as conflictType
             FROM appointment
             WHERE (DoctorID = ? OR PatientID = ?)
             AND AppointmentDate BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
             AND StatusCode != 3`,
            [doctorId, doctorId, req.session.patientId, start, end]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to load booked slots' });
    }
});

// ── API: payment history (posted transactions) ────────────────────────────────
// Add these routes to routes/patient.js

router.get('/api/payment-history', async (req, res) => {
    if (!req.session.patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const [rows] = await db.query(
            `SELECT DISTINCT t.TransactionID, t.Amount, a.AppointmentDate, e.LastName as DoctorName
             FROM transaction t
             JOIN appointment a ON t.AppointmentID = a.AppointmentID
             JOIN employee e ON a.DoctorID = e.EmployeeID
             WHERE t.PatientID = ?
             AND t.Status = 'Posted'
             ORDER BY a.AppointmentDate DESC`,
            [req.session.patientId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error loading payment history' });
    }
});

// ── API: get payment methods ──────────────────────────────────────────────────
router.get('/api/payment-methods', async (req, res) => {
    if (!req.session.patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const [rows] = await db.query(
            'SELECT * FROM payment_method WHERE PatientID = ? ORDER BY IsDefault DESC',
            [req.session.patientId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error loading payment methods' });
    }
});

// ── API: add payment method ───────────────────────────────────────────────────
router.post('/api/payment-methods', async (req, res) => {
    if (!req.session.patientId) return res.status(401).json({ error: 'Not logged in' });
    const { cardType, lastFour, isDefault } = req.body;
    try {
        if (isDefault) {
            await db.query('UPDATE payment_method SET IsDefault = 0 WHERE PatientID = ?', [req.session.patientId]);
        }
        await db.query(
            'INSERT INTO payment_method (PatientID, CardType, LastFour, IsDefault) VALUES (?, ?, ?, ?)',
            [req.session.patientId, cardType, lastFour, isDefault ? 1 : 0]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error adding payment method' });
    }
});

// ── API: delete payment method ────────────────────────────────────────────────
router.delete('/api/payment-methods/:id', async (req, res) => {
    if (!req.session.patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        await db.query(
            'DELETE FROM payment_method WHERE PaymentMethodID = ? AND PatientID = ?',
            [req.params.id, req.session.patientId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error removing payment method' });
    }
});

// ── API: get notifications ────────────────────────────────────────────────────
router.get('/api/notifications', async (req, res) => {
    if (!req.session.patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        const [rows] = await db.query(
            `SELECT * FROM notification WHERE PatientID = ? ORDER BY CreatedAt DESC LIMIT 20`,
            [req.session.patientId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Error loading notifications' });
    }
});

// ── API: mark one notification as read ────────────────────────────────────────
router.patch('/api/notifications/:id/read', async (req, res) => {
    if (!req.session.patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        await db.query(
            'UPDATE notification SET IsRead = 1 WHERE NotificationID = ? AND PatientID = ?',
            [req.params.id, req.session.patientId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error marking notification as read' });
    }
});

// ── API: mark all notifications as read ───────────────────────────────────────
router.patch('/api/notifications/read-all', async (req, res) => {
    if (!req.session.patientId) return res.status(401).json({ error: 'Not logged in' });
    try {
        await db.query(
            'UPDATE notification SET IsRead = 1 WHERE PatientID = ?',
            [req.session.patientId]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Error marking all as read' });
    }
});

router.get('/logout', logout);

module.exports = router;
