import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UpdateProfile() {
  const [form, setForm] = useState({ phone: '', email: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/patient/profile')
      .then(res => {
        if (res.status === 401) { navigate('/patient/login'); return null; }
        return res.json();
      })
      .then(data => {
        if (data) setForm({ phone: data.PhoneNumber || '', email: data.Email || '' });
      });
  }, [navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const res = await fetch('/patient/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      navigate('/patient/profile');
    } else {
      setError('Update failed.');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', margin: '40px' }}>
      <h2>Update Your Contact Information</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Phone Number:</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. 555-0123"
            style={{ padding: '8px', width: '300px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address:</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
            style={{ padding: '8px', width: '300px' }}
          />
        </div>
        <button
          type="submit"
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer', width: 'auto' }}
        >
          Save Changes
        </button>
      </form>
      <br />
      <a href="/patient/profile">Cancel and Go Back</a>
    </div>
  );
}
