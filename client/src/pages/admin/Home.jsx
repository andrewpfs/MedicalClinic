import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStaffAuth } from '../../hooks/useStaffAuth'
import StaffNavbar from '../../components/StaffNavbar'
import API from '../../api'
import {
  shellPage, shellInner,
  adminHeroCard, adminHeroAccent, adminHeroContent,
  adminEyebrow, adminHeroTitle, adminHeroText,
  sectionLabel,
} from './adminStyles'

const quickCard = {
  background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.9)',
  borderRadius: '24px', padding: '26px', cursor: 'pointer',
  boxShadow: '0 18px 44px rgba(15,23,42,0.09)',
}
const cardIcon = {
  width: '48px', height: '48px', borderRadius: '14px', background: '#EAF3DE',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  marginBottom: '16px', fontSize: '13px', fontWeight: 500, color: '#1e2b1b',
  letterSpacing: '0.06em',
}
const cardTitle = { fontSize: '18px', fontWeight: 500, color: '#1e2b1b', marginBottom: '5px', margin: 0 }
const cardSub = { fontSize: '15px', color: '#64748b', margin: '5px 0 0', lineHeight: 1.45 }
const reportsCard = {
  background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.9)',
  borderRadius: '24px', overflow: 'hidden',
  boxShadow: '0 18px 44px rgba(15,23,42,0.09)',
}
const reportRow = {
  display: 'flex', alignItems: 'center', gap: '18px', padding: '22px 24px',
  borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
}
const reportRowLast = {
  display: 'flex', alignItems: 'center', gap: '18px', padding: '22px 24px', cursor: 'pointer',
}
const reportIcon = {
  width: '52px', height: '52px', borderRadius: '16px', background: '#EAF3DE',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  fontSize: '13px', fontWeight: 500, color: '#1e2b1b', letterSpacing: '0.06em',
}

const reportsHeader = {
  padding: '24px 24px 12px',
  borderBottom: '1px solid #f3f4f6',
}

const reportsTitle = {
  margin: 0,
  color: '#1e2b1b',
  fontSize: '24px',
  fontWeight: 500,
}

const reportsSub = {
  margin: '8px 0 0',
  color: '#64748b',
  fontSize: '16px',
  lineHeight: 1.55,
}

const quickLinks = [
  {
    icon: 'EMP',
    title: 'Employees',
    sub: 'View, add, and edit staff records',
    path: '/admin/employees',
  },
  {
    icon: 'DEPT',
    title: 'Departments',
    sub: 'Manage clinic departments and staff',
    path: '/admin/departments',
  },
  {
    icon: 'REP',
    title: 'Reports',
    sub: 'Review billing, revenue, quality, patient activity, and departments',
    path: '/admin/report?type=Invoice',
  },
]

const reports = [
  { icon: 'AR', title: 'Invoice Risk', sub: 'Find unpaid balances and prioritize patient billing follow-up.', type: 'Invoice' },
  { icon: 'REV', title: 'Revenue Performance', sub: 'Review completed revenue by department, doctor, patient, and date.', type: 'Revenue' },
  { icon: 'QA', title: 'Patient Experience', sub: 'Track satisfaction patterns across departments and providers.', type: 'Reviews' },
  { icon: 'PDR', title: 'Patient-Doctor Activity', sub: 'See patient-provider relationships, visit frequency, and last visit dates.', type: 'PatientDoctor' },
  { icon: 'DEP', title: 'Department Summary', sub: 'Compare department activity and spot operational differences.', type: 'Department' },
]

function AdminHome() {
  useStaffAuth('Admin')
  const navigate = useNavigate()
  const [adminName, setAdminName] = useState('')

  useEffect(() => {
    fetch(`${API}/api/employee/session`, { credentials: 'include' })
      .then(r => r.json())
      .then(s => { if (s.isLoggedIn) setAdminName(s.name || '') })
      .catch(() => {})
  }, [])

  return (
    <div style={shellPage}>
      <StaffNavbar />
      <div style={shellInner}>

        <div style={adminHeroCard}>
          <div style={adminHeroAccent} />
          <div style={adminHeroContent}>
            <p style={adminEyebrow}>Admin workspace</p>
            <h1 style={adminHeroTitle}>Welcome back{adminName ? `, ${adminName}` : ''}</h1>
            <p style={adminHeroText}>
              Manage employees, departments and review clinic-wide reports all from one place.
            </p>
          </div>
        </div>

        <p style={{ ...sectionLabel, marginBottom: '14px' }}>Quick access</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {quickLinks.map(link => (
            <div
              key={link.title}
              style={quickCard}
              onClick={() => navigate(link.path)}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 22px 54px rgba(15,23,42,0.14)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 18px 44px rgba(15,23,42,0.09)'}
            >
              <div style={cardIcon}>{link.icon}</div>
              <p style={cardTitle}>{link.title}</p>
              <p style={cardSub}>{link.sub}</p>
            </div>
          ))}
        </div>

        <div style={reportsCard}>
          <div style={reportsHeader}>
            <p style={{ ...sectionLabel, marginBottom: '8px' }}>Reports</p>
            <h2 style={reportsTitle}>What do you want to review?</h2>
            <p style={reportsSub}>Start with the admin question, then open the matching report with filters and results.</p>
          </div>
          {reports.map((r, i) => (
            <div
              key={r.title}
              style={i === reports.length - 1 ? reportRowLast : reportRow}
              onClick={() => navigate(`/admin/report?type=${r.type}`)}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={reportIcon}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={cardTitle}>{r.title}</p>
                <p style={cardSub}>{r.sub}</p>
              </div>
              <span style={{ fontSize: '24px', color: '#7c8a78', fontWeight: 400 }}>{'>'}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default AdminHome
