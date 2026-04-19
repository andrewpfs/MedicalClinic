import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './patient-layout.css';
import API from '../../api';

const QUICK_ACTIONS = [
  { path: '/patient/booking', title: 'Find a doctor', description: 'Compare doctors and book from the weekly planner.', accent: '#dcfce7' },
  { path: '/patient/visits', title: 'Manage visits', description: 'Review past appointments, reschedule, and leave doctor feedback.', accent: '#dbeafe' },
  { path: '/patient/billing', title: 'Billing center', description: 'See balances, payment history, and saved cards in one place.', accent: '#fef3c7' },
  { path: '/patient/update-profile', title: 'Profile settings', description: 'Keep address, phone, and insurance details up to date.', accent: '#ede9fe' },
];

export default function Profile() {
  const [patient, setPatient] = useState(null);
  const [stats, setStats] = useState({ upcoming: 0, reviewsReady: 0, totalDue: 0 });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      fetch(`${API}/patient/api/profile`, { credentials: 'include' }),
      fetch(`${API}/patient/api/visits`, { credentials: 'include' }),
      fetch(`${API}/patient/api/payments`, { credentials: 'include' }),
    ])
      .then(async ([profileRes, visitsRes, billingRes]) => {
        if (profileRes.status === 401) {
          navigate('/login');
          return null;
        }

        const [profile, visits, billing] = await Promise.all([
          profileRes.json(),
          visitsRes.json(),
          billingRes.json(),
        ]);

        return { profile, visits, billing };
      })
      .then((payload) => {
        if (!payload) return;

        setPatient(payload.profile);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = payload.visits.filter((visit) => new Date(visit.AppointmentDate) >= today && visit.Status !== 'Cancelled').length;
        const reviewsReady = payload.visits.filter((visit) => Number(visit.CanReview) === 1).length;
        const totalDue = payload.billing.reduce((sum, invoice) => sum + Number(invoice.Amount || 0), 0);

        setStats({ upcoming, reviewsReady, totalDue });
      })
      .catch(() => setError('Failed to load profile.'));
  }, [navigate]);

  const handleLogout = async () => {
    await fetch(`${API}/patient/logout`, { credentials: 'include' });
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

  return (
    <div style={pageShell}>
      <Navbar />
      <div style={pageInner}>
        <section style={heroCard}>
          <div style={heroCopy}>
            <p style={eyebrow}>Patient overview</p>
            <h1 style={heroTitle}>Welcome back, {patient.FName}.</h1>
            <p style={heroText}>
              Your portal now keeps scheduling, visits, billing, and doctor reviews connected in one place so the next action is always easy to find.
            </p>
          </div>
          <div style={heroStats}>
            <HeroStat label="Upcoming visits" value={stats.upcoming} />
            <HeroStat label="Reviews ready" value={stats.reviewsReady} />
            <HeroStat label="Amount due" value={`$${stats.totalDue.toFixed(2)}`} />
          </div>
        </section>

        <section style={cardGrid}>
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.path}
              type="button"
              onClick={() => navigate(action.path)}
              style={actionCard}
            >
              <span style={{ ...actionAccent, background: action.accent }} />
              <div style={actionTitle}>{action.title}</div>
              <p style={actionText}>{action.description}</p>
            </button>
          ))}
        </section>

        <section style={detailsLayout}>
          <article style={surfaceCard}>
            <h2 style={sectionTitle}>Patient details</h2>
            <div style={detailList}>
              <DetailRow label="Medical record number" value={patient.PatientID} />
              <DetailRow label="Patient name" value={`${patient.FName} ${patient.LName}`} />
              <DetailRow label="Email" value={patient.Email || 'Not set'} />
              <DetailRow label="Contact number" value={patient.PhoneNumber || 'Not set'} />
              <DetailRow label="Address" value={patient.Address || 'Not set'} />
              <DetailRow label="Date of birth" value={patient.Dob ? new Date(patient.Dob).toLocaleDateString() : 'Not set'} />
            </div>
          </article>

          <article style={surfaceCard}>
            <h2 style={sectionTitle}>Recommended next steps</h2>
            <div style={nextStepList}>
              <NextStep
                title="Find your next appointment"
                body="Use the doctor cards to compare specialties and ratings before you book."
                action="Open scheduling"
                onClick={() => navigate('/patient/booking')}
              />
              <NextStep
                title="Review completed visits"
                body="Completed appointments can now collect doctor feedback directly from Visit History."
                action="Go to visits"
                onClick={() => navigate('/patient/visits')}
              />
              <NextStep
                title="Keep billing current"
                body="Outstanding balances and saved payment methods now live under one billing center."
                action="Open billing"
                onClick={() => navigate('/patient/billing')}
              />
            </div>
          </article>
        </section>

        <button type="button" onClick={handleLogout} style={logoutButton}>
          Sign out
        </button>
      </div>
    </div>
  );
}

