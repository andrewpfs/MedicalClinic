import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Andrew's pages
import Home from './pages/Home';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/patient/Register';
import RoleSelect from './pages/RoleSelect';
// David's pages
import EmployeePage from './pages/EmployeePage';
import DoctorPage from './pages/DoctorPage';
import StaffLogin from './pages/StaffLogin';
// Admin pages
import AdminHome from './pages/admin/Home';
import AddE from './pages/admin/AddE';
import AdminProfile from './pages/admin/Profile';
import AdminEmployees from './pages/admin/Employees';
import Report from './pages/admin/Report';
import RepDAR from './pages/admin/RepDAR';
import RepGAR from './pages/admin/RepGAR';
import RepGRR from './pages/admin/RepGRR';
import ReportTable from './pages/admin/ReportTable';
// Patient pages
import Profile from './pages/patient/Profile';
import Booking from './pages/patient/booking';
import Visits from './pages/patient/Visits';
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
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Staff pages */}
        <Route path="/employee" element={<EmployeePage />} />
        <Route path="/doctor" element={<DoctorPage />} />

        {/* Patient portal */}
        <Route path="/patient/profile" element={<Profile />} />
        <Route path="/patient/booking" element={<Booking />} />
        <Route path="/patient/visits" element={<Visits />} />
        <Route path="/patient/billing" element={<Billing />} />
        <Route path="/patient/billing/balance" element={<BillingBalance />} />
        <Route path="/patient/billing/methods" element={<BillingMethods />} />
        <Route path="/patient/update-profile" element={<UpdateProfile />} />
        <Route path="/select-role" element={<RoleSelect />} />
        <Route path="/staff-login" element={<StaffLogin />} />

        {/* Admin portal */}
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/home" element={<AdminHome />} />
        <Route path="/admin/add-employee" element={<AddE />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/admin/employees" element={<AdminEmployees />} />
        <Route path="/admin/report" element={<Report />} />
        <Route path="/admin/report/dar" element={<RepDAR />} />
        <Route path="/admin/report/gar" element={<RepGAR />} />
        <Route path="/admin/report/grr" element={<RepGRR />} />
        <Route path="/admin/report/table" element={<ReportTable />} />
      </Routes>
    </BrowserRouter>
  );
}
