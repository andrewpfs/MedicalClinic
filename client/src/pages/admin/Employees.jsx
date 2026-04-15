import { useNavigate } from 'react-router-dom'
import AddE from './AddE'
import EmployeeTable from './EmployeeTable'
import { useStaffAuth } from '../../hooks/useStaffAuth'
import { topbar, page, content, heading, subheading } from './adminStyles'

function Employees() {
  useStaffAuth('Admin')
  const navigate = useNavigate()

  return (
    <div style={page}>
      <div style={topbar.bar}>
        <span style={topbar.title}>Admin Portal</span>
        <button style={topbar.btn} onClick={() => navigate('/admin/home')}>← Home</button>
      </div>
      <div style={content}>
        <h1 style={heading}>Employees</h1>
        <p style={subheading}>Manage staff records, add new employees, and edit existing ones</p>
        <AddE />
        <EmployeeTable />
      </div>
    </div>
  )
}

export default Employees