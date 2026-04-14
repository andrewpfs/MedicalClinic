import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Payments() {
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/patient/api/payments', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) { navigate('/patient/login'); return null; }
        return res.json();
      })
      .then(data => { if (data) setInvoices(data); })
      .catch(() => setError('Failed to load invoices.'));
  }, [navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const res = await fetch('/patient/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId: selected }),
    });
    if (res.ok) {
      navigate('/patient/visits');
    } else {
      setError('Payment failed.');
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h2>Payment Portal</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label style={{ display: 'block', marginTop: '15px', fontWeight: 'bold' }}>
          Select an Outstanding Invoice:
        </label>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          required
          style={{ padding: '10px', width: '100%', maxWidth: '400px', marginTop: '5px' }}
        >
          <option value="" disabled>-- Choose an Invoice to Pay --</option>
          {invoices.map(inv => (
            <option key={inv.TransactionID} value={inv.TransactionID}>
              Invoice #{inv.TransactionID} - ${inv.Amount} (Visit on {new Date(inv.AppointmentDate).toLocaleDateString()})
            </option>
          ))}
        </select>

        <p style={{ fontSize: '0.9em', color: '#666' }}>
          *Payment will be processed for the full invoice amount.
        </p>

        <button
          type="submit"
          style={{ padding: '10px', width: '100%', maxWidth: '400px', backgroundColor: '#2c3e50', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' }}
        >
          Submit Payment
        </button>
      </form>
      <br />
      <a href="/patient/profile">Cancel and go back</a>
    </div>
  );
}
