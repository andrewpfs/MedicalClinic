import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import RepDAR from './RepDAR'
import RepGAR from './RepGAR'
import RepGRR from './RepGRR'
import RepAllAppt from './RepAllAppt'
import RepAllTrans from './RepAllTrans'
import InvoiceReport from './InvoiceReport'
import RevenueReport from './RevenueReport'
import ReviewsReport from './ReviewsReport'
import { useStaffAuth } from '../../hooks/useStaffAuth'
import { topbar, page, content, heading, subheading } from './adminStyles'



const REPORT_META = {
  AllAppt:  { title: 'All Appointments',              sub: 'Browse and filter all appointment records by department and date' },
  AllTrans: { title: 'All Transactions',              sub: 'Browse and filter all transaction records by department and date' },
  Invoice:   { title: 'Invoice Report', sub: 'Invoices that have not been completed and the amount that each one is due' },
  Revenue:   { title: 'Revenue Report',   sub: 'Transactions that have been completed and how much revenue has been achieved' },
  Reviews:   { title: 'Reviews Report',       sub: 'Reviews created by patients' },
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
        {type === 'Invoice'   && <InvoiceReport />}
        {type === 'Revenue'   && <RevenueReport />}
        {type === 'Reviews'   && <ReviewsReport />}
      </div>
    </div>
  )
}

export default Report