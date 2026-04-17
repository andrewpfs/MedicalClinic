import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import RepDAR from './RepDAR'
import RepGAR from './RepGAR'
import RepGRR from './RepGRR'
import RepAllAppt from './RepAllAppt'
import RepAllTrans from './RepAllTrans'
import RevenueReport from './RevenueReport'
import { useStaffAuth } from '../../hooks/useStaffAuth'
import { topbar, page, content, heading, subheading } from './adminStyles'

const REPORT_META = {
  AllAppt:  { title: 'All Appointments',              sub: 'Browse and filter all appointment records by department and date' },
  AllTrans: { title: 'All Transactions',              sub: 'Browse and filter all transaction records by department and date' },
  RepDAR:   { title: 'Department Appointment Report', sub: 'Doctors within a department ranked by number of appointments' },
  Revenue:   { title: 'Revenue Report',   sub: 'Departments ranked by appointment volume over a date range' },
  RepGRR:   { title: 'General Revenue Report',       sub: 'Departments ranked by revenue generated over a date range' },
}

function Report() {
  useStaffAuth('Admin')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [type] = useState(searchParams.get('type') || 'AllAppt')

  return (
    <div style={page}>
      <div style={topbar.bar}>
        <span style={topbar.title}>Admin Portal</span>
        <button style={topbar.btn} onClick={() => navigate('/admin/home')}>← Home</button>
      </div>

      <div style={content}>
        <h1 style={heading}>{REPORT_META[type].title}</h1>
        <p style={subheading}>{REPORT_META[type].sub}</p>

        {type === 'AllAppt'  && <RepAllAppt />}
        {type === 'AllTrans' && <RepAllTrans />}
        {type === 'RepDAR'   && <RepDAR />}
        {type === 'Revenue'   && <RevenueReport />}
        {type === 'RepGRR'   && <RepGRR />}
      </div>
    </div>
  )
}

export default Report