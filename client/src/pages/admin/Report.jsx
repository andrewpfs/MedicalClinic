import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import RepAllAppt from './RepAllAppt'
import RepAllTrans from './RepAllTrans'
import DepartmentReport from './DepartmentReport'
import InvoiceReport from './InvoiceReport'
import RevenueReport from './RevenueReport'
import ReviewsReport from './ReviewsReport'
import PatientDoctorReport from './PatientDoctorReport'
import { useStaffAuth } from '../../hooks/useStaffAuth'
import StaffNavbar from '../../components/StaffNavbar'
import {
  shellPage, shellInner,
  adminHeroCard, adminHeroAccent, adminHeroContent,
  adminEyebrow, adminHeroTitle, adminHeroText,
} from './adminStyles'

const REPORT_META = {
  AllAppt:       { title: 'All Appointments',      sub: 'Browse and filter all appointment records by department and date', eyebrow: 'Appointments' },
  AllTrans:      { title: 'All Transactions',      sub: 'Browse and filter all transaction records by department and date', eyebrow: 'Transactions' },
  Invoice:       { title: 'Invoice Report',        sub: 'Outstanding patient invoices filtered by department, patient, and date range', eyebrow: 'Invoices' },
  Revenue:       { title: 'Revenue Report',        sub: 'Clinic revenue transactions filtered by department, doctor, patient, and date', eyebrow: 'Revenue' },
  Reviews:       { title: 'Reviews Report',        sub: 'Patient satisfaction ratings filtered by department, doctor, patient, and date', eyebrow: 'Reviews' },
  PatientDoctor: { title: 'Patient–Doctor Report', sub: 'See which patients are seeing which doctors, visit frequency, and last visit date', eyebrow: 'Patient Activity' },
  Department:  { title: 'Department Report',   sub: 'PLEASE REPLACE IN THE FUTUUUUUUURE!!!!!', eyebrow: 'Department' },
}

function Report() {
  useStaffAuth('Admin')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [type] = useState(searchParams.get('type') || 'AllAppt')
  const meta = REPORT_META[type] || REPORT_META.AllAppt

  return (
    <div style={shellPage}>
      <StaffNavbar />
      <div style={shellInner}>

        <div style={adminHeroCard}>
          <div style={adminHeroAccent} />
          <div style={adminHeroContent}>
            <p style={adminEyebrow}>{meta.eyebrow}</p>
            <h1 style={adminHeroTitle}>{meta.title}</h1>
            <p style={adminHeroText}>{meta.sub}</p>
            <button
              onClick={() => navigate('/admin/home')}
              style={{ marginTop: '18px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', color: 'white', padding: '8px 16px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ← Back to home
            </button>
          </div>
        </div>

        {type === 'AllAppt'  && <RepAllAppt />}
        {type === 'AllTrans' && <RepAllTrans />}
        {type === 'Invoice'  && <InvoiceReport />}
        {type === 'Revenue'  && <RevenueReport />}
        {type === 'Reviews'  && <ReviewsReport />}
        {type === 'PatientDoctor'  && <PatientDoctorReport />}
        {type === 'Department'  && <DepartmentReport />}

      </div>
    </div>
  )
}

export default Report
