import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function Profile() {
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/patient/api/profile', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) { navigate('/login'); return null; }
        return res.json();
      })
      .then(data => { if (data) setPatient(data); })
      .catch(() => setError('Failed to load profile.'));
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('/patient/logout', { credentials: 'include' });
    navigate('/');
  };

  if (error) return <p style={{ padding: '20px', color: 'red' }}>{error}</p>;
  if (!patient) return <p style={{ padding: '20px' }}>Loading...</p>;

  return (
    <div style={{ backgroundColor: '#f4f7f6', minHeight: '100vh' }}>
      <Navbar />
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>

        <div style={{ textAlign: 'center', marginBottom: '30px', padding: '20px 0' }}>
          <h1 style={{ fontSize: '2.2em', fontWeight: 300, margin: 0 }}>
            Welcome, {patient.FName}!
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '40px' }}>
          {[
            { path: '/patient/booking', icon: '📅', label: 'Schedule an Appointment' },
            { path: '/patient/visits', icon: '📄', label: 'Visit History' },
            { path: '/patient/billing', icon: '💳', label: 'Make a Payment' },
            { path: '/patient/update-profile', icon: '⚙️', label: 'Update Information' },
          ].map(card => (
            <button
              key={card.path}
              onClick={() => navigate(card.path)}
              style={{
                background: 'white', height: '130px', borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                color: '#333', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                border: '1px solid #ddd', cursor: 'pointer', width: '100%',
              }}
            >
              <span style={{ fontSize: '2em', marginBottom: '10px' }}>{card.icon}</span>
              <span style={{ fontSize: '0.85em', textAlign: 'center', fontWeight: 'bold' }}>{card.label}</span>
            </button>
          ))}
        </div>

        <div style={{ background: 'white', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
          {[
            { label: 'Medical Record Number', value: patient.PatientID },
            { label: 'Patient Name', value: `${patient.FName} ${patient.LName}` },
            { label: 'Email', value: patient.Email },
            { label: 'Contact Number', value: patient.PhoneNumber },
            { label: 'Address', value: patient.Address || 'N/A' },
            { label: 'Date of Birth', value: patient.Dob ? new Date(patient.Dob).toLocaleDateString() : 'N/A' },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: 'flex', borderBottom: i < arr.length - 1 ? '1px solid #eee' : 'none' }}>
              <div style={{ width: '220px', backgroundColor: '#f9f9f9', padding: '12px', fontWeight: 'bold', borderRight: '1px solid #eee', fontSize: '0.9em' }}>
                {row.label}
              </div>
              <div style={{ padding: '12px', flex: 1, fontSize: '0.9em' }}>{row.value}</div>
            </div>
          ))}
        </div>

        <button
          onClick={handleLogout}
          style={{ marginTop: '30px', background: 'none', color: '#888', border: 'none', cursor: 'pointer', fontSize: '0.85em', display: 'block', width: '100%' }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
