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
});
router.get('/repgrr', async (req, res) => {
    res.render('admin/repgrr');
});
router.get('/repdar', async (req, res) => {
    res.render('admin/repdar');
});
router.get('/', async (req, res ) =>{
    const [rows] = await db.query("SELECT * FROM employee WHERE Role='Admin'")
    res.json(rows);
});
//Gets data for DAR Report
router.get('/pulldar', async (req,res) =>{
    const q = "SELECT E.EmployeeID,E.FirstName,E.LastName,D.DepartmentName,COUNT(A.AppointmentID) AS 'Appointments' FROM department AS D, appointment AS A, employee as E WHERE A.DoctorID=E.EmployeeID AND E.DepartmentID=D.DepartmentID AND A.AppointmentDate>=? AND A.Appointment<=? AND D.DepartmentName=? GROUP BY E.EmployeeID ORDER BY 'Appointments'";
    const min = req.body.min;
    const max = req.body.max;
    const DepartmentName = req.body.DepartmentName;

    const [rows] = db.query(q,min,max,DepartmentName);
    return rows;
});
//Gets data for GAR Report
router.get('/pullgar', async (req,res) =>{
    //const q = "SELECT D.DepartmentName,COUNT(A.AppointmentID) AS 'Appointments' FROM department AS D,appointment AS A,office AS O WHERE A.officeID=O.officeID AND D.OfficeID=O.OfficeID AND A.AppointmentDate >= '${req.body.min}' AND A.AppointmentDate <= '${req.body.max}' GROUP BY D.DepartmentName ORDER BY 'Appointments'";
    const q = "SELECT D.DepartmentName,COUNT(A.AppointmentID) AS 'Appointments' FROM department AS D,appointment AS A,office AS O WHERE A.officeID=O.officeID AND D.OfficeID=O.OfficeID AND A.AppointmentDate >= ? AND A.AppointmentDate <= ? GROUP BY D.DepartmentName ORDER BY 'Appointments'";
    const min = req.body.min;
    const max = req.body.max;

    //const [rows] = db.query(q);
    const [rows] = db.query(q,min,max);
    return rows;
});
//Gets data for GRR Report
router.get('/pullgrr', async (req,res) =>{
    const q = "SELECT E.EmployeeID,E.FirstName,E.LastName,D.DepartmentName,COUNT(A.AppointmentID) AS 'Appointments' FROM department AS D, appointment AS A, employee as E WHERE A.DoctorID=E.EmployeeID AND E.DepartmentID=D.DepartmentID AND A.AppointmentDate>=? AND A.Appointment<=? AND D.DepartmentName=? GROUP BY E.EmployeeID ORDER BY 'Appointments'";
    const min = req.body.min;
    const max = req.body.max;
    const DepartmentName = req.body.DepartmentName;

    const [rows] = db.query(q,min,max,DepartmentName);
    return rows;
});

router.post("/adddoc", async (req,res) =>{
    const q = "INSERT INTO doctor (`EmployeeID`,`Specialty`,`IsPrimaryCare`) VALUES (?)";
    const r = [
        req.body.EmployeeID,
        req.body.Specialty,
        req.body.IsPrimaryCare
    ];
    const query = await db.query(q,[r]);
    res.json(query);
});

router.post("/addnur", async (req,res) =>{
    const q = "INSERT INTO nurse (`EmployeeID`,`ApprovedDoctorID`) VALUES (?)";
    const r = [
        req.body.EmployeeID,
        req.body.ApprovedDoctorID
    ];
    const query = await db.query(q,[r]);
    res.json(query);
});

// Creating and Employee - POST
router.post('/addemp', async (req, res) => {
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
    const row = await db.query(q,[r]);
    res.json(row);
});

module.exports = router;
