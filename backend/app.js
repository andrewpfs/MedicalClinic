const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

const app = express();
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: CLIENT_ORIGIN,
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
        secure: IS_PRODUCTION,
        sameSite: IS_PRODUCTION ? 'none' : 'lax',
        httpOnly: true
    }
}));

const patientRoutes = require('./routes/patient');
const adminRoutes = require('./routes/admin');
const homeRoutes = require('./routes/home');
const employeeApiRoutes = require('./routes/api/employee');
const doctorApiRoutes = require('./routes/api/doctor');

app.use('/patient', patientRoutes);
app.use('/admin', adminRoutes);
app.use('/api/employee', employeeApiRoutes);
app.use('/api/doctor', doctorApiRoutes);
app.use('/', homeRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
