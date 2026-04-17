import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './patient-layout.css';

const styles = {
  wrap: { padding: '1.5rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' },
  heading: { fontSize: '22px', fontWeight: 500, marginBottom: '0.25rem', color: '#1e2b1b' },
  subheading: { fontSize: '13px', color: '#6b7280', marginBottom: '1.5rem' },
  amountCard: { background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' },
  amountLabel: { fontSize: '13px', color: '#6b7280', marginBottom: '0.5rem' },
  amount: { fontSize: '42px', fontWeight: 500, color: '#1e2b1b' },
  amountZero: { fontSize: '42px', fontWeight: 500, color: '#639922' },
  menuCard: { background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '1.5rem' },
  menuItem: { display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.15s' },
  menuItemLast: { display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer', transition: 'background 0.15s' },
  menuIcon: { width: '36px', height: '36px', borderRadius: '8px', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 },
  menuText: { flex: 1 },
  menuTitle: { fontSize: '14px', fontWeight: 500, color: '#1e2b1b', margin: 0 },
  menuSub: { fontSize: '12px', color: '#9ca3af', margin: 0 },
  arrow: { fontSize: '16px', color: '#9ca3af' },
  backLink: { fontSize: '13px', color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' },
};

export default function Billing() {
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/patient/api/payments', { credentials: 'include' })
      .then(res => { if (res.status === 401) { navigate('/login'); return null; } return res.json(); })
      .then(data => {
        if (!data) return;
        const total = data.reduce((sum, inv) => sum + parseFloat(inv.Amount), 0);
        setTotalDue(total);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [navigate]);

  return (
    <div className="pt-page">
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
            <h1 className="pt-banner__title">Billing</h1>
            <p className="pt-banner__sub">Manage your invoices and payment methods</p>
          </div>
        </div>
      </div>

      <div style={styles.wrap}>
      <h1 style={styles.heading}>Billing</h1>
      <p style={styles.subheading}>Manage your invoices and payment methods</p>

      <div style={styles.amountCard}>
        <p style={styles.amountLabel}>Amount Due</p>
        <p style={totalDue === 0 ? styles.amountZero : styles.amount}>
          ${loading ? '—' : totalDue.toFixed(2)}
        </p>
      </div>

      <div style={styles.menuCard}>
        <div
          style={styles.menuItem}
          onClick={() => navigate('/patient/billing/balance')}
          onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={e => e.currentTarget.style.background = 'white'}
        >
          <div style={styles.menuIcon}>📋</div>
          <div style={styles.menuText}>
            <p style={styles.menuTitle}>View balance details</p>
            <p style={styles.menuSub}>See outstanding invoices and payment history</p>
          </div>
          <span style={styles.arrow}>›</span>
        </div>

        <div
          style={styles.menuItemLast}
          onClick={() => navigate('/patient/billing/methods')}
          onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={e => e.currentTarget.style.background = 'white'}
        >
          <div style={styles.menuIcon}>💳</div>
          <div style={styles.menuText}>
            <p style={styles.menuTitle}>Manage payment methods</p>
            <p style={styles.menuSub}>Add or remove saved cards</p>
          </div>
          <span style={styles.arrow}>›</span>
        </div>
      </div>

      <a href="/patient/profile" style={styles.backLink}>← Back to profile</a>
    </div>
    </div>
  );
}
