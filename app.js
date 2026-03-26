const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');

const patientRoutes = require('./routes/patient');
const employeeRoutes = require('./routes/employee');
const doctorRoutes = require('./routes/doctor');

app.use('/patient', patientRoutes);
app.use('/employee', employeeRoutes);
app.use('/doctor', doctorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
