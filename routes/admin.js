const express = require('express');
const router = express.Router();
const db = require('../db');

const id = 1;
router.get('/profile', async (req, res) => {
    const id = 1; // Keeping his hardcoded ID for now
    
    // One big query to join all the relevant tables
    const q = `
        SELECT 
            E.FirstName AS First, 
            E.LastName AS Last, 
            E.Birthdate AS Birth, 
            E.Role, 
            E.Address, 
            E.PhoneNumber AS Phone,
            G.GenderText AS Gender, 
            R.RaceText AS Race, 
            ET.EthnicityText AS Ethnic, 
            D.DepartmentName AS Depart
        FROM employee E
        LEFT JOIN gender G ON E.GenderCode = G.GenderCode
        LEFT JOIN race R ON E.RaceCode = R.RaceCode
        LEFT JOIN ethnicity ET ON E.EthnicityCode = ET.EthnicityCode
        LEFT JOIN department D ON E.DepartmentID = D.DepartmentID
        WHERE E.EmployeeID = ?`;

    try {
        const [rows] = await db.query(q, [id]);
        
        if (rows.length > 0) {
            // We pass the FIRST row of data to the EJS template
            res.render('admin/profile', rows[0]); 
        } else {
            res.status(404).send("Employee not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error loading profile");
    }
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
router.get('/repdar', async (req, res) => { //
    res.render('admin/repdar');
});
router.get('/', async (req, res ) =>{
    const [rows] = await db.query("SELECT * FROM employee WHERE Role='Admin'")
    res.json(rows);
});
//Gets data for DAR Report
router.post('/pulldar', async (req, res) => {
 
    const q = `
        SELECT E.EmployeeID, E.FirstName, E.LastName, D.DepartmentName, COUNT(A.AppointmentID) AS Appointments FROM department AS D, appointment AS A, employee as E WHERE A.DoctorID = E.EmployeeID AND E.DepartmentID = D.DepartmentID AND A.AppointmentDate >= ? AND A.AppointmentDate <= ? AND D.DepartmentName = ? GROUP BY E.EmployeeID ORDER BY Appointments DESC`;
 
    const { min, max, DepartmentName } = req.body;
 
    try {
 
        const [rows] = await db.query(q, [min, max, DepartmentName]);
 
 
        res.render('admin/repdar', { results: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Report Error");
    }
});
//Gets data for GAR Report
router.post('/pullgar', async (req,res) =>{
    const q = "SELECT D.DepartmentName,COUNT(A.AppointmentID) AS 'Appointments' FROM department AS D,appointment AS A,office AS O WHERE A.officeID=O.officeID AND D.OfficeID=O.OfficeID AND A.AppointmentDate >= ? AND A.AppointmentDate <= ? GROUP BY D.DepartmentName ORDER BY Appointments DESC";
    const {min, max} = req.body;

    try {

        const [rows] = await db.query(q,[min,max]);
        res.render('admin/repdar', {results: rows});
    } catch (err) {
        console.error(err);
        res.status(500).send("Report Error");
    }
});
//Gets data for GRR Report
router.post('/pullgrr', async (req,res) =>{

    const q = `
        SELECT D.DepartmentName,O.OfficeName,SUM(T.Amount) AS 'Revenue' FROM department AS D,appointment AS A,office AS O,transaction as T WHERE A.officeID=O.officeID AND D.OfficeID=O.OfficeID AND T.AppointmentID=A.AppointmentID AND A.AppointmentDate >= ? AND A.AppointmentDate <= ? GROUP BY D.DepartmentID ORDER BY Revenue DESC`;
 
    const { min, max} = req.body;
 
    try {
 
        const [rows] = await db.query(q, [min, max]);
 
 
        res.render('admin/repgrr', { results: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Report Error");
    }
});

router.post("/adddoc", async (req,res) =>{
    const q = "INSERT INTO doctor (`EmployeeID`,`Specialty`,`IsPrimaryCare`) VALUES (?)";
    const r = [
        req.body.EmployeeID,
        req.body.Specialty,
        req.body.IsPrimaryCare
    ];
    const query = await db.query(q,[r]);
    //res.json(query);
});

router.post("/addnur", async (req,res) =>{
    const q = "INSERT INTO nurse (`EmployeeID`,`ApprovedDoctorID`) VALUES (?)";
    const r = [
        req.body.EmployeeID,
        req.body.ApprovedDoctorID
    ];
    const query = await db.query(q,[r]);
    //res.json(query);
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
    //res.json(row);
});

module.exports = router;
