import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './patient-layout.css';

import API from '../../api';
const CARD_TYPES = ['Visa', 'Mastercard', 'American Express', 'Discover'];

const s = {
  body:         { background: '#f5f3ee', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' },
  wrap:         { maxWidth: '600px', margin: '0 auto', padding: '2rem 1.5rem 4rem' },
  sectionLabel: { fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' },
  /* saved cards */
  methodCard:   { background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  chipWrap:     { width: '48px', height: '30px', borderRadius: '5px', background: '#1e2b1b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  chipText:     { fontSize: '9px', fontWeight: 800, color: 'white', letterSpacing: '0.05em' },
  methodInfo:   { flex: 1, minWidth: 0 },
  methodTitle:  { fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  methodSub:    { fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' },
  defaultBadge: { fontSize: '11px', fontWeight: 500, padding: '3px 10px', borderRadius: '99px', background: '#EAF3DE', color: '#3B6D11', border: '1px solid #C0DD97', flexShrink: 0, whiteSpace: 'nowrap' },
  removeBtn:    { fontSize: '12px', fontWeight: 500, color: '#993C1D', background: 'none', border: '1px solid #F5C4B3', borderRadius: '6px', cursor: 'pointer', padding: '5px 12px', fontFamily: 'inherit', flexShrink: 0, width: 'auto' },
  emptyCard:    { background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  emptyText:    { fontSize: '13px', color: '#9ca3af', margin: 0 },
  /* add card form */
  addCard:      { background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '24px', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  formRow:      { display: 'flex', gap: '14px', marginBottom: '14px' },
  formGroup:    { flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' },
  label:        { fontSize: '12px', fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input:        { padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#111', fontFamily: 'inherit', outline: 'none' },
  select:       { padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#111', background: 'white', fontFamily: 'inherit' },
  checkRow:     { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', cursor: 'pointer' },
  checkLabel:   { fontSize: '13px', color: '#374151', cursor: 'pointer' },
  addBtn:       { width: '100%', padding: '12px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '9px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  errorMsg:     { fontSize: '13px', color: '#993C1D', marginBottom: '10px', background: '#fff8f6', border: '1px solid #F5C4B3', borderRadius: '8px', padding: '8px 12px' },
  successMsg:   { fontSize: '13px', color: '#166534', marginBottom: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px' },
  backLink:     { fontSize: '13px', color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' },
};

function cardAbbr(type) {
  if (type === 'Visa') return 'VISA';
  if (type === 'Mastercard') return 'MC';
  if (type === 'American Express') return 'AMEX';
  if (type === 'Discover') return 'DISC';
  return type.slice(0, 4).toUpperCase();
}

export default function BillingMethods() {
  const [methods, setMethods] = useState([]);
  const [form, setForm] = useState({ cardType: 'Visa', lastFour: '', isDefault: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const loadMethods = () => {
    fetch(`${API}/patient/api/payment-methods`, { credentials: 'include' })
      .then(res => { if (res.status === 401) { navigate('/login'); return null; } return res.json(); })
      .then(data => { if (data) setMethods(data); });
  };

  useEffect(() => { loadMethods(); }, [navigate]);

  const handleAdd = async () => {
    setError('');
    setSuccess('');
    if (form.lastFour.length !== 4 || !/^\d{4}$/.test(form.lastFour)) {
      setError('Please enter exactly 4 digits for the card number.');
      return;
    }
    const res = await fetch(`${API}/patient/api/payment-methods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
      credentials: 'include',
    });
    if (res.ok) {
      setSuccess('Payment method added successfully.');
      setForm({ cardType: 'Visa', lastFour: '', isDefault: false });
      loadMethods();
    } else {
      setError('Failed to add payment method.');
    }
  };

  const handleRemove = async (id) => {
    await fetch(`${API}/patient/api/payment-methods/${id}`, { method: 'DELETE', credentials: 'include' });
    loadMethods();
  };

  return (
    <div style={s.body}>
      <Navbar />

      <div className="pt-banner">
        <div className="pt-banner__inner">
          <div className="pt-banner__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div>
            <h1 className="pt-banner__title">Payment Methods</h1>
            <p className="pt-banner__sub">Manage your saved cards</p>
          </div>
        </div>
      </div>

      <div style={s.wrap}>

        <p style={s.sectionLabel}>Saved cards</p>
        {methods.length === 0
          ? <div style={s.emptyCard}><p style={s.emptyText}>No payment methods saved yet.</p></div>
          : methods.map(m => (
            <div key={m.PaymentMethodID} style={s.methodCard}>
              <div style={s.chipWrap}>
                <span style={s.chipText}>{cardAbbr(m.CardType)}</span>
              </div>
              <div style={s.methodInfo}>
                <p style={s.methodTitle}>{m.CardType} •••• {m.LastFour}</p>
                <p style={s.methodSub}>Saved card</p>
              </div>
              {m.IsDefault && <span style={s.defaultBadge}>Default</span>}
              <button style={s.removeBtn} onClick={() => handleRemove(m.PaymentMethodID)}>Remove</button>
            </div>
          ))
        }

        <p style={{ ...s.sectionLabel, marginTop: '1.5rem' }}>Add a card</p>
        <div style={s.addCard}>
          <div style={s.formRow}>
            <div style={s.formGroup}>
              <label style={s.label}>Card type</label>
              <select style={s.select} value={form.cardType} onChange={e => setForm({ ...form, cardType: e.target.value })}>
                {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={s.formGroup}>
              <label style={s.label}>Last 4 digits</label>
              <input
                style={s.input}
                type="text"
                maxLength={4}
                placeholder="1234"
                value={form.lastFour}
                onChange={e => setForm({ ...form, lastFour: e.target.value.replace(/\D/g, '') })}
              />
            </div>
          </div>
          <label style={s.checkRow}>
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={e => setForm({ ...form, isDefault: e.target.checked })}
            />
            <span style={s.checkLabel}>Set as default payment method</span>
          </label>
          {error && <p style={s.errorMsg}>{error}</p>}
          {success && <p style={s.successMsg}>{success}</p>}
          <button style={s.addBtn} onClick={handleAdd}>Add card</button>
        </div>

        <a href="/patient/billing" style={s.backLink}>← Back to billing</a>
      </div>
    </div>
  );
}
