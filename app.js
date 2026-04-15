const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(session({
    secret: 'medical_clinic_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const patientRoutes = require('./routes/patient');
const homeRoutes = require('./routes/home');
const employeeApiRoutes = require('./routes/api/employee');
const doctorApiRoutes = require('./routes/api/doctor');

app.use('/patient', patientRoutes);
app.use('/api/employee', employeeApiRoutes);
app.use('/api/doctor', doctorApiRoutes);
app.use('/', homeRoutes);

app.use(express.static(path.join(__dirname, 'client/build')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
