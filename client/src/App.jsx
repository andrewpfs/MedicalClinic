import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Andrew's pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/patient/Register';

// David's pages
import EmployeePage from './pages/EmployeePage';
import DoctorPage from './pages/DoctorPage';

// Your patient pages
import PatientProfile from './pages/patient/Profile';
import PatientVisits from './pages/patient/Visits';
import PatientBilling from './pages/patient/Billing';
import PatientBooking from './pages/patient/booking';
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

        {/* Your patient portal */}
        <Route path="/patient/profile" element={<PatientProfile />} />
        <Route path="/patient/visits" element={<PatientVisits />} />
        <Route path="/patient/billing" element={<PatientBilling />} />
        <Route path="/patient/booking" element={<PatientBooking />} />
        <Route path="/patient/update-profile" element={<UpdateProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
