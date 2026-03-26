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

router.get('/booking', (req, res) => {
    if (!req.session.patientId) return res.redirect('/patient/login');
    res.render('patient/booking');
});

router.post('/book', async (req, res) => {
    const { doctorId, date } = req.body;
    try {
        await db.query(
            'INSERT INTO appointment (PatientID, DoctorID, AppointmentDate, StatusCode, OfficeID) VALUES (?, ?, ?, ?, ?)', 
            [req.session.patientId, doctorId, date, 1, 1] 
        );
        res.redirect('/patient/visits');
    } catch (err) { res.status(500).send("Booking failed."); }
});

router.get('/visits', async (req, res) => {
    if (!req.session.patientId) return res.redirect('/patient/login');
    try {
        const [rows] = await db.query(
            `SELECT a.AppointmentID, a.AppointmentDate, a.DoctorID, s.AppointmentText AS Status 
             FROM appointment a
             JOIN appointmentstatus s ON a.StatusCode = s.AppointmentCode
             WHERE a.PatientID = ? 
             ORDER BY a.AppointmentDate DESC`, 
            [req.session.patientId]
        );
        res.render('patient/visits', { visits: rows });
    } catch (err) { res.status(500).send("Error fetching visits report."); }
});

router.get('/payments', (req, res) => {
    if (!req.session.patientId) return res.redirect('/patient/login');
    res.render('patient/payments');
});

router.post('/pay', async (req, res) => {
    const { appointmentId, amount } = req.body;
    try {
        await db.query(
            'INSERT INTO transaction (AppointmentID, PatientID, Amount) VALUES (?, ?, ?)', 
            [appointmentId, req.session.patientId, amount]
        );
        res.redirect('/patient/visits');
    } catch (err) { res.status(500).send("Payment failed."); }
});

router.get('/logout', logout);

module.exports = router;