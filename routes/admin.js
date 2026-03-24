const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/profile', async (req, res) => {
    res.render('admin/profile');
});
router.get('/home', async (req, res) => {
    res.render('admin/home');
});
router.get('/adde', async (req, res) => {
    res.render('admin/adde');
});

router.get('/', async (req, res ) =>{
    const [rows] = await db.query("SELECT * FROM employee WHERE Role='Admin'")
    res.json(rows);
})

// Creating and Employee - POST
router.post('/addemp', (req, res) => {
    const q = "INSERT INTO employee (`FirstName`,`LastName`,`Birthdate`,`GenderCode`,`RaceCode`,`EthnicityCode`,`Role`,`Address`,`PhoneNumber`,`Email`,`Password`,`DepartmentID`) VALUES (?)"
    //const q = "INSERT INTO employee (`FirstName`,`DepartmentID`) VALUES (?)";
    const r = [
        req.body.FirstName,
        req.body.LastName,
        req.body.Birthdate,
        req.body.GenderCode,
        req.body.RaceCode,
        req.body.EthnicityCode,
        req.body.Role,
        req.body.Address,
        req.body.PhoneNumber,
        req.body.Email,
        req.body.Password,
        req.body.DepartmentID,
    ];
    const row = db.query(q,[r]);
    res.json(row);
});

module.exports = router;
