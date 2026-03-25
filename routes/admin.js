const express = require('express');
const router = express.Router();
const db = require('../db');

const id = 1;
router.get('/profile', async (req, res) => {
    /*const fir = db.query("SELECT FirstName FROM employee WHERE employeeID="+id);
    const las = db.query("SELECT LastName FROM employee WHERE employeeID="+id);
    const bd = db.query("SELECT Birthdate FROM employee WHERE employeeID="+id);
    const gen = db.query("SELECT GenderText FROM employee,gender WHERE employeeID="+id+" AND employee.GenderCode=gender.GenderCode");
    const rac = db.query("SELECT RaceText FROM employee,race WHERE employeeID="+id+" AND employee.RaceCode=race.RaceCode");
    const eth = db.query("SELECT EthnicityText FROM employee,ethnicity WHERE employeeID="+id+" AND employee.EthnicityCode=ethnicity.EthnicityCode");
    const addr = db.query("SELECT FirstName FROM employee WHERE employeeID="+id);
    const pho = db.query("SELECT FirstName FROM employee WHERE employeeID="+id);
    const dep = db.query("SELECT DepartmentName FROM employee,department WHERE employeeID="+id+" AND employee.DepartmentID=department.DepartmentID");
    const rol = db.query("SELECT FirstName FROM employee WHERE employeeID="+id);*/
    res.render('admin/profile');//,{{First = fir},{Last = las},{Birth = bd},{Gender = gen},{Race = rac},{Ethnic = eth},{Address = addr},{Phone = pho},{Depart = dep},{Role = rol}});
});
router.get('/home', async (req, res) => {
    res.render('admin/home');
});
router.get('/adde', async (req, res) => {
    res.render('admin/adde');
});
router.get('/repgar', async (req, res) => {
    res.render('admin/repgar');
})
router.get('/repgrr', async (req, res) => {
    res.render('admin/repgrr');
})
router.get('/repdar', async (req, res) => {
    res.render('admin/repdar');
})
router.get('/', async (req, res ) =>{
    const [rows] = await db.query("SELECT * FROM employee WHERE Role='Admin'")
    res.json(rows);
})
/*
router.get('/pull', async (req,res) {
    const q = "SELECT ? FROM employee WHERE EmployeeID="+id;
    const r = [
        req.body.
    ];

    const 
})*/

//router post adddoc

//router post addnur

// Creating and Employee - POST
router.post('/addemp', async (req, res) => {
    const q = "INSERT INTO employee (`FirstName`,`LastName`,`Birthdate`,`GenderCode`,`RaceCode`,`EthnicityCode`,`Role`,`Address`,`PhoneNumber`,`Email`,`Password`,`DepartmentID`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)"
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
    const row = await db.query(q,[r]);
    res.json(row);
});

module.exports = router;
