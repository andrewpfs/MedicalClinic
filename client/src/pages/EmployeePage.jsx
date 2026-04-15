import { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:3000/api/employee';

const styles = {
  page: { margin: 0, fontFamily: 'Arial, sans-serif', background: '#f4f1eb', color: '#222', minHeight: '100vh' },
  navbar: {
    background: '#1f2b1d',
    color: 'white',
    padding: '18px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  hero: { padding: '28px 24px 10px' },
  message: { margin: '16px 24px', padding: '12px 14px', borderRadius: '8px' },
  success: { background: '#e7f7e7', color: '#1f5d1f', border: '1px solid #b9e0b9' },
  error: { background: '#fdeaea', color: '#8a1f1f', border: '1px solid #f0bcbc' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(320px, 1fr))', gap: '20px', padding: '20px 24px 32px' },
  card: { background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 14px rgba(0,0,0,0.08)' },
  input: { width: '100%', padding: '10px', border: '1px solid #cfcfcf', borderRadius: '8px', marginBottom: '12px' },
  button: { width: '100%', marginTop: '14px', background: '#1f2b1d', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};

export default function EmployeePage() {
  const [data, setData] = useState({ patients: [], doctors: [], employees: [] });
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

  const loadData = async () => {
    try {
      const res = await fetch(API_BASE, { credentials: 'include' });
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      setData(result);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div style={styles.page}>
      
      {/* 🔥 UPDATED NAVBAR */}
      <div style={styles.navbar}>
        <div><strong>Medical Clinic</strong> — Employee Dashboard</div>
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

      <div style={styles.hero}>
        <h1>Employee Responsibilities</h1>
      </div>

      {message.text && (
        <div style={{ ...styles.message, ...(message.type === 'success' ? styles.success : styles.error) }}>
          {message.text}
        </div>
      )}

    </div>
  );
}