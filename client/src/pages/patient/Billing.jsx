import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function Billing() {
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/patient/api/payments', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          navigate('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        const total = data.reduce((sum, invoice) => sum + parseFloat(invoice.Amount), 0);
        setTotalDue(total);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  return (
    <div style={pageShell}>
      <Navbar />
      <div style={pageInner}>
        <section style={heroCard}>
          <div>
            <p style={eyebrow}>Billing center</p>
            <h1 style={heroTitle}>Stay on top of your clinic balance</h1>
            <p style={heroText}>
              Review balances, payment history, and saved cards from a single billing workspace designed to be quicker to scan and easier to act on.
            </p>
          </div>
          <div style={heroAmountCard}>
            <div style={heroAmountLabel}>Current amount due</div>
            <div style={heroAmountValue}>${loading ? '--' : totalDue.toFixed(2)}</div>
            <div style={heroAmountSub}>{totalDue === 0 ? 'You are all caught up.' : 'Outstanding balances are ready for payment.'}</div>
          </div>
        </section>

        <section style={menuGrid}>
          <button type="button" onClick={() => navigate('/patient/billing/balance')} style={menuCard}>
            <div style={{ ...menuIcon, background: '#dbeafe' }}>01</div>
            <div style={menuTitle}>Balance details</div>
            <p style={menuText}>Open invoices, payment history, and the quickest route to pay your balance.</p>
            <span style={menuLink}>Open balance view</span>
          </button>

          <button type="button" onClick={() => navigate('/patient/billing/methods')} style={menuCard}>
            <div style={{ ...menuIcon, background: '#dcfce7' }}>02</div>
            <div style={menuTitle}>Payment methods</div>
            <p style={menuText}>Add or remove saved cards so future payments take fewer steps.</p>
            <span style={menuLink}>Manage cards</span>
          </button>
        </section>
      </div>
    </div>
  );
}

const pageShell = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at top left, #f3fbf7 0%, #f8fafc 52%, #eef2ff 100%)',
  fontFamily: '"Poppins", sans-serif',
};

const pageInner = {
  maxWidth: '1120px',
  margin: '0 auto',
  padding: '28px 24px 64px',
};

const heroCard = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
  gap: '20px',
  alignItems: 'center',
  padding: '30px',
  borderRadius: '30px',
  background: 'linear-gradient(135deg, #1d3059 0%, #27567b 48%, #1f7a6a 100%)',
  color: '#ffffff',
  boxShadow: '0 24px 60px rgba(29, 48, 89, 0.18)',
};

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
  fontSize: 'clamp(28px, 4vw, 42px)',
  lineHeight: 1.08,
};

const heroText = {
  margin: 0,
  maxWidth: '660px',
  fontSize: '15px',
  lineHeight: 1.7,
  color: 'rgba(255,255,255,0.9)',
};

const heroAmountCard = {
  borderRadius: '22px',
  padding: '18px 20px',
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.18)',
};

const heroAmountLabel = {
  fontSize: '12px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  opacity: 0.82,
};

const heroAmountValue = {
  marginTop: '10px',
  fontSize: '38px',
  fontWeight: 700,
  lineHeight: 1,
};

const heroAmountSub = {
  marginTop: '8px',
  fontSize: '13px',
  color: 'rgba(255,255,255,0.82)',
  lineHeight: 1.6,
};

const menuGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '18px',
  marginTop: '22px',
};

const menuCard = {
  textAlign: 'left',
  border: '1px solid rgba(255,255,255,0.95)',
  borderRadius: '26px',
  background: 'rgba(255,255,255,0.9)',
  boxShadow: '0 18px 44px rgba(15, 23, 42, 0.08)',
  padding: '24px',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const menuIcon = {
  width: '44px',
  height: '44px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '13px',
  fontWeight: 800,
  color: '#0f172a',
};

const menuTitle = {
  marginTop: '16px',
  fontSize: '20px',
  fontWeight: 700,
  color: '#0f172a',
};

const menuText = {
  margin: '8px 0 18px',
  color: '#64748b',
  fontSize: '14px',
  lineHeight: 1.65,
};

const menuLink = {
  color: '#1d4ed8',
  fontSize: '13px',
  fontWeight: 700,
};
