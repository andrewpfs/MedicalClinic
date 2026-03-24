const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/profile', async (req, res) => {
    res.render('patient/profile');
});

// Booking - POST
router.post('/book', async (req, res) => {
});

module.exports = router;
