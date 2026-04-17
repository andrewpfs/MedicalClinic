import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStaffAuth } from '../../hooks/useStaffAuth'

const styles = {
  page: { background: '#f5f3ee', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' },
  topbar: { background: '#1e2b1b', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' },
  topbarTitle: { color: '#d4e6b5', fontSize: '15px', fontWeight: 500, letterSpacing: '0.02em' },
  topbarNav: { display: 'flex', gap: '8px' },
  navBtn: { fontSize: '13px', padding: '6px 16px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#d4e6b5', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' },
  content: { maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' },
  welcome: { fontSize: '22px', fontWeight: 500, color: '#1e2b1b', marginBottom: '0.25rem' },
  welcomeSub: { fontSize: '13px', color: '#6b7280', marginBottom: '2rem' },
  sectionLabel: { fontSize: '11px', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.75rem' },
  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '2rem' },
  quickCard: { background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', cursor: 'pointer' },
  cardIcon: { width: '36px', height: '36px', borderRadius: '8px', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', fontSize: '16px' },
  cardTitle: { fontSize: '14px', fontWeight: 500, color: '#1e2b1b', marginBottom: '3px' },
  cardSub: { fontSize: '12px', color: '#9ca3af' },
  reportsCard: { background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem' },
  reportRow: { display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' },
  reportRowLast: { display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' },
  reportIcon: { width: '36px', height: '36px', borderRadius: '8px', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px' },
  reportText: { flex: 1 },
  reportTitle: { fontSize: '14px', fontWeight: 500, color: '#1e2b1b', margin: 0 },
  reportSub: { fontSize: '12px', color: '#9ca3af', margin: '2px 0 0' },
  arrow: { fontSize: '18px', color: '#9ca3af' },
  startBtn: { padding: '11px 28px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'Poppins, sans-serif' },
}

const reports = [
  { icon: '💰', title: 'General Revenue Report', sub: 'Departments ranked by revenue generated over a date range', type: 'RepGRR' },
  { icon: '📋', title: 'Revenue Report', sub: 'Doctors within a department ranked by appointments', type: 'Revenue' },
  { icon: '💳', title: 'Reviews Report', sub: 'Full transaction log with filters by department and date', type: 'Reviews' },
]

function AdminHome() {
  useStaffAuth('Admin')
  const navigate = useNavigate()

  const handleLogout = async () => {
    await fetch('/admin/logout', { credentials: 'include' })
    navigate('/')
  }

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <span style={styles.topbarTitle}>Admin Portal</span>
        <div style={styles.topbarNav}>
            <button style={styles.navBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </div>

      <div style={styles.content}>
        <h1 style={styles.welcome}>Welcome back</h1>
        <p style={styles.welcomeSub}>Here's an overview of your admin tools</p>

        <p style={styles.sectionLabel}>Quick access</p>
        <div style={styles.quickGrid}>
          <div style={styles.quickCard} onClick={() => navigate('/admin/employees')}>
            <div style={styles.cardIcon}>👥</div>
            <p style={styles.cardTitle}>Employees</p>
            <p style={styles.cardSub}>View, add, and edit staff records</p>
          </div>
          <div style={styles.quickCard} onClick={() => navigate('/admin/report')}>
            <div style={styles.cardIcon}>📅</div>
            <p style={styles.cardTitle}>All appointments</p>
            <p style={styles.cardSub}>Browse and filter appointment records</p>
          </div>
        </div>

        <p style={styles.sectionLabel}>Reports</p>
        <div style={styles.reportsCard}>
          {reports.map((r, i) => (
            <div
              key={r.title}
              style={i === reports.length - 1 ? styles.reportRowLast : styles.reportRow}
              onClick={() => navigate(`/admin/report?type=${r.type}`)}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              <div style={styles.reportIcon}>{r.icon}</div>
              <div style={styles.reportText}>
                <p style={styles.reportTitle}>{r.title}</p>
                <p style={styles.reportSub}>{r.sub}</p>
              </div>
              <span style={styles.arrow}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminHome