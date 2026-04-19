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
  sectionLabel,
  statCardsRow, statCard, statCardAccent,
  statLabel, statLabelLight, statValue, statValueLight,
  statSub, statSubLight,
} from './adminStyles'

const REPORTS = [
  {
    type: 'AllAppt',
    navTitle: 'Appointments',
    title: 'Appointment Operations',
    eyebrow: 'Clinic flow',
    sub: 'Review appointment demand by department and date so admins can spot scheduling pressure and service bottlenecks.',
    focus: 'Staffing and visit volume',
    signal: 'Schedule load',
    action: 'Use this before changing department coverage or appointment capacity.',
  },
  {
    type: 'AllTrans',
    navTitle: 'Transactions',
    title: 'Payment Transactions',
    eyebrow: 'Payment audit',
    sub: 'Audit recorded transactions by department and appointment date to confirm revenue capture and payment follow-through.',
    focus: 'Payment trail',
    signal: 'Collection activity',
    action: 'Use this to reconcile front-desk payments with completed appointments.',
  },
  {
    type: 'Invoice',
    navTitle: 'Invoices',
    title: 'Invoice Risk',
    eyebrow: 'Accounts receivable',
    sub: 'Find unpaid invoice balances by department, patient, and date range so the team knows where follow-up is needed.',
    focus: 'Outstanding balances',
    signal: 'Follow-up queue',
    action: 'Use this to prioritize patient billing outreach and reduce aging balances.',
  },
  {
    type: 'Revenue',
    navTitle: 'Revenue',
    title: 'Revenue Performance',
    eyebrow: 'Financial health',
    sub: 'Measure completed revenue by department, doctor, patient, and date to understand clinic performance trends.',
    focus: 'Collected revenue',
    signal: 'Department performance',
    action: 'Use this when reviewing service-line results and provider productivity.',
  },
  {
    type: 'Reviews',
    navTitle: 'Reviews',
    title: 'Patient Experience',
    eyebrow: 'Quality signal',
    sub: 'Review patient satisfaction by department, doctor, patient, and date so quality issues surface early.',
    focus: 'Satisfaction trends',
    signal: 'Patient sentiment',
    action: 'Use this to identify where coaching or workflow improvements may help.',
  },
  {
    type: 'PatientDoctor',
    navTitle: 'Patient-Doctor',
    title: 'Patient-Doctor Activity',
    eyebrow: 'Patient activity',
    sub: 'See which patients are seeing which doctors, visit frequency, and last visit dates.',
    focus: 'Care relationships',
    signal: 'Visit continuity',
    action: 'Use this to understand provider panels and patient follow-up patterns.',
  },
  {
    type: 'Department',
    navTitle: 'Departments',
    title: 'Department Summary',
    eyebrow: 'Department health',
    sub: 'Compare department activity so admins can spot workload and performance differences across the clinic.',
    focus: 'Department comparison',
    signal: 'Operational balance',
    action: 'Use this when reviewing department staffing, demand, and overall performance.',
  },
]

const REPORT_META = REPORTS.reduce((acc, report) => {
  acc[report.type] = report
  return acc
}, {})

const REPORT_COMPONENTS = {
  AllAppt: RepAllAppt,
  AllTrans: RepAllTrans,
  Invoice: InvoiceReport,
  Revenue: RevenueReport,
  Reviews: ReviewsReport,
  PatientDoctor: PatientDoctorReport,
  Department: DepartmentReport,
}

const heroActions = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: '18px',
}

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

const reportWorkspace = {
  display: 'block',
}

const reportMenu = {
  background: 'rgba(255,255,255,0.92)',
  border: '1px solid rgba(255,255,255,0.95)',
  borderRadius: '26px',
  padding: '18px',
  boxShadow: '0 18px 44px rgba(15,23,42,0.09)',
  marginBottom: '22px',
}

const reportMenuTitle = {
  margin: '0 0 6px',
  color: '#1e2b1b',
  fontSize: '22px',
  fontWeight: 500,
}

const reportMenuHelp = {
  margin: '0 0 16px',
  color: '#64748b',
  fontSize: '15px',
  lineHeight: 1.55,
}

const reportNavButton = {
  textAlign: 'left',
  border: '1px solid transparent',
  borderRadius: '18px',
  background: 'transparent',
  padding: '16px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  display: 'block',
}

const reportMenuGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '10px',
}

