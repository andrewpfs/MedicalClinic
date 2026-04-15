const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken')



router.get('/', async (req, res) => {

    const token = req.cookies.accessToken
    let isLoggedIn = false
    let firstName = ""
    if(token){
        try{
            const data = jwt.verify(token, "secretkey")
            const [rows] = await db.query(`Select FName from patient where PatientID = ${data.id}`)
            isLoggedIn = true
            firstName = rows[0].FName
            console.log(rows)
        }
        catch(err){
            isLoggedIn = false;
        }
    }
    res.set('Cache-Control', 'no-store')
    res.render('home/home.ejs',{ firstName, isLoggedIn}
    )
});


router.get('/register', async (req, res) => {
    res.render('home/register')
});

router.get('/login', async (req, res) => {
    res.render('home/login')
});

module.exports = router;    
