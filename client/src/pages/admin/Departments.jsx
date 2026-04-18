import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddD from './AddD'
import DepartmentTable from './DepartmentTable'
import { useStaffAuth } from '../../hooks/useStaffAuth'
import { topbar, page, content, heading, subheading } from './adminStyles'

function Departments() {
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
        <h1 style={heading}>Departments</h1>
        <p style={subheading}>Manage staff records, add new departments, and edit existing ones</p>
        <AddD onSuccess={() => setRefreshKey(k => k + 1)} />
        <DepartmentTable refreshKey={refreshKey} />
      </div>
    </div>
  )
}

export default Departments