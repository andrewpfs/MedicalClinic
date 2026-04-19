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
  borderRadius: '24px', padding: '20px', cursor: 'pointer',
  boxShadow: '0 18px 44px rgba(15,23,42,0.09)',
}
const cardIcon = {
  width: '36px', height: '36px', borderRadius: '8px', background: '#EAF3DE',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  marginBottom: '12px', fontSize: '16px',
}
const cardTitle = { fontSize: '14px', fontWeight: 500, color: '#1e2b1b', marginBottom: '3px', margin: 0 }
const cardSub   = { fontSize: '12px', color: '#9ca3af', margin: '3px 0 0' }
const reportsCard = {
  background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(255,255,255,0.9)',
  borderRadius: '24px', overflow: 'hidden',
  boxShadow: '0 18px 44px rgba(15,23,42,0.09)',
}
const reportRow = {
  display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px',
  borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
}
const reportRowLast = {
  display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer',
}
const reportIcon = {
  width: '36px', height: '36px', borderRadius: '8px', background: '#EAF3DE',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px',
}

const reports = [
  { icon: '💰', title: 'Invoice Report',         sub: 'Invoices that have been left unpaid and the amount that each is due',          type: 'Invoice'       },
  { icon: '📋', title: 'Revenue Report',         sub: 'Transactions that have been completed and how much revenue has been achieved',  type: 'Revenue'       },
  { icon: '⭐', title: 'Reviews Report',         sub: 'Patient satisfaction ratings filtered by department, doctor, and date',        type: 'Reviews'       },
  { icon: '🩺', title: 'Patient–Doctor Report',  sub: 'Which patients are seeing which doctors, visit frequency, and last visit date', type: 'PatientDoctor' },
  { icon: '⭐', title: 'Department Report',  sub: 'See Summarized Data of Departments and Compare to other Departments', type: 'Department'  },
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
              Manage employees, departments, appointments, and review clinic-wide reports all from one place.
            </p>
          </div>
        </div>

        <p style={{ ...sectionLabel, marginBottom: '12px' }}>Quick access</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          <div style={quickCard}
            onClick={() => navigate('/admin/employees')}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 22px 54px rgba(15,23,42,0.14)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 18px 44px rgba(15,23,42,0.09)'}
          >
            <div style={cardIcon}>👥</div>
            <p style={cardTitle}>Employees</p>
            <p style={cardSub}>View, add, and edit staff records</p>
          </div>
          <div style={quickCard}
            onClick={() => navigate('/admin/departments')}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 22px 54px rgba(15,23,42,0.14)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 18px 44px rgba(15,23,42,0.09)'}
          >
            <div style={cardIcon}>🏥</div>
            <p style={cardTitle}>Departments</p>
            <p style={cardSub}>Manage clinic departments and staff</p>
          </div>
          <div style={quickCard}
            onClick={() => navigate('/admin/report?type=AllAppt')}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 22px 54px rgba(15,23,42,0.14)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 18px 44px rgba(15,23,42,0.09)'}
          >
            <div style={cardIcon}>📅</div>
            <p style={cardTitle}>All Appointments</p>
            <p style={cardSub}>Browse and filter appointment records</p>
          </div>
        </div>

        <p style={{ ...sectionLabel, marginBottom: '12px' }}>Reports</p>
        <div style={reportsCard}>
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
              <span style={{ fontSize: '18px', color: '#9ca3af' }}>›</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default AdminHome
