# MedicalClinic

A full-stack web application for managing a medical clinic — handling patients, staff, appointments, billing, and reporting.

Website hosted at: https://gentle-rock-0d78d0710.7.azurestaticapps.net/
## Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React, React Router, React Data Table   |
| Backend  | Node.js, Express                        |
| Database | MySQL                                   |
| Auth     | JWT (staff), session (patient)          |

## Features

### Patient Portal
- Register and manage profile
- Book appointments with doctors
- View visit history and notes
- Billing, payments, and insurance management

### Staff / Admin Portal
- Role-based login (Admin, Doctor, Nurse, Receptionist)
- Employee management — add, edit, transfer between departments
- Department management
- Shift scheduling (doctors/nurses)
- Reports:
  - Doctor Appointment Report
  - Department Appointment Report
  - Revenue Report
  - Reviews Report
  - Invoice Report

## Project Structure

```
/
├── app.js                  # Express entry point
├── backend/routes/         # Admin and doctor API routes
├── routes/                 # Patient and employee API routes
├── client/src/
│   ├── pages/admin/        # Admin portal pages
│   ├── pages/patient/      # Patient portal pages
│   └── hooks/              # Auth hooks
└── sql/                    # Database setup scripts
```

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL

### Installation

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install
```

### Running

```bash
# Start backend (port 3000)
npm start

# Start frontend (port 5173)
cd client && npm run dev
```

The frontend connects to the backend at `http://localhost:3000`.

### Environment

Create a `.env` file in the root with your database credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=medicalclinic
```
