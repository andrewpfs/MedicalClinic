const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

const patientRoutes = require('./routes/patient');

app.use('/patient', patientRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));