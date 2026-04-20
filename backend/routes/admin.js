const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const DEFAULT_EMPLOYEE_PASSWORD = 'admin123';

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

router.post('/api/updatepassword', requireAdmin, async (req,res) => {
    const q = 'UPDATE employee SET Password=? WHERE EmployeeID=?';
    const pass = await bcrypt.hash(req.body.Password, 10);
    const id = req.body.id;
    try {
        await db.query(q,[pass,id]);
    }catch(err){
        res.status(500).json({error: 'Error updating profile'})
    }
})

router.post('/api/addnurse', requireAdmin, async (req,res) => {
    const q = "INSERT INTO nurse (EmployeeID, AssignedDoctorID) VALUES (?,?)";
    const r = [req.body.EmployeeID, req.body.AssignedDoctorID];
    try {
        await db.query(q,r)
        res.status(200).json({message: "Nurse Created"})
    }catch(err){
        res.status(500).json({error: 'Error inserting nurse'})
    }
})

router.post('/api/adddoctor', requireAdmin, async (req,res) => {
    const q = "INSERT INTO doctor (EmployeeID,Specialty,isPrimaryCare)VALUES (?,?,?)";

    const r = [req.body.EmployeeID,req.body.Specialty,req.body.IsPrimaryCare];

    try {
        await db.query(q,r)

        res.status(200).json({message: "Doctor Created"})
    }catch(err){
        res.status(500).json({error: 'Error creating doctor'})
    }
})

