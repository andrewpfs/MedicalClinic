import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ Email: '', Password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/patient/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      if (res.ok) {
        navigate('/patient/profile');
      } else {
        const msg = await res.json();
        setError(msg || 'Login failed.');
      }
    } catch (err) {
      setError('Could not connect to server.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '400px' }}>
        <h2 style={{ marginBottom: '8px' }}>Welcome back</h2>
        <p style={{ color: 'gray', marginBottom: '24px' }}>Sign in to your patient account</p>

        {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Email</label>
            <input
              type="email"
              value={form.Email}
              onChange={e => setForm({ ...form, Email: e.target.value })}
              placeholder="you@example.com"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>Password</label>
            <input
              type="password"
              value={form.Password}
              onChange={e => setForm({ ...form, Password: e.target.value })}
              placeholder="••••••••"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }}
            />
          </div>
          <button
            type="submit"
            style={{ width: '100%', padding: '12px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
