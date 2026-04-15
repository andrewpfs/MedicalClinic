import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:3000/api/doctor';

export default function DoctorPage() {
  const [message, setMessage] = useState({ type: '', text: '' });

  // 🔥 SIGN OUT FUNCTION
  const handleSignOut = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      const result = await res.json();

      if (!result.success) throw new Error(result.error);

      window.location.href = '/patient/login';
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial',
      background: '#f4f1eb',
      minHeight: '100vh'
    }}>
      
      {/* 🔥 UPDATED NAVBAR */}
      <div style={{
        background: '#1f2b1d',
        color: 'white',
        padding: '18px 24px',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div><strong>Medical Clinic</strong> — Doctor Dashboard</div>
        <button onClick={handleSignOut} style={{
          background: 'white',
          color: '#1f2b1d',
          border: 'none',
          padding: '10px 14px',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}>
          Sign Out
        </button>
      </div>

      <div style={{ padding: '24px' }}>
        <h1>Doctor Responsibilities</h1>
      </div>

      {message.text && (
        <div style={{ color: 'red', padding: '10px' }}>
          {message.text}
        </div>
      )}

    </div>
  );
}