router.post('/api/addemployee', requireAdmin, async (req,res) => {
    if (!req.body.Password) return res.status(400).json({ error: 'Password is required' });
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

router.get('/api/getdoctors', requireAdmin, async (req, res) => {
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
    const q = "SELECT D.DepartmentName,COUNT(A.AppointmentID) AS 'Appointments' FROM department AS D,appointment AS A,employee AS E WHERE A.DoctorID=E.EmployeeID AND D.DepartmentID=E.DepartmentID AND A.AppointmentDate >= ? AND A.AppointmentDate <= ? GROUP BY D.DepartmentID ORDER BY Appointments DESC";
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
    const q = "SELECT D.DepartmentName,SUM(T.Amount) AS 'Revenue' FROM department AS D,appointment AS A,employee AS E,transaction as T WHERE A.DoctorID=E.EmployeeID AND D.DepartmentID=E.DepartmentID AND T.AppointmentID=A.AppointmentID AND T.Status='Posted' AND A.AppointmentDate >= ? AND A.AppointmentDate <= ? GROUP BY D.DepartmentID ORDER BY Revenue DESC";
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
    SELECT T.TransactionID AS "Id", P.FName AS "PatFirst", P.LName AS "PatLast", E.FirstName AS "DocFirst", E.LastName AS "DocLast",D.DepartmentName,D.DepartmentID,T.Amount,DATE_FORMAT(T.TransactionDateTime, '%Y-%m-%d') AS "Date",E.EmployeeID AS "DocID",T.Status,P.hasInsurance AS "Insurance"
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
    SELECT DR.ReviewID AS "Id", P.FName AS "PatFirst", P.LName AS "PatLast", E.FirstName AS "DocFirst", E.LastName AS "DocLast",D.DepartmentName,D.DepartmentID,DR.Rating,DATE_FORMAT(DR.CreatedAt, '%Y-%m-%d') AS "Date",E.EmployeeID AS "DocID"
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
    SELECT T.TransactionID AS "Id", P.FName AS "PatFirst", P.LName AS "PatLast", D.DepartmentName, T.Amount, DATE_FORMAT(T.TransactionDateTime, '%Y-%m-%d') AS "Date",T.LateFeeAmount AS Late, P.PatientID as PatID
    FROM transaction AS T, patient AS P,appointment AS A, employee AS E, department AS D
    WHERE T.AppointmentID=A.AppointmentID AND T.PatientID=P.PatientID AND E.EmployeeID=A.DoctorID AND E.DepartmentID=D.DepartmentID AND T.Status="Pending"`;

    try {
        const [rows] = await db.query(q)
        res.json(rows)
    }catch(err) {
        res.status(500).json({error: 'Error pulling invoice'})
    }
})

router.get('/api/getEmployees', requireAdmin, async (req,res) => {
    const q = `SELECT e.EmployeeID, e.FirstName, e.LastName, e.Role, e.Email, e.Address, e.PhoneNumber, e.IsActive, d.DepartmentName
               FROM employee e LEFT JOIN department d ON e.DepartmentID = d.DepartmentID`;
    
    try {
        const [rows] = await db.query(q)

        return res.json(rows)
    }catch(err) {
        res.status(500).json({error: "Error getting Employees"})
    }
    
})

router.get('/api/getdeptEmployees', requireAdmin, async (req,res) => {
    const {DepartmentID} = req.query
    
    const q = `
    SELECT E.EmployeeID,E.FirstName,E.LastName,E.Role,E.Email,E.PhoneNumber,D.DepartmentID,D.DepartmentName 
    FROM employee AS E,department as D
    WHERE D.DepartmentID=E.DepartmentID AND D.DepartmentID=?`;
    
    try {
        const [rows] = await db.query(q,[DepartmentID])

        return res.json(rows)
    }catch(err) {
        res.status(500).json({error: "Error getting Department Employees"})
    }
    
})

router.post('/api/updateEmployee', requireAdmin, async (req,res) => {
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
    const q = `SELECT D.DepartmentID, D.DepartmentName, COUNT(E.EmployeeID) AS Employees
               FROM department D LEFT JOIN employee E ON E.DepartmentID = D.DepartmentID
               GROUP BY D.DepartmentID, D.DepartmentName`;

    try {
        const [rows] = await db.query(q)
        return res.json(rows)
    }catch(err){
        console.error(err)
        res.status(500).json({error: 'Error getting departments'})
    }
})

router.post('/api/adddepartment', async (req,res) => {
    const q = 'INSERT INTO department (DepartmentName) VALUES (?)'

    const {DepartmentName} = req.body

    try {
        const [rows] = await db.query(q,[DepartmentName])
        return res.json({success: true, insertId: rows.insertId})
    }catch(err){
        res.status(500).json({error: 'Error creating department'})
    }
})

router.get('/api/getdeptdoctors', requireAdmin, async (req,res) => {
    const q = `
    SELECT E.EmployeeID, E.FirstName, E.LastName, D.DepartmentName
    FROM employee AS E, department AS D, doctor AS DO
    WHERE E.EmployeeID=DO.EmployeeID AND D.DepartmentID=E.DepartmentID`

    try {
        const [rows] = await db.query(q)
        return res.json(rows)
    }catch(err){
        console.error(err)
        res.status(500).json({error: 'Error getting dept doctors'})
    }
})

router.get('/api/getdepartmentinfo', requireAdmin, async (req,res) => {
    const q = `
    SELECT D.DepartmentID, D.DepartmentName, COUNT(E.EmployeeID) AS Employees
    FROM department AS D
    LEFT JOIN employee AS E ON E.DepartmentID=D.DepartmentID
    GROUP BY D.DepartmentID
    ORDER BY Employees DESC`

    try {
        const [rows] = await db.query(q)
        return res.json(rows)
    }catch(err){
        console.error(err)
        res.status(500).json({error: 'Error getting department info'})
    }
})

router.get('/api/getpatients', requireAdmin, async (req,res) => {
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
        res.status(500).json({error: 'Error getting patients'})
    }
})

router.get('/api/pullpatientdoctor', requireAdmin, async (req,res) => {
    const q = `
    SELECT
        A.AppointmentID,
        P.PatientID,
        P.FName AS PatFirst,
        P.LName AS PatLast,
        E.EmployeeID AS DocID,
        E.FirstName AS DocFirst,
        E.LastName AS DocLast,
        D.DepartmentName,
        DATE_FORMAT(A.AppointmentDate, '%Y-%m-%d') AS VisitDate,
        A.ReasonForVisit,
        S.StatusText AS StatusText
    FROM appointment AS A
    JOIN patient AS P ON A.PatientID = P.PatientID
    JOIN employee AS E ON A.DoctorID = E.EmployeeID
    JOIN department AS D ON E.DepartmentID = D.DepartmentID
    JOIN appointmentstatus AS S ON A.StatusCode = S.StatusCode
    ORDER BY A.AppointmentDate DESC`;
    try {
        const [rows] = await db.query(q);
        return res.json(rows);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Error pulling patient-doctor report' });
    }
})

router.get('/api/getemployeesbydept/:deptId', requireAdmin, async (req,res) => {
    const q = 'SELECT EmployeeID, FirstName, LastName, Role, Email, PhoneNumber FROM employee WHERE DepartmentID = ? AND IsActive != 0';
    try {
        const [rows] = await db.query(q, [req.params.deptId]);
        return res.json(rows);
    } catch(err) {
        res.status(500).json({ error: 'Error fetching employees' });
    }
})

router.post('/api/transferdepartment', requireAdmin, async (req,res) => {
    const { EmployeeIDs, DepartmentID } = req.body;
    if (!Array.isArray(EmployeeIDs) || !EmployeeIDs.length || !DepartmentID)
        return res.status(400).json({ error: 'Invalid payload' });
    try {
        await Promise.all(
            EmployeeIDs.map(id => db.query('UPDATE employee SET DepartmentID=? WHERE EmployeeID=?', [DepartmentID, id]))
        );
        return res.json({ message: 'Transfer complete' });
    } catch(err) {
        res.status(500).json({ error: 'Error transferring employees' });
    }
})

router.delete('/api/deletedepartment/:id', requireAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM department WHERE DepartmentID = ?', [req.params.id])
        res.json({ success: true })
    } catch(err) {
        console.error(err)
        res.status(500).json({ error: 'Error deleting department' })
    }
})

router.post('/api/toggleActive', requireAdmin, async (req, res) => {
    const { EmployeeID, IsActive } = req.body
    try {
        await db.query('UPDATE employee SET IsActive = ? WHERE EmployeeID = ?', [IsActive ? 1 : 0, EmployeeID])
        res.json({ success: true })
    } catch(err) {
        console.error(err)
        res.status(500).json({ error: 'Error updating employee status' })
    }
})

module.exports = router;
