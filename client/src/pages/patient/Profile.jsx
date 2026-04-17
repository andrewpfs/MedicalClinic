import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './patient-layout.css';

const QUICK_ACTIONS = [
  {
    path: '/patient/booking',
    icon: <CalendarIcon />,
    label: 'Book Appointment',
    sub: 'Schedule a new visit',
  },
  {
    path: '/patient/visits',
    icon: <ClipboardIcon />,
    label: 'Visit History',
    sub: 'View past & upcoming visits',
  },
  {
    path: '/patient/billing',
    icon: <CardIcon />,
    label: 'Billing',
    sub: 'Invoices & payment methods',
  },
  {
    path: '/patient/update-profile',
    icon: <GearIcon />,
    label: 'Settings',
    sub: 'Update personal information',
  },
];

export default function Profile() {
  const [patient, setPatient] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/patient/api/profile', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) { navigate('/login'); return null; }
        return res.json();
      })
      .then(data => { if (data) setPatient(data); })
      .catch(() => setError('Failed to load profile.'));
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('/patient/logout', { credentials: 'include' });
    navigate('/');
  };

  if (error) return (
    <div className="pt-page">
      <Navbar />
      <p style={{ padding: '40px', color: '#993C1D', fontSize: '14px' }}>{error}</p>
    </div>
  );

  if (!patient) return (
    <div className="pt-page">
      <Navbar />
      <p style={{ padding: '40px', color: '#6b7280', fontSize: '14px' }}>Loading…</p>
    </div>
  );

  const initials = `${patient.FName?.[0] ?? ''}${patient.LName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="pt-page">
      <Navbar />

      {/* ── Banner ───────────────────────────────────────────── */}
      <div className="pt-banner">
        <div className="pt-banner__inner">
          <div className="pt-banner__avatar">{initials}</div>
          <div>
            <h1 className="pt-banner__title">Welcome back, {patient.FName}.</h1>
            <p className="pt-banner__sub">
              MRN&nbsp;#{patient.PatientID}&nbsp;&nbsp;·&nbsp;&nbsp;Patient Portal
            </p>
          </div>
        </div>
      </div>

      <div className="pt-inner">

        {/* ── Quick actions ─────────────────────────────────── */}
        <p className="pt-section-label">Quick actions</p>
        <div className="pt-action-grid">
          {QUICK_ACTIONS.map(card => (
            <button
              key={card.path}
              className="pt-action-card"
              onClick={() => navigate(card.path)}
            >
              <div className="pt-action-card__icon">{card.icon}</div>
              <div className="pt-action-card__text">
                <span className="pt-action-card__label">{card.label}</span>
                <span className="pt-action-card__sub">{card.sub}</span>
              </div>
              <ChevronRightIcon />
            </button>
          ))}
        </div>

        {/* ── Your information ──────────────────────────────── */}
        <p className="pt-section-label" style={{ marginTop: '2rem' }}>Your information</p>
        <div className="pt-card">
          {[
            { label: 'Medical Record #', value: `#${patient.PatientID}` },
            {
              label: 'Full Name',
              value: `${patient.FName}${patient.MName ? ' ' + patient.MName : ''} ${patient.LName}`,
            },
            { label: 'Email Address', value: patient.Email },
            { label: 'Phone Number',  value: patient.PhoneNumber || '—' },
            { label: 'Address',       value: patient.Address || '—' },
            {
              label: 'Date of Birth',
              value: patient.Dob
                ? new Date(patient.Dob).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })
                : '—',
            },
          ].map((row, i, arr) => (
            <div
              key={row.label}
              className={`pt-info-row${i === arr.length - 1 ? ' pt-info-row--last' : ''}`}
            >
              <span className="pt-info-label">{row.label}</span>
              <span className="pt-info-value">{row.value}</span>
            </div>
          ))}
        </div>

        <button onClick={handleLogout} className="pt-signout">Sign out</button>
      </div>
    </div>
  );
}

/* ── SVG icons ───────────────────────────────────────────────── */

function CalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
