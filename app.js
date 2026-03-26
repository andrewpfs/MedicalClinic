const express = require('express');
const app = express();
const session = require('express-session'); 
const patientRoutes = require('./routes/patient');

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'medical_clinic_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to false since we aren't using HTTPS/SSL locally
}));

app.use('/patient', patientRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/patient/login');
    });
});