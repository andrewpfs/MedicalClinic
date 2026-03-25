const express = require('express');
const router = express.Router();
const db = require('../db');
const {register} = require('../auth')


router.get('/', async (req, res) => {
    const [rows] = await db.query("select * from patient")
    res.json(rows)
});

router.post('/register', register);

// Booking - POST

router.post('/book', async (req, res) => {

});

module.exports = router;
