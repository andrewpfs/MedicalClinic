import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Profile from './pages/patient/Profile.jsx';
import Booking from './pages/patient/booking.jsx';
import Visits from './pages/patient/Visits.jsx';
import Payments from './pages/patient/Payments.jsx';
import UpdateProfile from './pages/patient/UpdateProfile.jsx';
import Login from './pages/patient/Login.jsx';
import Billing from './pages/patient/Billing.jsx';
import BillingBalance from './pages/patient/BillingBalance.jsx';
import BillingMethods from './pages/patient/BillingMethods.jsx';
import AdminHome from './pages/admin/Home.jsx';
import AddE from './pages/admin/AddE.jsx';
import AdminProfile from './pages/admin/Profile.jsx';
import AdminUpdateProfile from './pages/admin/Profile.jsx';
import Report from './pages/admin/Report.jsx';
import RepDAR from './pages/admin/RepDAR.jsx';
import RepGAR from './pages/admin/RepGAR.jsx';
import RepGRR from './pages/admin/RepGRR.jsx';
import ReportTable from './pages/admin/ReportTable.jsx';
import Employees from './pages/admin/Employees.jsx';
import EmployeeTable from './pages/admin/EmployeeTable.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/patient/login" element={<Login />} />
        <Route path="/patient/profile" element={<Profile />} />
        <Route path="/patient/booking" element={<Booking />} />
        <Route path="/patient/visits" element={<Visits />} />
        <Route path="/patient/payments" element={<Payments />} />
        <Route path="/patient/update-profile" element={<UpdateProfile />} />
        <Route path="*" element={<Navigate to="/patient/profile" />} />
        <Route path="/patient/billing" element={<Billing />} />
        <Route path="/patient/billing/balance" element={<BillingBalance />} />
        <Route path="/patient/billing/methods" element={<BillingMethods />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/profile/update" element={<AdminUpdateProfile />} />
        <Route path="/admin/report" element={<Report />} />
        <Route path="/admin/report/repgar" element={<RepGAR />} />
        <Route path="/admin/report/grr" element={<RepGRR />} />
        <Route path="/admin/report/dar" element={<RepDAR />} />
        <Route path="/admin/report/table" element={<ReportTable />} />
        <Route path="/admin/employees" element={<Employees />} />
        <Route path="/admin/employees/adde" element={<AddE />} />
        <Route path="/admin/employees/table" element={<EmployeeTable />} />
      </Routes>
    </BrowserRouter>
  );
}