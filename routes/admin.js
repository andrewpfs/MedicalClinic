const express = require('express');
const router = express.Router();
const db = require('../backend/db');
const jwt = require('jsonwebtoken');

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
    const pass = req.body.Password;
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
        req.body.Password,
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
    const q = 'SELECT DepartmentID,DepartmentName FROM department';

    try {
        const [rows] = await db.query(q)
        return res.json(rows)
    }catch(err){
        console.error(err)
    }
})
/*
router.get('/profile', async (req, res) => {
    const id = 4; // Keeping his hardcoded ID for now CHANGE WHEN MERGING
    
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
            res.render('admin/Profile', rows[0]); 
        } else {
            res.status(404).send("Employee not found");
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Database error loading profile");
    }
});
router.get('/updateprofile', async (req, res) => {
    const id = 4; //TEMPORARY PLEASE CHANGE
    try {
        const [rows] = await db.query("SELECT FirstName AS First, LastName AS Last, Address, PhoneNumber AS Phone, Email, Password AS Pass FROM employee WHERE EmployeeID=?",[id]);
    }catch(err) {
        console.error(err);
        res.status(500).send("Database error loading profile");
    }
    
    res.render('admin/updateprofile', rows[0]);
})
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
 
        const topE = "";
        const topA = "";
        if (rows.length > 0) topE = rows[0].FirstName + " " + rows[0].LastName;
        if (rows.length > 0) topA = rows[0].Appointments;
        const [zeros] = await db.query("SELECT E.EmployeeID, E.FirstName, E.LastName FROM doctor AS DO, employee AS E, department AS D WHERE D.DepartmentID=E.DepartmentID AND DO.EmployeeID=E.EmployeeID AND D.DepartmentName=?",req.body.DepartmentName);
        rows.forEach(tup =>{
            zeros.forEach(zer => {
                if (tup.EmployeeID == zer.EmployeeID) {
                    const index = zeros.indexOf(zer.EmployeeID);
                    if (index > -1) zeros.splice(index,1);
                }
            })
        });

        res.render('admin/repdar', { results: rows, topE: topA, topA: topA, zeros: zeros });
    } catch (err) {
        console.error(err);
        res.status(500).send("Report Error");
    }
});
//Gets data for GAR Report
router.post('/pullgar', async (req,res) =>{
    const q = "SELECT D.DepartmentName,O.OfficeName,COUNT(A.AppointmentID) AS 'Appointments' FROM department AS D,appointment AS A,employee AS E,office AS O WHERE A.DoctorID=E.EmployeeID AND D.DepartmentID=E.DepartmentID AND D.OfficeID=O.OfficeID AND A.AppointmentDate >= ? AND A.AppointmentDate <= ? GROUP BY D.DepartmentID ORDER BY Appointments DESC";
    const {min, max} = req.body;

    try {

        const [rows] = await db.query(q,[min,max]);
        res.render('admin/repgar', {results: rows});
    } catch (err) {
        console.error(err);
        res.status(500).send("Report Error");
    }
});
//Gets data for GRR Report
router.post('/pullgrr', async (req,res) =>{

    const q = `
        SELECT D.DepartmentName,O.OfficeName,SUM(T.Amount) AS 'Revenue' FROM department AS D,appointment AS A,employee AS E,transaction as T,office AS O WHERE A.DoctorID=E.EmployeeID AND D.DepartmentID=E.DepartmentID AND D.OfficeID=O.OfficeID AND T.AppointmentID=A.AppointmentID AND A.AppointmentDate >= ? AND A.AppointmentDate <= ? GROUP BY D.DepartmentID ORDER BY Revenue DESC`;

    const { min, max} = req.body;
 
    try {
 
        const [rows] = await db.query(q, [min, max]);
 
 
        res.render('admin/repgrr', { results: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send("Report Error");
    }
});
router.post("/upprof", async (req,res) =>{
    const q = "UPDATE employee SET FirstName=?,LastName=?,Address=?,PhoneNumber=?,Email=?,Password=? WHERE EmployeeID=4";
    const r = [
        req.body.FirstName,
        req.body.FirstName,
        req.body.Address,
        req.body.PhoneNumber,
        req.body.Email,
        req.body.Password,
    ];
    try {
        await db.query(q,r);
    }catch(err) {
        console.error(err);
        res.status(500).send("Update Profile Error");
    }
});
*/
router.post("/adddoc", async (req,res) =>{
    /*const r = [
            req.body.FirstName,req.body.LastName,req.body.Email,req.body.DepartmentID
        ];
        try {
            const id = await db.query("SELECT EmployeeID FROM employee WHERE FirstName=?,LastName=?,Email=?,DepartmentID=?",[r]);
        }catch(err) {
            console.error(err);
            res.status(500).send("Doctor Search Error");
        }
        const special = req.body.Specialty;
        const pcp = req.body.IsPrimaryCare;

        router.post('/adddoc',{EmployeeID : id,Specialty : special,IsPrimaryCare : pcp});*/
    
    const id = null;
    const q = "SELECT EmployeeID FROM employee WHERE FirstName=?,LastName=?,Email=?,DepartmentID=?";
    const r = [req.body.FirstName,req.body.LastName,req.body.Email,req.body.DepartmentID];
    try {
        id = await db.query(q,r);
    }catch(err) {
        console.error(err);
        res.status(500).send("Doctor Search Error");
    }

    q = "INSERT INTO doctor (`EmployeeID`,`Specialty`,`IsPrimaryCare`) VALUES (?)";
    r = [
        id,
        req.body.Specialty,
        req.body.IsPrimaryCare
    ];
    try {

        const query = await db.query(q,[r]);
    } catch(err) {
        console.error(err);
        res.status(500).send("Doctor Error");
    }
    //res.json(query);
});