const reportNavButtonActive = {
  borderColor: 'rgba(18, 53, 36, 0.35)',
  background: '#f4faf5',
  boxShadow: '0 18px 44px rgba(18,53,36,0.14)',
}

const reportNavEyebrow = {
  margin: 0,
  color: '#6b7f63',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 500,
}

const reportNavTitle = {
  margin: '7px 0 5px',
  color: '#1e2b1b',
  fontSize: '18px',
  fontWeight: 500,
}

const reportNavText = {
  margin: 0,
  color: '#64748b',
  fontSize: '14px',
  lineHeight: 1.5,
}

const activePanel = {
  background: 'rgba(255,255,255,0.9)',
  border: '1px solid rgba(255,255,255,0.9)',
  borderRadius: '26px',
  padding: '28px',
  boxShadow: '0 18px 44px rgba(15,23,42,0.09)',
  minWidth: 0,
}

const activePanelHeader = {
  marginBottom: '22px',
  paddingBottom: '22px',
  borderBottom: '1px solid #e5e7eb',
}

const activePanelTitle = {
  margin: '0 0 10px',
  color: '#1e2b1b',
  fontSize: '30px',
  lineHeight: 1.15,
}

const activePanelText = {
  margin: 0,
  color: '#64748b',
  fontSize: '16px',
  lineHeight: 1.65,
  maxWidth: '860px',
}

function Report() {
  useStaffAuth('Admin')
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedType = searchParams.get('type') || 'AllAppt'
  const activeType = REPORT_META[requestedType] ? requestedType : 'AllAppt'
  const meta = REPORT_META[activeType]
  const ActiveReport = REPORT_COMPONENTS[activeType]

  const chooseReport = (reportType) => {
    setSearchParams({ type: reportType })
  }

  return (
    <div style={shellPage}>
      <StaffNavbar />
      <div style={shellInner}>

        <div style={adminHeroCard}>
          <div style={adminHeroAccent} />
          <div style={adminHeroContent}>
            <p style={adminEyebrow}>Admin reports</p>
            <h1 style={adminHeroTitle}>Clinic command center</h1>
            <p style={adminHeroText}>
              Use operational, financial, and patient-experience reports to understand what needs attention before it becomes a clinic-wide problem.
            </p>
            <div style={heroActions}>
              <button type="button" onClick={() => navigate('/admin/home')} style={heroButton}>Back to admin home</button>
              <button type="button" onClick={() => navigate('/admin/employees')} style={heroButton}>Manage employees</button>
            </div>
          </div>
        </div>

        <div style={statCardsRow}>
          <div style={statCardAccent}>
            <div style={statLabelLight}>Current report</div>
            <div style={statValueLight}>{meta.navTitle}</div>
            <div style={statSubLight}>{meta.focus}</div>
          </div>
          <div style={statCard}>
            <div style={statLabel}>Admin question</div>
            <div style={statValue}>{meta.signal}</div>
            <div style={statSub}>{meta.action}</div>
          </div>
          <div style={statCard}>
            <div style={statLabel}>Report library</div>
            <div style={statValue}>{REPORTS.length} views</div>
            <div style={statSub}>Operations, payments, billing, revenue, quality, patient activity, and departments.</div>
          </div>
        </div>

        <div style={reportWorkspace}>
          <aside style={reportMenu}>
            <p style={{ ...sectionLabel, marginBottom: '8px' }}>Report menu</p>
            <h2 style={reportMenuTitle}>Choose what to review</h2>
            <p style={reportMenuHelp}>Pick a report from this list. The active report opens on the right with filters and results.</p>
            <div style={reportMenuGrid}>
              {REPORTS.map(report => (
                <button
                  key={report.type}
                  type="button"
                  onClick={() => chooseReport(report.type)}
                  style={{
                    ...reportNavButton,
                    ...(activeType === report.type ? reportNavButtonActive : {}),
                  }}
                >
                  <p style={reportNavEyebrow}>{report.eyebrow}</p>
                  <p style={reportNavTitle}>{report.navTitle}</p>
                  <p style={reportNavText}>{report.action}</p>
                </button>
              ))}
            </div>
          </aside>

          <div style={activePanel}>
            <div style={activePanelHeader}>
              <p style={{ ...sectionLabel, marginBottom: '10px' }}>Active report</p>
              <h2 style={activePanelTitle}>{meta.title}</h2>
              <p style={activePanelText}>{meta.sub}</p>
            </div>
            <ActiveReport />
          </div>
        </div>

      </div>
    </div>
  )
}

export default Report