function HeroStat({ label, value }) {
  return (
    <div style={heroStat}>
      <div style={heroStatValue}>{value}</div>
      <div style={heroStatLabel}>{label}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={detailRow}>
      <div style={detailLabel}>{label}</div>
      <div style={detailValue}>{value}</div>
    </div>
  );
}

function NextStep({ title, body, action, onClick }) {
  return (
    <div style={nextStepCard}>
      <div style={nextStepTitle}>{title}</div>
      <p style={nextStepBody}>{body}</p>
      <button type="button" onClick={onClick} style={nextStepButton}>{action}</button>
    </div>
  );
}

const pageShell = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at top left, #f3fbf7 0%, #f8fafc 52%, #eef2ff 100%)',
  fontFamily: '"Poppins", sans-serif',
};

const pageInner = {
  maxWidth: '1240px',
  margin: '0 auto',
  padding: '28px 24px 64px',
};

const heroCard = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
  gap: '22px',
  alignItems: 'center',
  padding: '30px',
  borderRadius: '30px',
  background: 'linear-gradient(135deg, #0f3a2e 0%, #145f4c 52%, #2b8a73 100%)',
  color: '#ffffff',
  boxShadow: '0 24px 60px rgba(15, 58, 46, 0.18)',
};

const heroCopy = {};

const eyebrow = {
  margin: 0,
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  fontWeight: 700,
  opacity: 0.82,
};

const heroTitle = {
  margin: '10px 0 12px',
  fontSize: 'clamp(30px, 5vw, 44px)',
  lineHeight: 1.04,
};

const heroText = {
  margin: 0,
  maxWidth: '680px',
  fontSize: '15px',
  lineHeight: 1.7,
  color: 'rgba(255,255,255,0.9)',
};

const heroStats = {
  display: 'grid',
  gap: '12px',
};

const heroStat = {
  borderRadius: '18px',
  padding: '16px 18px',
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.18)',
};

const heroStatValue = {
  fontSize: '28px',
  fontWeight: 700,
  lineHeight: 1,
};

const heroStatLabel = {
  marginTop: '6px',
  fontSize: '12px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  opacity: 0.82,
};

const cardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  gap: '18px',
  marginTop: '22px',
};

const actionCard = {
  position: 'relative',
  overflow: 'hidden',
  textAlign: 'left',
  border: '1px solid rgba(255,255,255,0.95)',
  borderRadius: '24px',
  background: 'rgba(255,255,255,0.9)',
  boxShadow: '0 18px 44px rgba(15, 23, 42, 0.08)',
  padding: '22px',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const actionAccent = {
  position: 'absolute',
  width: '120px',
  height: '120px',
  borderRadius: '999px',
  top: '-40px',
  right: '-20px',
  opacity: 0.95,
};

const actionTitle = {
  position: 'relative',
  fontSize: '18px',
  fontWeight: 700,
  color: '#0f172a',
};

const actionText = {
  position: 'relative',
  margin: '10px 0 0',
  color: '#64748b',
  fontSize: '14px',
  lineHeight: 1.65,
};

const detailsLayout = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
  gap: '18px',
  marginTop: '22px',
};

const surfaceCard = {
  background: 'rgba(255,255,255,0.9)',
  borderRadius: '26px',
  border: '1px solid rgba(255,255,255,0.95)',
  boxShadow: '0 18px 44px rgba(15, 23, 42, 0.08)',
  padding: '24px',
};

const sectionTitle = {
  margin: 0,
  fontSize: '20px',
  color: '#0f172a',
};

const detailList = {
  marginTop: '18px',
  borderRadius: '20px',
  overflow: 'hidden',
  border: '1px solid #e2e8f0',
};

const detailRow = {
  display: 'grid',
  gridTemplateColumns: '200px minmax(0, 1fr)',
  borderBottom: '1px solid #e2e8f0',
};

const detailLabel = {
  padding: '14px 16px',
  background: '#f8fafc',
  color: '#475569',
  fontSize: '13px',
  fontWeight: 700,
};

const detailValue = {
  padding: '14px 16px',
  color: '#0f172a',
  fontSize: '14px',
};

const nextStepList = {
  display: 'grid',
  gap: '14px',
  marginTop: '18px',
};

const nextStepCard = {
  borderRadius: '20px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  padding: '18px',
};

const nextStepTitle = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#0f172a',
};

const nextStepBody = {
  margin: '8px 0 14px',
  color: '#64748b',
  fontSize: '14px',
  lineHeight: 1.6,
};

const nextStepButton = {
  border: 'none',
  borderRadius: '14px',
  background: '#123524',
  color: '#ffffff',
  padding: '10px 14px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const logoutButton = {
  marginTop: '22px',
  border: 'none',
  background: 'transparent',
  color: '#64748b',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};
