import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Home & auth
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/patient/Register';
import RoleSelect from './pages/RoleSelect';
// David's pages
import EmployeePage from './pages/EmployeePage';
import DoctorPage from './pages/DoctorPage';
import StaffLogin from './pages/StaffLogin';
// Patient pages
import Profile from './pages/patient/Profile';
import Booking from './pages/patient/booking';
import Visits from './pages/patient/Visits';
import Payments from './pages/patient/Payments';
import Billing from './pages/patient/Billing';
import BillingBalance from './pages/patient/BillingBalance';
import BillingMethods from './pages/patient/BillingMethods';
import UpdateProfile from './pages/patient/UpdateProfile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home & auth */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* David's pages */}
        <Route path="/employee" element={<EmployeePage />} />
        <Route path="/doctor" element={<DoctorPage />} />

        {/* Patient portal */}
        <Route path="/patient/login" element={<Login />} />
        <Route path="/patient/profile" element={<Profile />} />
        <Route path="/patient/booking" element={<Booking />} />
        <Route path="/patient/visits" element={<Visits />} />
        <Route path="/patient/payments" element={<Payments />} />
        <Route path="/patient/billing" element={<Billing />} />
        <Route path="/patient/billing/balance" element={<BillingBalance />} />
        <Route path="/patient/billing/methods" element={<BillingMethods />} />
        <Route path="/patient/update-profile" element={<UpdateProfile />} />
        <Route path="/patient-login" element={<Login />} />
        <Route path="/select-role" element={<RoleSelect />} />
        <Route path="/staff-login" element={<StaffLogin />} />
      </Routes>
    </BrowserRouter>
  );
}