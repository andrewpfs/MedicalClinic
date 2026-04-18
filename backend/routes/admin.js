const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const getStaff = (req) => {
    try {
        const token = req.cookies.staffToken;
        if (!token) return null;
        return jwt.verify(token, 'staffsecret');
    } catch { return null; }
};

const requireAdmin = (req, res, next) => {
    const staff = getStaff(req);
    if (!staff || staff.role !== 'Admin') return res.status(401).json({ error: 'Not authorized' });
    next();
};

router.get('/api/profile', async (req,res) => {
    const id = 4; //CHANGE WHEN MERGE WORKS

    const q = `
        SELECT 
            E.EmployeeID AS id,
            E.FirstName AS First, 
            E.LastName AS Last, 
            E.Birthdate AS Birth, 
            E.Role, 
            E.Address, 
            E.PhoneNumber AS Phone,
            E.Email,
            E.Password AS Pass,
            G.GenderText AS Gender, 
            R.RaceText AS Race, 
            ET.EthnicityText AS Ethnic, 
            D.DepartmentName AS Depart,

        FROM employee E
        LEFT JOIN gender G ON E.GenderCode = G.GenderCode
        LEFT JOIN race R ON E.RaceCode = R.RaceCode
        LEFT JOIN ethnicity ET ON E.EthnicityCode = ET.EthnicityCode
        LEFT JOIN department D ON E.DepartmentID = D.DepartmentID
        WHERE E.EmployeeID = ?`;

    try {
        const [rows] = await db.query(q, id);
        res.json(rows[0]);
    } catch (err) { res.status(500).json({ error: 'Error loading profile' }); }
})

router.post('/api/updateprofile', async (req,res) => {
    const q = 'UPDATE employee SET FirstName=?,LastName=?,Address=?,PhoneNumber=?,Email=? WHERE EmployeeID=?';
    const r = [
        req.body.FirstName,
        req.body.LastName,
        req.body.Address,
        req.body.PhoneNumber,
        req.body.Email,
        req.body.id,
    ];
    try {
        await db.query(q,[pass,id]);
    }catch(err){
        res.status(500).json({error: 'Error updating profile'})
    }
})

router.post('/api/updatepassword', async (req,res) => {
    const q = 'UPDATE employee SET Password=? WHERE EmployeeID=?';
    const pass = await bcrypt.hash(req.body.Password, 10);
    const id = req.body.id;
    try {
        await db.query(q,[pass,id]);
    }catch(err){
        res.status(500).json({error: 'Error updating profile'})
    }
})

router.post('/api/addnurse', async (req,res) => {
    const q = "INSERT INTO nurse (EmployeeID, AssignedDoctorID) VALUES (?,?)";
    const r = [req.body.EmployeeID, req.body.AssignedDoctorID];
    try {
        await db.query(q,r)
        res.status(200).json({message: "Nurse Created"})
    }catch(err){
        res.status(500).json({error: 'Error inserting nurse'})
    }
})

router.post('/api/adddoctor', async (req,res) => {
    const q = "INSERT INTO doctor (EmployeeID,Specialty,isPrimaryCare)VALUES (?,?,?)";

    const r = [req.body.EmployeeID,req.body.Specialty,req.body.IsPrimaryCare];

    try {
        await db.query(q,r)

        res.status(200).json({message: "Doctor Created"})
    }catch(err){
        res.status(500).json({error: 'Error creating doctor'})
    }
})

router.post('/api/addemployee', async (req,res) => {
    const q = "INSERT INTO employee (`FirstName`,`LastName`,`Birthdate`,`GenderCode`,`RaceCode`,`EthnicityCode`,`Role`,`Address`,`PhoneNumber`,`Email`,`Password`,`DepartmentID`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
    const hashedPassword = await bcrypt.hash(req.body.Password, 10);

    const r = [
        req.body.FirstName,
        req.body.LastName,
        req.body.BirthDate || null,
        req.body.GenderCode || null,
        req.body.RaceCode || null,
        req.body.EthnicityCode || null,
        req.body.Role,
        req.body.Address || null,
        req.body.PhoneNumber || null,
        req.body.Email,
        hashedPassword,
        req.body.DepartmentID || null,
    ];

    try {
        const [result] = await db.query(q,r)
        res.status(200).json({ message: 'Employee Created', employeeId: result.insertId })
    }catch(err){
        res.status(500).json({error: 'Error creating employee'})
    }
})