router.post("/addnur", async (req,res) =>{
    const id = null;
    const q = "SELECT EmployeeID FROM employee WHERE FirstName=?,LastName=?,Email=?,DepartmentID=?";
    const r = [req.body.FirstName,req.body.LastName,req.body.Email,req.body.DepartmentID];
    try {
        id = await db.query(q,r);
    }catch(err) {
        console.error(err);
        res.status(500).send("Nurse Search Error");
    }
    
    q = "INSERT INTO nurse (`EmployeeID`,`ApprovedDoctorID`) VALUES (?)";
    r = [
        id,
        req.body.ApprovedDoctorID
    ];

    try {

        const query = await db.query(q,[r]);
    } catch(err) {
        console.error(err);
        res.status(500).send("Nurse Error");
    }
    //res.json(query);
});

// Creating and Employee - POST
router.post('/addemp', async (req, res) => {
    const q = "INSERT INTO employee (`FirstName`,`LastName`,`Birthdate`,`GenderCode`,`RaceCode`,`EthnicityCode`,`Role`,`Address`,`PhoneNumber`,`Email`,`Password`,`DepartmentID`) VALUES (?)"
    //const q = "INSERT INTO employee (`FirstName`,`DepartmentID`) VALUES (?)";
    const rol = req.body.Role;
    const r = [
        req.body.FirstName,
        req.body.LastName,
        req.body.Birthdate,
        req.body.GenderCode,
        req.body.RaceCode,
        req.body.EthnicityCode,
        //req.body.Role,
        rol,
        req.body.Address,
        req.body.PhoneNumber,
        req.body.Email,
        req.body.Password,
        req.body.DepartmentID,
    ];

    
    try {
        await db.query(q,[r]);    
    }catch(err) {
        console.error(err);
        res.status(500).send("Employee Error");
    }
    if (rol === "Doctor") {
        router.post('admin/adddoc',{FirstName:req.body.FirstName,LastName:req.body.LastName,Email:req.body.Email,DepartmentID:req.body.DepartmentID,Specialty:req.body.Specialty,IsPrimaryCare:req.body.IsPrimaryCare});
    }
    else if (rol === "Nurse") {
        router.post('admin/addnur',{FirstName:req.body.FirstName,LastName:req.body.LastName,Email:req.body.Email,DepartmentID:req.body.DepartmentID,ApprovedDoctorID:req.body.ApprovedDoctorID});
    }
    //res.json(row);
});

// ── Individual Appointments Report ───────────────────────────────────────────
router.get('/api/appointments', requireAdmin, async (req, res) => {
    const { min, max, DepartmentName } = req.query;
    const start = min || '2000-01-01';
    const end   = max || '2099-12-31';
    let q = `
        SELECT A.AppointmentID, P.FName, P.LName,
               E.FirstName AS DoctorFirst, E.LastName AS DoctorLast,
               A.AppointmentDate, A.ReasonForVisit,
               S.AppointmentText AS Status, D.DepartmentName
        FROM appointment A
        JOIN patient P ON A.PatientID = P.PatientID
        JOIN employee E ON A.DoctorID = E.EmployeeID
        LEFT JOIN appointmentstatus S ON A.StatusCode = S.AppointmentCode
        LEFT JOIN department D ON E.DepartmentID = D.DepartmentID
        WHERE DATE(A.AppointmentDate) BETWEEN ? AND ?`;
    const params = [start, end];
    if (DepartmentName) { q += ' AND D.DepartmentName = ?'; params.push(DepartmentName); }
    q += ' ORDER BY A.AppointmentDate DESC';
    try {
        const [rows] = await db.query(q, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching appointments' });
    }
});

// ── Individual Transactions Report ────────────────────────────────────────────
router.get('/api/transactions', requireAdmin, async (req, res) => {
    const { min, max, DepartmentName } = req.query;
    const start = min || '2000-01-01';
    const end   = max || '2099-12-31';
    let q = `
        SELECT T.TransactionID, P.FName, P.LName, T.Amount, T.Status,
               T.TransactionDateTime,
               E.FirstName AS DoctorFirst, E.LastName AS DoctorLast,
               A.AppointmentDate, D.DepartmentName
        FROM transaction T
        JOIN patient P ON T.PatientID = P.PatientID
        JOIN appointment A ON T.AppointmentID = A.AppointmentID
        JOIN employee E ON A.DoctorID = E.EmployeeID
        LEFT JOIN department D ON E.DepartmentID = D.DepartmentID
        WHERE DATE(A.AppointmentDate) BETWEEN ? AND ?`;
    const params = [start, end];
    if (DepartmentName) { q += ' AND D.DepartmentName = ?'; params.push(DepartmentName); }
    q += ' ORDER BY T.TransactionDateTime DESC';
    try {
        const [rows] = await db.query(q, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching transactions' });
    }
});

module.exports = router;
