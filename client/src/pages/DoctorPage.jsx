import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffNavbar from '../components/StaffNavbar';
import WeekDayPicker from '../components/WeekDayPicker';

const DOCTOR_API = '/api/doctor';
const EMP_API    = '/api/employee';

const TABS = [
  { id: 'overview',  label: 'Overview'    },
  { id: 'schedule',  label: 'My Schedule' },
  { id: 'patients',  label: 'My Patients' },
  { id: 'visitlog',  label: 'Visit Log'   },
];

export default function DoctorPage() {
  const navigate = useNavigate();
  const [activeTab,  setActiveTab]  = useState('overview');
  const [staffName,  setStaffName]  = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [data, setData] = useState({
    upcomingAppointments: [],
    patientAppointmentInfo: [],
    visitLogs: [],
    appointmentOptions: [],
  });
  const [shifts,  setShifts]  = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [visitForm, setVisitForm] = useState({
    appointmentId: '', symptoms: '', notes: '', dateTime: '',
  });

  const handleSignOut = async () => {
    try {
      const [dr, em] = await Promise.all([
        fetch(DOCTOR_API, { credentials: 'include' }),
        fetch(EMP_API,    { credentials: 'include' }),
      ]);
      const drData = await dr.json();
      const emData = await em.json();
      if (drData.success) setData(drData);
      if (emData.success) setShifts(emData.availability || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  useEffect(() => {
    fetch('/api/employee/session', { credentials: 'include' })
      .then(r => r.json())
      .then(s => {
        if (!s.isLoggedIn || s.role !== 'Doctor') navigate('/staff-login');
        else { setStaffName(s.name); setEmployeeId(String(s.id || '')); loadData(); }
      })
      .catch(() => navigate('/staff-login'));
  }, []);

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 4500);
      return () => clearTimeout(t);
    }
  }, [message]);

  const handleVisitSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${DOCTOR_API}/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(visitForm),
      });
      const r = await res.json();
      if (!r.success) throw new Error(r.error || 'Failed to save visit');
      setMessage({ type: 'success', text: r.message });
      setVisitForm({ appointmentId: '', symptoms: '', notes: '', dateTime: '' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleShiftSave = async (slot) => {
    try {
      const res = await fetch(`${EMP_API}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...slot, employeeId }),
      });
      const r = await res.json();
      if (!r.success) throw new Error(r.error || 'Failed to save shift');
      setMessage({ type: 'success', text: 'Shift saved!' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const myShiftCount = shifts.filter(s => String(s.EmployeeID) === employeeId).length;

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", margin: 0, background: '#f4f6f4', minHeight: '100vh' }}>
      <StaffNavbar />

      {/* ── Page header + tab bar ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
          {/* Title row */}
          <div style={{ paddingTop: '24px', paddingBottom: '16px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              Doctor Dashboard
            </p>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#111827' }}>
              Dr. {staffName || '…'}
            </h1>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                padding: '10px 18px',
                border: 'none',
                borderBottom: `2px solid ${activeTab === t.id ? '#1e2b1b' : 'transparent'}`,
                background: 'transparent',
                color: activeTab === t.id ? '#1e2b1b' : '#6b7280',
                fontWeight: activeTab === t.id ? 600 : 400,
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginBottom: '-1px',
                transition: 'color 0.12s, border-color 0.12s',
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px 60px' }}>

        {/* Toast */}
        {message.text && (
          <div style={{
            marginBottom: '20px', padding: '12px 16px', borderRadius: '8px', fontSize: '14px',
            ...(message.type === 'success'
              ? { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }
              : { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }),
          }}>
            {message.text}
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: '14px', marginBottom: '28px' }}>
              <StatCard value={data.upcomingAppointments.length} label="Upcoming Appointments" color="#2563eb" />
              <StatCard value={data.visitLogs.length}            label="Visit Logs"            color="#16a34a" />
              <StatCard value={myShiftCount}                      label="Scheduled Shifts"      color="#d97706" />
              <StatCard value={data.patientAppointmentInfo.length} label="Total Patients"      color="#7c3aed" />
            </div>
            {data.upcomingAppointments.length > 0 && (
              <Card title="Upcoming Appointments" sub="Your next scheduled patients">
                <DTable
                  headers={['Patient', 'Date', 'Time', 'Reason', 'Status']}
                  rows={data.upcomingAppointments.slice(0, 6)}
                  renderRow={r => (
                    <tr key={r.AppointmentID}>
                      <td style={td}>{r.PatientLastName}, {r.PatientFirstName}</td>
                      <td style={td}>{fmtDate(r.AppointmentDate)}</td>
                      <td style={td}>{fmtTime(r.AppointmentDate, r.AppointmentTime)}</td>
                      <td style={td}>{r.ReasonForVisit || '—'}</td>
                      <td style={td}><SBadge s={r.StatusText || r.StatusCode} /></td>
                    </tr>
                  )}
                />
              </Card>
            )}
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {activeTab === 'schedule' && (
          <Card title="My Schedule" sub="Click any day to set your shift hours for that day.">
            <WeekDayPicker
              shifts={shifts}
              employeeId={employeeId}
              onSave={handleShiftSave}
            />
          </Card>
        )}

        {/* ── PATIENTS ── */}
        {activeTab === 'patients' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card title="Upcoming Appointments" sub="Scheduled patient visits">
              <DTable
                headers={['ID', 'Patient', 'Doctor', 'Date', 'Time', 'Reason', 'Status']}
                rows={data.upcomingAppointments}
                empty="No upcoming appointments."
                renderRow={r => (
                  <tr key={r.AppointmentID}>
                    <td style={td}><IBadge>{r.AppointmentID}</IBadge></td>
                    <td style={td}>{r.PatientLastName}, {r.PatientFirstName}</td>
                    <td style={td}>Dr. {r.DoctorLastName}</td>
                    <td style={td}>{fmtDate(r.AppointmentDate)}</td>
                    <td style={td}>{fmtTime(r.AppointmentDate, r.AppointmentTime)}</td>
                    <td style={td}>{r.ReasonForVisit || '—'}</td>
                    <td style={td}><SBadge s={r.StatusText || r.StatusCode} /></td>
                  </tr>
                )}
              />
            </Card>
            <Card title="Patient Appointment Details" sub="Full details including reason for visit and office">
              <DTable
                headers={['Appt', 'Patient', 'Doctor', 'Reason', 'Office']}
                rows={data.patientAppointmentInfo}
                empty="No appointment details."
                renderRow={r => (
                  <tr key={r.AppointmentID}>
                    <td style={td}><IBadge>{r.AppointmentID}</IBadge></td>
                    <td style={td}>
                      {r.PatientLastName}, {r.PatientFirstName}
                      <br /><span style={{ color: '#9ca3af', fontSize: '12px' }}>ID: {r.PatientID}</span>
                    </td>
                    <td style={td}>
                      Dr. {r.DoctorLastName}, {r.DoctorFirstName}
                      <br /><span style={{ color: '#9ca3af', fontSize: '12px' }}>ID: {r.DoctorID}</span>
                    </td>
                    <td style={td}>{r.ReasonForVisit || '—'}</td>
                    <td style={td}>{r.OfficeID || '—'}</td>
                  </tr>
                )}
              />
            </Card>
          </div>
        )}

        {/* ── VISIT LOG ── */}
        {activeTab === 'visitlog' && (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px', alignItems: 'start' }}>
            <Card title="Log a Visit" sub="Enter symptoms and clinical notes">
              <form onSubmit={handleVisitSubmit}>
                <FField label="Appointment">
                  <select style={inp} value={visitForm.appointmentId}
                    onChange={e => setVisitForm({ ...visitForm, appointmentId: e.target.value })} required>
                    <option value="">Select appointment…</option>
                    {data.appointmentOptions.map(r => (
                      <option key={r.AppointmentID} value={r.AppointmentID}>
                        #{r.AppointmentID} · {r.PatientLastName}, {r.PatientFirstName} · {fmtDate(r.AppointmentDate)}{fmtTime(r.AppointmentDate, r.AppointmentTime) !== '—' ? ` at ${fmtTime(r.AppointmentDate, r.AppointmentTime)}` : ''}
                      </option>
                    ))}
                  </select>
                </FField>
                <FField label="Symptoms">
                  <input style={inp} type="text" maxLength={100} placeholder="Runny Nose"
                    value={visitForm.symptoms}
                    onChange={e => setVisitForm({ ...visitForm, symptoms: e.target.value })} />
                </FField>
                <FField label="Clinical Notes">
                  <textarea style={{ ...inp, minHeight: '88px', resize: 'vertical' }} maxLength={100}
                    placeholder="Observations, diagnosis, treatment…"
                    value={visitForm.notes}
                    onChange={e => setVisitForm({ ...visitForm, notes: e.target.value })} />
                </FField>
                <FField label="Visit Date & Time">
                  <input style={inp} type="datetime-local" value={visitForm.dateTime}
                    onChange={e => setVisitForm({ ...visitForm, dateTime: e.target.value })} />
                </FField>
                <button style={btn} type="submit">Save Visit Record</button>
              </form>
            </Card>

            <Card title="Visit History" sub="All recorded patient visits">
              <DTable
                headers={['Visit', 'Patient', 'Symptoms', 'Notes', 'Date / Time']}
                rows={data.visitLogs}
                empty="No visits recorded yet."
                renderRow={r => (
                  <tr key={r.VisitID}>
                    <td style={td}><IBadge>{r.VisitID}</IBadge></td>
                    <td style={td}>{r.PatientLastName}, {r.PatientFirstName}</td>
                    <td style={td}>{r.Symptoms || '—'}</td>
                    <td style={td}>{r.Notes || '—'}</td>
                    <td style={td}>{r.DateTime || '—'}</td>
                  </tr>
                )}
              />
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}

/* ── Shared UI helpers ─────────────────────────────────────────── */

function StatCard({ value, label, color }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: '30px', fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '5px' }}>{label}</div>
    </div>
  );
}

function Card({ title, sub, children }) {
  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.05)' }}>
      {(title || sub) && (
        <div style={{ marginBottom: '16px' }}>
          {title && <h2 style={{ margin: '0 0 3px', fontSize: '16px', fontWeight: 700 }}>{title}</h2>}
          {sub && <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{sub}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function DTable({ headers, rows, renderRow, empty = 'No records.' }) {
  if (!rows.length) return <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '24px 0', margin: 0 }}>{empty}</p>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ background: '#f9fafb', textAlign: 'left', padding: '9px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map(renderRow)}</tbody>
      </table>
    </div>
  );
}

function SBadge({ s }) {
  const low = (s || '').toLowerCase();
  let bg = '#f3f4f6', color = '#6b7280';
  if (low.includes('scheduled') || low.includes('confirmed')) { bg = '#dbeafe'; color = '#1d4ed8'; }
  else if (low.includes('complete') || low.includes('done'))  { bg = '#dcfce7'; color = '#166534'; }
  else if (low.includes('cancel'))                            { bg = '#fee2e2'; color = '#b91c1c'; }
  else if (low.includes('pending'))                           { bg = '#fef3c7'; color = '#d97706'; }
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: bg, color }}>{s || 'Unknown'}</span>;
}

function IBadge({ children }) {
  return <span style={{ display: 'inline-block', padding: '2px 8px', background: '#f3f4f6', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#374151' }}>{children}</span>;
}

function FField({ label, children }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>{label}</label>
      {children}
    </div>
  );
}

const td  = { textAlign: 'left', padding: '11px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', color: '#374151', verticalAlign: 'top' };
const inp = { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px', color: '#1a1a1a', background: 'white', fontFamily: 'inherit' };
const btn = { width: '100%', marginTop: '16px', background: '#1e2b1b', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' };

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(val) {
  if (!val) return '—';
  const datePart = String(val).includes('T') ? val.split('T')[0] : val;
  const [y, m, d] = datePart.split('-').map(Number);
  if (!y || !m || !d) return val;
  return `${MONTHS_SHORT[m - 1]} ${d}, ${y}`;
}

function fmtTime(dateVal, timeVal) {
  let h, min;
  if (timeVal) {
    [h, min] = String(timeVal).split(':').map(Number);
  } else if (dateVal && String(dateVal).includes('T')) {
    const t = dateVal.split('T')[1];
    [h, min] = t.split(':').map(Number);
    if (h === 0 && min === 0) return '—';
  } else {
    return '—';
  }
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${String(min).padStart(2, '0')} ${ampm}`;
}
