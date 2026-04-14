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
      </Routes>
    </BrowserRouter>
  );
}