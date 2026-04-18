import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddD from './AddD'
import DepartmentTable from './DepartmentTable'
import { useStaffAuth } from '../../hooks/useStaffAuth'
import StaffNavbar from '../../components/StaffNavbar'
import {
  shellPage, shellInner,
  adminHeroCard, adminHeroAccent, adminHeroContent,
  adminEyebrow, adminHeroTitle, adminHeroText,
} from './adminStyles'

function Departments() {
  useStaffAuth('Admin')
  const navigate = useNavigate()
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div style={shellPage}>
      <StaffNavbar />
      <div style={shellInner}>

        <div style={adminHeroCard}>
          <div style={adminHeroAccent} />
          <div style={adminHeroContent}>
            <p style={adminEyebrow}>Clinic structure</p>
            <h1 style={adminHeroTitle}>Departments</h1>
            <p style={adminHeroText}>Manage clinic departments, assign staff, and keep department records up to date.</p>
            <button
              onClick={() => navigate('/admin/home')}
              style={{ marginTop: '18px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', color: 'white', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ← Back to home
            </button>
          </div>
        </div>

        <AddD onSuccess={() => setRefreshKey(k => k + 1)} />
        <DepartmentTable refreshKey={refreshKey} />

      </div>
    </div>
  )
}

export default Departments
