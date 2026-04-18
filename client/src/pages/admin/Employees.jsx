import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddE from './AddE'
import EmployeeTable from './EmployeeTable'
import { useStaffAuth } from '../../hooks/useStaffAuth'
import StaffNavbar from '../../components/StaffNavbar'
import {
  shellPage, shellInner,
  adminHeroCard, adminHeroAccent, adminHeroContent,
  adminEyebrow, adminHeroTitle, adminHeroText,
} from './adminStyles'

function Employees() {
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
            <p style={adminEyebrow}>Staff management</p>
            <h1 style={adminHeroTitle}>Employees</h1>
            <p style={adminHeroText}>View, add, and edit staff records across all departments and roles.</p>
            <button
              onClick={() => navigate('/admin/home')}
              style={{ marginTop: '18px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', color: 'white', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ← Back to home
            </button>
          </div>
        </div>

        <AddE onSuccess={() => setRefreshKey(k => k + 1)} />
        <EmployeeTable refreshKey={refreshKey} />

      </div>
    </div>
  )
}

export default Employees
