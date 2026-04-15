import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './UpdateProfile.css';

const GENDER_OPTIONS   = [{ value: '', label: 'Select…' }, { value: '1', label: 'Male' }, { value: '2', label: 'Female' }];
const RACE_OPTIONS     = [{ value: '', label: 'Select…' }, { value: '1', label: 'White' }, { value: '2', label: 'African' }, { value: '3', label: 'Asian' }];
const ETHNICITY_OPTIONS = [
  { value: '', label: 'Select…' },
  { value: '1', label: 'Hispanic' }, { value: '2', label: 'Latin American' },
  { value: '3', label: 'African' },  { value: '4', label: 'Caribbean' },
  { value: '5', label: 'Indian' },   { value: '6', label: 'Melanesian' },
  { value: '7', label: 'Chinese' },  { value: '8', label: 'Japanese' },
  { value: '9', label: 'Korean' },   { value: '10', label: 'Arabic' },
  { value: '11', label: 'European' },{ value: '12', label: 'Other' },
];

export default function UpdateProfile() {
  const [form, setForm] = useState({
    fName: '', mName: '', lName: '', dob: '',
    phone: '', address: '',
    genderCode: '', raceCode: '', ethnicityCode: '', hasInsurance: false,
  });
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/patient/api/profile', { credentials: 'include' })
      .then(res => { if (res.status === 401) { navigate('/login'); return null; } return res.json(); })
      .then(data => {
        if (!data) return;
        setEmail(data.Email || '');
        setForm({
          fName:        data.FName        || '',
          mName:        data.MName        || '',
          lName:        data.LName        || '',
          dob:          data.Dob ? data.Dob.slice(0, 10) : '',
          phone:        data.PhoneNumber  || '',
          address:      data.Address      || '',
          genderCode:   data.GenderCode   != null ? String(data.GenderCode) : '',
          raceCode:     data.RaceCode     != null ? String(data.RaceCode)   : '',
          ethnicityCode:data.EthnicityCode!= null ? String(data.EthnicityCode) : '',
          hasInsurance: !!data.HasInsurance,
        });
      });
  }, [navigate]);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = async e => {
    e.preventDefault();
    setError(''); setSaved('');
    const res = await fetch('/patient/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    });
    if (res.ok) setSaved('Your information has been saved.');
    else setError('Failed to save. Please try again.');
  };

  return (
    <>
      <Navbar />
      <div className="settings-page">
        <div className="settings-inner">

          <div className="settings-header">
            <h1 className="settings-title">Settings</h1>
            <p className="settings-sub">Update your personal and contact information.</p>
          </div>

          {saved && <div className="settings-banner settings-banner--success">{saved}</div>}
          {error && <div className="settings-banner settings-banner--error">{error}</div>}

          <form onSubmit={handleSave}>

            {/* ── Personal Information ──────────────────────── */}
            <section className="settings-section">
              <h2 className="settings-section__title">Personal Information</h2>
              <p className="settings-section__sub">Your name and date of birth.</p>
              <div className="settings-grid-3">
                <Field label="First Name"  value={form.fName}  onChange={v => set('fName', v)}  placeholder="First" required />
                <Field label="Middle Name" value={form.mName}  onChange={v => set('mName', v)}  placeholder="Middle" />
                <Field label="Last Name"   value={form.lName}  onChange={v => set('lName', v)}  placeholder="Last" required />
              </div>
              <div className="settings-grid-2" style={{ marginTop: '12px' }}>
                <Field label="Date of Birth" type="date" value={form.dob} onChange={v => set('dob', v)} />
                <div className="settings-field">
                  <label className="settings-label">Email Address <span style={{ color: '#9ca3af', fontWeight: 400 }}>(cannot be changed)</span></label>
                  <input className="settings-input" type="email" value={email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              </div>
            </section>

            {/* ── Contact Information ───────────────────────── */}
            <section className="settings-section">
              <h2 className="settings-section__title">Contact Information</h2>
              <p className="settings-section__sub">Your phone number and home address.</p>
              <div className="settings-grid-2">
                <Field label="Phone Number" type="text" value={form.phone}   onChange={v => set('phone', v)}   placeholder="(713) 555-0100" />
                <Field label="Home Address" type="text" value={form.address} onChange={v => set('address', v)} placeholder="123 Main St, Houston TX 77001" />
              </div>
            </section>

            {/* ── Demographics ──────────────────────────────── */}
            <section className="settings-section">
              <h2 className="settings-section__title">Demographics</h2>
              <p className="settings-section__sub">Gender, race, ethnicity, and insurance status.</p>
              <div className="settings-grid-3">
                <SelectField label="Gender"    value={form.genderCode}    onChange={v => set('genderCode', v)}    options={GENDER_OPTIONS} />
                <SelectField label="Race"      value={form.raceCode}      onChange={v => set('raceCode', v)}      options={RACE_OPTIONS} />
                <SelectField label="Ethnicity" value={form.ethnicityCode} onChange={v => set('ethnicityCode', v)} options={ETHNICITY_OPTIONS} />
              </div>
              <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="hasInsurance"
                  checked={form.hasInsurance}
                  onChange={e => set('hasInsurance', e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="hasInsurance" className="settings-label" style={{ margin: 0, cursor: 'pointer' }}>Has Insurance</label>
              </div>
            </section>

            <div className="settings-form__actions">
              <button type="submit" className="settings-btn-primary">Save Changes</button>
            </div>

          </form>

          <div className="settings-back">
            <button className="settings-btn-ghost" onClick={() => navigate(-1)}>← Back</button>
          </div>

        </div>
      </div>
    </>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, required }) {
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

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="settings-field">
      <label className="settings-label">{label}</label>
      <select className="settings-input" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
