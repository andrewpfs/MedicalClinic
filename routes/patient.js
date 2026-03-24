const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/profile', async (req, res) => {
    res.render('patient/profile');
});

router.get('/', async (req, res ) =>{
    const [rows] = await db.query("select * from patient")
    res.json(rows);
})

// Booking - POST
router.post('/book', async (req, res) => {
});

module.exports = router;
