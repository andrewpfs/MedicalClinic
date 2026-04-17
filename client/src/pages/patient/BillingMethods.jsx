import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const CARD_TYPES = ['Visa', 'Mastercard', 'American Express', 'Discover'];

const styles = {
  wrap: { padding: '1.5rem', maxWidth: '560px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' },
  heading: { fontSize: '22px', fontWeight: 500, marginBottom: '1.5rem', color: '#1e2b1b' },
  sectionLabel: { fontSize: '12px', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' },
  card: { background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' },
  methodRow: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' },
  methodRowLast: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px' },
  methodIcon: { width: '40px', height: '26px', background: '#1e2b1b', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  methodIconText: { fontSize: '9px', fontWeight: 700, color: 'white', textAlign: 'center' },
  methodInfo: { flex: 1 },
  methodTitle: { fontSize: '14px', fontWeight: 500, color: '#1e2b1b', margin: 0 },
  methodSub: { fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' },
  defaultBadge: { fontSize: '11px', padding: '2px 8px', borderRadius: '99px', background: '#EAF3DE', color: '#3B6D11', border: '1px solid #C0DD97' },
  removeBtn: { fontSize: '12px', color: '#993C1D', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', width: 'auto' },
  emptyMsg: { fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', padding: '1.5rem 20px' },
  addCard: { background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' },
  addHeading: { fontSize: '15px', fontWeight: 500, color: '#1e2b1b', marginBottom: '1rem' },
  formRow: { display: 'flex', gap: '12px', marginBottom: '12px' },
  formGroup: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '12px', color: '#6b7280', fontWeight: 500 },
  input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', color: '#111' },
  select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', color: '#111', background: 'white' },
  checkRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' },
  checkLabel: { fontSize: '13px', color: '#374151' },
  addBtn: { width: '100%', padding: '10px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' },
  errorMsg: { fontSize: '13px', color: '#993C1D', marginBottom: '0.5rem' },
  successMsg: { fontSize: '13px', color: '#3B6D11', marginBottom: '0.5rem' },
  backLink: { fontSize: '13px', color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' },
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
    fetch('/patient/api/payment-methods', { credentials: 'include' })
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
    const res = await fetch('/patient/api/payment-methods', {
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
    await fetch(`/patient/api/payment-methods/${id}`, { method: 'DELETE', credentials: 'include' });
    loadMethods();
  };

  return (
    <>
      <Navbar />
      <div style={styles.wrap}>
      <h1 style={styles.heading}>Payment methods</h1>

      <p style={styles.sectionLabel}>Saved cards</p>
      <div style={styles.card}>
        {methods.length === 0
          ? <p style={styles.emptyMsg}>No payment methods saved yet.</p>
          : methods.map((m, i) => (
            <div key={m.PaymentMethodID} style={i === methods.length - 1 ? styles.methodRowLast : styles.methodRow}>
              <div style={styles.methodIcon}>
                <span style={styles.methodIconText}>{cardAbbr(m.CardType)}</span>
              </div>
              <div style={styles.methodInfo}>
                <p style={styles.methodTitle}>{m.CardType} •••• {m.LastFour}</p>
                <p style={styles.methodSub}>Saved card</p>
              </div>
              {m.IsDefault ? <span style={styles.defaultBadge}>Default</span> : null}
              <button style={styles.removeBtn} onClick={() => handleRemove(m.PaymentMethodID)}>Remove</button>
            </div>
          ))
        }
      </div>

      <p style={styles.sectionLabel}>Add a card</p>
      <div style={styles.addCard}>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Card type</label>
            <select
              style={styles.select}
              value={form.cardType}
              onChange={e => setForm({ ...form, cardType: e.target.value })}
            >
              {CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Last 4 digits</label>
            <input
              style={styles.input}
              type="text"
              maxLength={4}
              placeholder="1234"
              value={form.lastFour}
              onChange={e => setForm({ ...form, lastFour: e.target.value.replace(/\D/g, '') })}
            />
          </div>
        </div>
        <div style={styles.checkRow}>
          <input
            type="checkbox"
            id="isDefault"
            checked={form.isDefault}
            onChange={e => setForm({ ...form, isDefault: e.target.checked })}
          />
          <label htmlFor="isDefault" style={styles.checkLabel}>Set as default payment method</label>
        </div>
        {error && <p style={styles.errorMsg}>{error}</p>}
        {success && <p style={styles.successMsg}>{success}</p>}
        <button style={styles.addBtn} onClick={handleAdd}>Add card</button>
      </div>

      <a href="/patient/billing" style={styles.backLink}>← Back to billing</a>
    </div>
    </>
  );
}
