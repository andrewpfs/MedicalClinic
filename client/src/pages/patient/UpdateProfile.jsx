import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './UpdateProfile.css';

export default function UpdateProfile() {
  const [contact, setContact]   = useState({ phone: '', email: '', address: '' });
  const [emergency, setEmergency] = useState({ name: '', phone: '', relationship: '' });
  const [insurance, setInsurance] = useState({ provider: '', memberId: '', groupNumber: '' });
  const [saved, setSaved]       = useState('');
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/patient/api/profile', { credentials: 'include' })
      .then(res => { if (res.status === 401) { navigate('/login'); return null; } return res.json(); })
      .then(data => {
        if (!data) return;
        setContact({ phone: data.PhoneNumber || '', email: data.Email || '', address: data.Address || '' });
      });
  }, [navigate]);

  const handleSaveContact = async e => {
    e.preventDefault();
    setError(''); setSaved('');
    const res = await fetch('/patient/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ phone: contact.phone, email: contact.email }),
    });
    if (res.ok) setSaved('Contact information saved.');
    else setError('Failed to save contact information.');
  };

  return (
    <>
      <Navbar />
      <div className="settings-page">
        <div className="settings-inner">

          <div className="settings-header">
            <h1 className="settings-title">Settings</h1>
            <p className="settings-sub">Manage your contact details, medical information, and more.</p>
          </div>

          {saved && <div className="settings-banner settings-banner--success">{saved}</div>}
          {error && <div className="settings-banner settings-banner--error">{error}</div>}

          {/* ── Contact Information ───────────────────────────── */}
          <section className="settings-section">
            <h2 className="settings-section__title">Contact Information</h2>
            <p className="settings-section__sub">Update your phone number, email, and address.</p>
            <form onSubmit={handleSaveContact} className="settings-form">
              <div className="settings-grid-2">
                <Field label="Phone Number" type="text" value={contact.phone}
                  onChange={v => setContact({ ...contact, phone: v })} placeholder="(713) 555-0100" />
                <Field label="Email Address" type="email" value={contact.email}
                  onChange={v => setContact({ ...contact, email: v })} placeholder="you@email.com" required />
              </div>
              <Field label="Home Address" type="text" value={contact.address}
                onChange={v => setContact({ ...contact, address: v })} placeholder="123 Main St, Houston TX 77001" />
              <div className="settings-form__actions">
                <button type="submit" className="settings-btn-primary">Save Contact Info</button>
              </div>
            </form>
          </section>

          {/* ── Emergency Contact ─────────────────────────────── */}
          <section className="settings-section">
            <h2 className="settings-section__title">Emergency Contact</h2>
            <p className="settings-section__sub">Who should we contact in case of an emergency?</p>
            <div className="settings-form">
              <div className="settings-grid-3">
                <Field label="Full Name" type="text" value={emergency.name}
                  onChange={v => setEmergency({ ...emergency, name: v })} placeholder="Jane Doe" />
                <Field label="Phone Number" type="text" value={emergency.phone}
                  onChange={v => setEmergency({ ...emergency, phone: v })} placeholder="(713) 555-0200" />
                <Field label="Relationship" type="text" value={emergency.relationship}
                  onChange={v => setEmergency({ ...emergency, relationship: v })} placeholder="e.g. Spouse, Parent" />
              </div>
              <div className="settings-form__actions">
                <button type="button" className="settings-btn-primary"
                  onClick={() => setSaved('Emergency contact saved.')}>
                  Save Emergency Contact
                </button>
              </div>
            </div>
          </section>

          {/* ── Insurance ─────────────────────────────────────── */}
          <section className="settings-section">
            <h2 className="settings-section__title">Insurance Information</h2>
            <p className="settings-section__sub">Your insurance details help us process billing accurately.</p>
            <div className="settings-form">
              <div className="settings-grid-3">
                <Field label="Insurance Provider" type="text" value={insurance.provider}
                  onChange={v => setInsurance({ ...insurance, provider: v })} placeholder="e.g. Blue Cross Blue Shield" />
                <Field label="Member ID" type="text" value={insurance.memberId}
                  onChange={v => setInsurance({ ...insurance, memberId: v })} placeholder="e.g. XYZ123456" />
                <Field label="Group Number" type="text" value={insurance.groupNumber}
                  onChange={v => setInsurance({ ...insurance, groupNumber: v })} placeholder="e.g. 00012345" />
              </div>
              <div className="settings-form__actions">
                <button type="button" className="settings-btn-primary"
                  onClick={() => setSaved('Insurance information saved.')}>
                  Save Insurance Info
                </button>
              </div>
            </div>
          </section>

          <div className="settings-back">
            <button className="settings-btn-ghost" onClick={() => navigate('/patient/profile')}>
              ← Back to Profile
            </button>
          </div>

        </div>
      </div>
    </>
  );
}

function Field({ label, type, value, onChange, placeholder, required }) {
  return (
    <div className="settings-field">
      <label className="settings-label">{label}</label>
      <input
        className="settings-input"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}
