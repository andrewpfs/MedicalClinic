import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StaffLogin() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/employee/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ employeeId, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.role === 'Doctor') navigate('/doctor');
        else if (data.role === 'Nurse') navigate('/nurse');
        else if (data.role === 'Admin') navigate('/admin');
        else navigate('/employee');
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch {
      setError('Could not connect to server.');
    }
  };

  return (
    <div style={pageShell}>
      <div style={topBar}>
        <div style={brand}>Medical Clinic</div>
      </div>

      <div style={pageBody}>
        <div style={contentGrid}>
          <section style={heroPanel}>
            <p style={eyebrow}>Staff Sign-In</p>
            <h1 style={title}>Access the clinic workspace</h1>
            <p style={subtitle}>
              Use your employee ID and password to enter the workflow built for doctors, nurses, receptionists, employees, and administrators.
            </p>

            <div style={roleRow}>
              {['Doctor', 'Nurse', 'Receptionist', 'Admin'].map((role) => (
                <span key={role} style={rolePill}>{role}</span>
              ))}
            </div>
          </section>

          <section style={loginCard}>
            <div style={cardHeader}>
              <h2 style={cardTitle}>Welcome back</h2>
              <p style={cardSubtitle}>Sign in to continue to your dashboard.</p>
            </div>

            {error && <div style={errorBox}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <label htmlFor="employeeId" style={fieldLabel}>Employee ID</label>
              <input
                id="employeeId"
                type="number"
                value={employeeId}
                onChange={(event) => setEmployeeId(event.target.value)}
                placeholder="Enter your employee ID"
                style={fieldInput}
                required
              />

              <label htmlFor="password" style={fieldLabel}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                style={fieldInput}
                required
              />

              <button type="submit" style={submitButton}>Sign In</button>
            </form>

            <button
              type="button"
              onClick={() => navigate('/select-role')}
              style={backButton}
            >
              ← Back to role selection
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

const pageShell = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at top left, #dff4ea 0%, #f8fafc 46%, #eef2ff 100%)',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: '"Poppins", sans-serif',
};

const topBar = {
  padding: '24px 32px 0',
};

const brand = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#123524',
};

const pageBody = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px 56px',
};

const contentGrid = {
  display: 'grid',
  gridTemplateColumns: 'minmax(300px, 1.1fr) minmax(320px, 460px)',
  gap: '26px',
  width: '100%',
  maxWidth: '1080px',
  alignItems: 'stretch',
};

const heroPanel = {
  borderRadius: '28px',
  background: 'linear-gradient(135deg, #123524 0%, #1d5b44 54%, #2f7a61 100%)',
  color: '#ffffff',
  padding: '34px',
  boxShadow: '0 24px 60px rgba(18, 53, 36, 0.2)',
};

const eyebrow = {
  margin: 0,
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  opacity: 0.8,
};

const title = {
  margin: '12px 0 14px',
  fontSize: 'clamp(30px, 5vw, 42px)',
  lineHeight: 1.05,
};

const subtitle = {
  margin: 0,
  fontSize: '15px',
  lineHeight: 1.7,
  color: 'rgba(223, 244, 234, 0.88)',
};

const roleRow = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  marginTop: '22px',
};

const rolePill = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '999px',
  background: 'rgba(255, 255, 255, 0.14)',
  color: '#dff4ea',
  fontSize: '12px',
  fontWeight: 700,
};

const loginCard = {
  borderRadius: '28px',
  background: 'rgba(255, 255, 255, 0.92)',
  border: '1px solid rgba(255, 255, 255, 0.98)',
  padding: '30px',
  boxShadow: '0 20px 48px rgba(15, 23, 42, 0.1)',
  backdropFilter: 'blur(10px)',
};

const cardHeader = {
  marginBottom: '18px',
};

const cardTitle = {
  margin: 0,
  color: '#0f172a',
  fontSize: '28px',
};

const cardSubtitle = {
  margin: '8px 0 0',
  color: '#64748b',
  fontSize: '14px',
};

const errorBox = {
  marginBottom: '16px',
  padding: '12px 14px',
  borderRadius: '14px',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#991b1b',
  fontSize: '14px',
  fontWeight: 600,
};

const fieldLabel = {
  display: 'block',
  marginBottom: '6px',
  marginTop: '14px',
  color: '#334155',
  fontSize: '13px',
  fontWeight: 600,
};

const fieldInput = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: '14px',
  border: '1px solid #dbe4ea',
  background: '#f8fafc',
  padding: '12px 14px',
  fontSize: '14px',
  color: '#0f172a',
  fontFamily: 'inherit',
};

const submitButton = {
  width: '100%',
  marginTop: '20px',
  border: 'none',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #123524 0%, #1d5b44 100%)',
  color: '#ffffff',
  padding: '13px 18px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const backButton = {
  marginTop: '18px',
  background: 'none',
  border: 'none',
  color: '#64748b',
  cursor: 'pointer',
  fontSize: '14px',
  padding: 0,
  fontFamily: 'inherit',
};
