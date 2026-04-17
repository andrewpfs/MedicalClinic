import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddE from './AddE'
import EmployeeTable from './EmployeeTable'
import { useStaffAuth } from '../../hooks/useStaffAuth'
import { topbar, page, content, heading, subheading } from './adminStyles'

function Employees() {
  useStaffAuth('Admin')
  const navigate = useNavigate()
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div style={page}>
      <div style={topbar.bar}>
        <span style={topbar.title}>Admin Portal</span>
        <button style={topbar.btn} onClick={() => navigate('/admin/home')}>← Home</button>
      </div>
      <div style={content}>
        <h1 style={heading}>Employees</h1>
        <p style={subheading}>Manage staff records, add new employees, and edit existing ones</p>
        <AddE onSuccess={() => setRefreshKey(k => k + 1)} />
        <EmployeeTable refreshKey={refreshKey} />
      </div>
    </div>
  )
}

export default Employees