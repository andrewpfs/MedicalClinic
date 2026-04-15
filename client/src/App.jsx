import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import EmployeePage from './pages/EmployeePage';
import DoctorPage from './pages/DoctorPage';

function Home() {
  return (
    <div style={{ padding: '24px' }}>
      <h1>Medical Clinic</h1>
      <p>Select a page.</p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to="/employee">Employee</Link>
        <Link to="/doctor">Doctor</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/employee" element={<EmployeePage />} />
        <Route path="/doctor" element={<DoctorPage />} />
      </Routes>
    </BrowserRouter>
  );
}