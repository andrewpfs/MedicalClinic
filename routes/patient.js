const express = require('express');
const router = express.Router();
const db = require('../db'); 
const { register, login, logout } = require('../auth');

router.get('/login', (req, res) => {
    res.render('patient/login'); 
});

router.post('/login', login);

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

router.get('/update-profile', async (req, res) => {
    if (!req.session.patientId) return res.redirect('/patient/login');
    try {
        const [rows] = await db.query('SELECT * FROM patient WHERE PatientID = ?', [req.session.patientId]);
        res.render('patient/update-profile', { patient: rows[0] });
    } catch (err) { res.status(500).send("Error loading update page."); }
});

router.post('/update-profile', async (req, res) => {
    const { phone, email } = req.body;
    const patientId = req.session.patientId;

    try {
        await db.query(
            'UPDATE patient SET PhoneNumber = ?, Email = ? WHERE PatientID = ?',
            [phone, email, patientId]
        );
        res.redirect('/patient/profile?updated=true');
    } catch (err) {
        console.error(err);
        res.status(500).send("Update failed. Check database column lengths.");
    }
});

router.get('/booking', async (req, res) => {
    try {
        const [doctors] = await db.query("SELECT EmployeeID, FirstName, LastName FROM employee WHERE Role = 'Doctor'");
        
        // This MUST match the filename 'booking'
        res.render('patient/booking', { doctors: doctors }); 
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
});

router.post('/book', async (req, res) => {
    if (!req.session.patientId) return res.redirect('/patient/login');
    const { doctorId, date } = req.body;
    const formattedDate = date.replace('T', ' ');

    try {
        await db.query(
            'INSERT INTO appointment (PatientID, DoctorID, AppointmentDate, StatusCode, OfficeID) VALUES (?, ?, ?, ?, ?)', 
            [req.session.patientId, doctorId, formattedDate, 1, 1] 
        );
        res.redirect('/patient/visits');
    } catch (err) { 
        console.error("SQL ERROR:", err.message);
        res.status(500).send(`Booking failed: ${err.message}`); 
    }
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
             AND a.StatusCode = 1`, // Only show invoices for 'Scheduled' visits
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
        // 1. Update the Transaction to 'Posted'
        await db.query("UPDATE transaction SET Status = 'Posted' WHERE TransactionID = ?", [transactionId]);

        // 2. Update the linked Appointment to 'Paid' (StatusCode 2)
        await db.query(
            `UPDATE appointment 
             SET StatusCode = 2 
             WHERE AppointmentID = (SELECT AppointmentID FROM transaction WHERE TransactionID = ?)`,
            [transactionId]
        );

        res.redirect('/patient/visits?paid=true');
    } catch (err) {
        console.error(err);
        res.status(500).send("Payment failed.");
    }
});

router.get('/logout', logout);

module.exports = router;