router.get('/api/getdoctors', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.EmployeeID, e.FirstName, e.LastName, d.Specialty
            FROM doctor d JOIN employee e ON d.EmployeeID = e.EmployeeID
            ORDER BY e.LastName, e.FirstName
        `);
        res.json(rows);
    } catch(err) {
        res.status(500).json({ error: 'Error fetching doctors' });
    }
})

router.get('/api/getID', async (req,res) => {
    const q = 'SELECT EmployeeID FROM employee WHERE FirstName=? AND LastName=? AND Email=?';
    const r = [req.body.FirstName,req.body.LastName,req.body.Email]

    try {
        const [rows] = await db.query(q,r)

        return rows[0].EmployeeID
    }catch(err){
        res.status(500).json({error: 'Error creating employee'})
    }
})

router.get('/api/pulldar', requireAdmin, async (req,res) => {
    const { min, max, DepartmentName } = req.query;
    const start = min || '2000-01-01';
    const end   = max || '2099-12-31';
    let q = `SELECT E.EmployeeID, E.FirstName, E.LastName, D.DepartmentName,
                    COUNT(A.AppointmentID) AS Appointments
             FROM department AS D
             JOIN employee AS E ON E.DepartmentID = D.DepartmentID
             JOIN appointment AS A ON A.DoctorID = E.EmployeeID
             WHERE A.AppointmentDate >= ? AND A.AppointmentDate <= ?`;
    const params = [start, end];
    if (DepartmentName) { q += ' AND D.DepartmentName = ?'; params.push(DepartmentName); }
    q += ' GROUP BY E.EmployeeID ORDER BY Appointments DESC';
    try {
        const [rows] = await db.query(q, params);
        return res.json({ results: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Report Error");
    }
})

router.get('/api/pullgar', requireAdmin, async (req,res) => {
    const q = "SELECT D.DepartmentName,O.OfficeName,COUNT(A.AppointmentID) AS 'Appointments' FROM department AS D,appointment AS A,employee AS E,office AS O WHERE A.DoctorID=E.EmployeeID AND D.DepartmentID=E.DepartmentID AND D.OfficeID=O.OfficeID AND A.AppointmentDate >= ? AND A.AppointmentDate <= ? GROUP BY D.DepartmentID ORDER BY Appointments DESC";
    const {min, max} = req.query;

    try {
        const [rows] = await db.query(q,[min,max]);
        return res.json(rows)
    } catch (err) {
        console.error(err);
        res.status(500).send("Report Error");
    }
})

router.get('/api/pullgrr', requireAdmin, async (req,res) => {
    const q = "SELECT D.DepartmentName,O.OfficeName,SUM(T.Amount) AS 'Revenue' FROM department AS D,appointment AS A,employee AS E,transaction as T,office AS O WHERE A.DoctorID=E.EmployeeID AND D.DepartmentID=E.DepartmentID AND D.OfficeID=O.OfficeID AND T.AppointmentID=A.AppointmentID AND A.AppointmentDate >= ? AND A.AppointmentDate <= ? GROUP BY D.DepartmentID ORDER BY Revenue DESC";
    const {min, max} = req.query;

    try {
        const [rows] = await db.query(q,[min,max]);
        return res.json(rows)
    } catch (err) {
        console.error(err);
        res.status(500).send("Report Error");
    }
})

router.get('/api/pullrevenue', requireAdmin, async (req,res) => {
    const q = `
    SELECT T.TransactionID AS "Id", P.FName AS "PatFirst", P.LName AS "PatLast", E.FirstName AS "DocFirst", E.LastName AS "DocLast",D.DepartmentName,T.Amount,T.TransactionDateTime AS "Date",E.EmployeeID AS "DocID",T.Status,P.hasInsurance AS "Insurance" 
    FROM transaction AS T, patient AS P,appointment AS A, employee AS E, department AS D
    WHERE T.AppointmentID=A.AppointmentID AND T.PatientID=P.PatientID AND E.EmployeeID=A.DoctorID AND E.DepartmentID=D.DepartmentID`;

    try {
        const [rows] = await db.query(q)
        res.json(rows)
    }catch(err) {
        res.status(500).json({error: 'Error pulling revenue'})
    }
})

router.get('/api/pullreviews', requireAdmin, async (req,res) => {
    const q = `
    SELECT DR.ReviewID AS "Id", P.FName AS "PatFirst", P.LName AS "PatLast", E.FirstName AS "DocFirst", E.LastName AS "DocLast",D.DepartmentName,DR.Rating,DR.CreatedAt AS "Date",E.EmployeeID AS "DocID"
    FROM doctor_review AS DR, patient AS P,appointment AS A, employee AS E, department AS D
    WHERE DR.AppointmentID=A.AppointmentID AND DR.PatientID=P.PatientID AND E.EmployeeID=A.DoctorID AND E.DepartmentID=D.DepartmentID`;

    try {
        const [rows] = await db.query(q)
        res.json(rows)
    }catch(err) {
        res.status(500).json({error: 'Error pulling reviews'})
    }
})

router.get('/api/pullinvoice', requireAdmin, async (req,res) => {
    const q = `
    SELECT T.TransactionID AS "Id", P.FName AS "PatFirst", P.LName AS "PatLast", D.DepartmentName, T.Amount, T.TransactionDateTime AS "Date",T.LateFeeAmount AS Late, P.PatientID as PatID
    FROM transaction AS T, patient AS P,appointment AS A, employee AS E, department AS D
    WHERE T.AppointmentID=A.AppointmentID AND T.PatientID=P.PatientID AND E.EmployeeID=A.DoctorID AND E.DepartmentID=D.DepartmentID AND T.Status="Pending"`;

    try {
        const [rows] = await db.query(q)
        res.json(rows)
    }catch(err) {
        res.status(500).json({error: 'Error pulling invoice'})
    }
})

router.get('/api/getEmployees', async (req,res) => {
    const q = 'SELECT EmployeeID,FirstName,LastName,Role,Email,Address,PhoneNumber FROM employee';
    
    try {
        const [rows] = await db.query(q)

        return res.json(rows)
    }catch(err) {
        res.status(500).json({error: "Error getting Employees"})
    }
    
})

router.post('/api/updateEmployee', async (req,res) => {
    const q = 'UPDATE employee SET FirstName=?,LastName=?,Address=?,PhoneNumber=?,Email=? WHERE EmployeeID=?';
    const r = [
                req.body.FirstName,
                req.body.LastName,
                req.body.Address,
                req.body.PhoneNumber,
                req.body.Email,
                req.body.EmployeeID
            ]
    try {
        const [rows] = await db.query(q,r)

        return res.json(rows)
    }catch(err) {
        res.status(500).json({error: "Error updating Employee"})
    }
    
})

router.get('/api/getdepartments', async (req,res) => {
    const q = 'SELECT DepartmentID,DepartmentName,OfficeID FROM department';

    try {
        const [rows] = await db.query(q)
        return res.json(rows)
    }catch(err){
        console.error(err)
    }
})

router.get('/api/getoffices', async (req,res) => {
    const q = 'SELECT OfficeID,OfficeName FROM office';

    try {
        const [rows] = await db.query(q)
        return res.json(rows)
    }catch(err){
        console.error(err)
    }
})

router.post('/api/adddepartment', async (req,res) => {
    const q = 'INSERT INTO department (DepartmentName,OfficeID) VALUES (?,?)'

    const {DepartmentName,OfficeID} = req.body

    try {
        const rows = await db.query(q,[DepartmentName,OfficeID])
        return res.json(rows) 
    }catch(err){
        res.status(500).json({error: 'Error creating department'})
    }
})

router.get('/api/getdeptdoctors', async (req,res) => {
    const q = `
    SELECT E.EmployeeID, E.FirstName, E.LastName, D.DepartmentName
    FROM employee AS E, department AS D, doctor AS DO
    WHERE E.EmployeeID=DO.EmployeeID AND D.DepartmentID=E.DepartmentID`

    try {
        const [rows] = await db.query(q)
        return res.json(rows)
    }catch(err){
        console.error(err)
    }
})

router.get('/api/getdepartmentinfo', async (req,res) => {
    const q = `
    SELECT D.DepartmentID, D.DepartmentName, O.OfficeName, O.Street, O.City, O.State, O.ZipCode, O.PhoneNumber, COUNT(E.EmployeeID) AS Employees
    FROM department AS D 
    JOIN office AS O ON D.OfficeID=O.OfficeID 
    LEFT JOIN employee AS E ON E.DepartmentID=D.DepartmentID
    GROUP BY D.DepartmentID
    ORDER BY Employees DESC`

    try {
        const [rows] = await db.query(q)
        return res.json(rows)
    }catch(err){
        console.error(err)
    }
})

router.get('/api/getpatients', async (req,res) => {
    const q = `
    SELECT P.PatientID,P.FName,P.LName
    FROM patient AS P 
    JOIN transaction as T ON P.PatientID=T.PatientID
    GROUP BY P.PatientID`

    try {
        const [rows] = await db.query(q)
        return res.json(rows)
    }catch(err){
        console.error(err)
    }
})


module.exports = router;
