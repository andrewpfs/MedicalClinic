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

const heroButton = {
  background: 'rgba(255,255,255,0.15)',
  border: '1px solid rgba(255,255,255,0.25)',
  borderRadius: '999px',
  color: 'white',
  padding: '12px 18px',
  fontSize: '15px',
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
}

const heroActions = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '18px',
}


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
            <div style={heroActions}>
              <button type="button" onClick={() => navigate('/admin/home')} style={heroButton}>Back to home</button>
              <button type="button" onClick={() => navigate('/admin/report?type=Invoice')} style={heroButton}>View Reports</button>
              <button type="button" onClick={() => navigate('/admin/employees')} style={heroButton}>Manage employees</button>
            </div>
          </div>
        </div>

        <AddD onSuccess={() => setRefreshKey(k => k + 1)} />
        <DepartmentTable refreshKey={refreshKey} />

      </div>
    </div>
  )
}

export default Departments
