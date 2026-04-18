const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ['http://localhost:5173',
        "https://gentle-rock-0d78d0710.7.azurestaticapps.net"
    ],
    credentials: true
}));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(session({
    secret: 'medical_clinic_secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        sameSite: 'lax'
    }
}));

const patientRoutes = require('./routes/patient');
const adminRoutes = require('./routes/admin');
const homeRoutes = require('./backend/routes/home');
const employeeApiRoutes = require('./routes/api/employee');
const doctorApiRoutes = require('./backend/routes/api/doctor');

app.use('/patient', patientRoutes);
app.use('/admin', adminRoutes);
app.use('/api/employee', employeeApiRoutes);
app.use('/api/doctor', doctorApiRoutes);
app.use('/', homeRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});