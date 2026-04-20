# Medical Clinic

A full-stack web application for managing a medical clinic built with React, Node.js/Express, and MySQL.

---

## Local Setup

### Prerequisites
- Node.js 18+
- MySQL 8+

### 1. Clone the repository

```bash
git clone https://github.com/andrewpfs/MedicalClinic.git
cd MedicalClinic
```

### 2. Set up the database

Import the provided SQL dump into your local MySQL instance:

```bash
mysql -u root -p < medicalclinic_dump.sql
```

### 3. Configure backend environment

Create a `.env` file inside the `backend/` folder:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=medicalclinic
PORT=3001
```

### 4. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../client
npm install
```

### 5. Run the application

```bash
# Start backend (from /backend folder)
npm start

# Start frontend (from /client folder)
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## Project Structure

```
/
├── backend/
│   ├── app.js                  # Express entry point (port 3001)
│   ├── db.js                   # MySQL connection pool
│   ├── routes/
│   │   ├── admin.js            # Admin API routes
│   │   ├── patient.js          # Patient API routes
│   │   └── api/
│   │       ├── employee.js     # Receptionist/Nurse API routes
│   │       └── doctor.js       # Doctor API routes
│   └── sql/                    # Database migration and trigger scripts
└── client/
    ├── src/
    │   ├── pages/
    │   │   ├── admin/          # Admin portal pages
    │   │   ├── patient/        # Patient portal pages
    │   │   ├── DoctorPage.jsx
    │   │   ├── EmployeePage.jsx
    │   │   └── NursePage.jsx
    │   ├── components/         # Shared UI components
    │   └── api.js              # API base URL config
    └── .env.production         # Production API URL
```

---

## Team

| Name | GitHub |
|------|--------|
| Duy | andrewpfs |
| Antonio | toniosandpaper |
| Juan | JuanPerez1228 |
| David | DavidE008 |
