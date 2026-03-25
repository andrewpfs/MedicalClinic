const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    res.render('home/home.ejs',
        {
            name: "Andrew"
        }
    )
});


router.get('/register', async (req, res) => {
    res.render('home/register')
});

module.exports = router;    
