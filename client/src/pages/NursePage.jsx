import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffNavbar from '../components/StaffNavbar';
import WeekDayPicker from '../components/WeekDayPicker';

import API from '../api';
const EMP_API = `${API}/api/employee`;

const TABS = [
  { id: 'overview',     label: 'Overview'     },
  { id: 'appointments', label: 'Appointments' },
  { id: 'schedule',     label: 'My Schedule'  },
];

export default function NursePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [staffName, setStaffName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [data, setData] = useState({
    assignedDoctor: null,
    appointments: [],
    patients: [],
    doctors: [],
    paymentMethods: [],
    availability: [],
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [bookForm, setBookForm] = useState({
    patientId: '', doctorId: '', appointmentDate: '', reasonForVisit: '', officeId: '1',
  });

  const loadData = async () => {
    try {
      const res = await fetch(`${EMP_API}/nurse`, { credentials: 'include' });
      const r = await res.json();
      if (!r.success) throw new Error(r.error || 'Failed to load data');
      setData(r);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  useEffect(() => {
    fetch(`${API}/api/employee/session`, { credentials: 'include' })
      .then(r => r.json())
      .then(s => {
        if (!s.isLoggedIn || s.role !== 'Nurse') navigate('/staff-login');
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

  const post = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const r = await res.json();
    if (!r.success) throw new Error(r.error || 'Request failed');
    return r;
  };

  const handleBook = async (e) => {
    e.preventDefault();
    try {
      const r = await post(`${EMP_API}/book`, bookForm);
      setMessage({ type: 'success', text: r.message });
      setBookForm({ patientId: '', doctorId: '', appointmentDate: '', reasonForVisit: '', officeId: '1' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleShiftSave = async (slot) => {
    try {
      await post(`${EMP_API}/availability`, { ...slot, employeeId });
      setMessage({ type: 'success', text: 'Shift saved!' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const dr = data.assignedDoctor;
  const scheduled = data.appointments.filter(a => (a.StatusText || '').toLowerCase().includes('scheduled'));
  const completed = data.appointments.filter(a => (a.StatusText || '').toLowerCase().includes('complete'));

  return (
    <div style={nursePageShell}>
      <StaffNavbar />

      <div style={nursePageInner}>

        {/* Hero card */}
        <section style={nurseHeroCard}>
          <div style={nurseHeroOrb} />
          <div style={nurseHeroContent}>
            <div>
              <p style={nurseEyebrow}>Nurse Dashboard</p>
              <h1 style={nurseHeroTitle}>{staffName || '…'}</h1>
              <p style={nurseHeroText}>
                {dr ? <>Assigned to <strong>Dr. {dr.DoctorFirst} {dr.DoctorLast}</strong> — manage appointments and your schedule.</> : 'No assigned doctor yet. Contact an admin to get assigned.'}
              </p>
            </div>
            <div style={nurseHeroHighlights}>
              <div style={nurseHeroStat}>
                <div style={nurseHeroStatValue}>{scheduled.length}</div>
                <div style={nurseHeroStatLabel}>Awaiting</div>
              </div>
              <div style={nurseHeroStat}>
                <div style={nurseHeroStatValue}>{completed.length}</div>
                <div style={nurseHeroStatLabel}>Completed</div>
              </div>
              <div style={nurseHeroStat}>
                <div style={nurseHeroStatValue}>{data.availability.length}</div>
                <div style={nurseHeroStatLabel}>My Shifts</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <nav style={nurseTabRow}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ ...nurseTabButton, ...(activeTab === t.id ? nurseActiveTab : {}) }}>
              {t.label}
            </button>
          ))}
        </nav>

      {/* ── Content ── */}
      <div>

        {/* Toast */}
        {message.text && (
          <div style={{
            marginBottom: '20px', padding: '13px 16px', borderRadius: '10px', fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '10px',
            ...(message.type === 'success'
              ? { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }
              : { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }),
          }}>
            <span>{message.type === 'success' ? '✓' : '!'}</span>
            {message.text}
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              <StatCard value={data.appointments.length} label="Total Appointments" sub="Assigned doctor" color="#2563eb" bg="#eff6ff" icon={<CalIcon />} />
              <StatCard value={scheduled.length}         label="Scheduled"          sub="Upcoming"       color="#d97706" bg="#fffbeb" icon={<ClockIcon />} />
              <StatCard value={completed.length}         label="Completed"          sub="Visit logged"   color="#16a34a" bg="#f0fdf4" icon={<CheckIcon />} />
              <StatCard value={data.availability.length} label="My Shifts"          sub="Scheduled"      color="#7c3aed" bg="#f5f3ff" icon={<ShiftIcon />} />
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <ActionBtn onClick={() => setActiveTab('appointments')}>Book Appointment</ActionBtn>
              <ActionBtn onClick={() => setActiveTab('schedule')}>Manage My Schedule</ActionBtn>
            </div>

            <Card title="Today's Appointments" sub={dr ? `For Dr. ${dr.DoctorFirst} ${dr.DoctorLast}` : 'All appointments'}>
              {data.appointments.length === 0
                ? <Empty text="No appointments found." />
                : <DTable
                    headers={['Patient', 'Date', 'Time', 'Reason', 'Status']}
                    rows={data.appointments.slice(0, 8)}
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
              }
            </Card>
          </div>
        )}

        {/* ── APPOINTMENTS ── */}
        {activeTab === 'appointments' && (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>
            <Card title="Book Appointment" sub="Schedule a patient with a doctor">
              <form onSubmit={handleBook}>
                <FField label="Patient">
                  <select style={inp} value={bookForm.patientId}
                    onChange={e => setBookForm({ ...bookForm, patientId: e.target.value })} required>
                    <option value="">Select patient…</option>
                    {data.patients.map(p => (
                      <option key={p.PatientID} value={p.PatientID}>
                        {p.LastName}, {p.FirstName} (ID: {p.PatientID})
                      </option>
                    ))}
                  </select>
                </FField>
                <FField label="Doctor">
                  <select style={inp} value={bookForm.doctorId}
                    onChange={e => setBookForm({ ...bookForm, doctorId: e.target.value })} required>
                    <option value="">Select doctor…</option>
                    {data.doctors.map(d => (
                      <option key={d.EmployeeID} value={d.EmployeeID}>
                        Dr. {d.LastName}, {d.FirstName}{d.Specialty ? ` — ${d.Specialty}` : ''}
                      </option>
                    ))}
                  </select>
                </FField>
                <FField label="Date & Time">
                  <input style={inp} type="datetime-local" value={bookForm.appointmentDate}
                    onChange={e => setBookForm({ ...bookForm, appointmentDate: e.target.value })} required />
                </FField>
                <FField label="Reason for Visit">
                  <input style={inp} type="text" maxLength={20} placeholder="e.g. Check-up"
                    value={bookForm.reasonForVisit}
                    onChange={e => setBookForm({ ...bookForm, reasonForVisit: e.target.value })} />
                </FField>
                <button style={btn} type="submit">Book Appointment</button>
              </form>
            </Card>

            <Card
              title={dr ? `Dr. ${dr.DoctorFirst} ${dr.DoctorLast}'s Appointments` : 'All Appointments'}
              sub="Recent scheduled visits"
            >
              <DTable
                headers={['ID', 'Patient', 'Doctor', 'Date', 'Time', 'Reason', 'Status']}
                rows={data.appointments}
                empty="No appointments found."
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
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {activeTab === 'schedule' && (
          <Card title="My Schedule" sub="Click any day to set your shift hours for that day.">
            <WeekDayPicker
              shifts={data.availability}
              employeeId={employeeId}
              onSave={handleShiftSave}
            />
          </Card>
        )}

      </div>
      </div>
    </div>
  );
}

/* ── UI helpers ─────────────────────────────────────────────────── */

function StatCard({ icon, value, label, sub, color, bg }) {
  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color }}>{icon}</div>
      <div>
        <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginTop: '3px' }}>{label}</div>
        {sub && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  );
}

function ActionBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', color: '#1e2b1b' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#1e2b1b'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#1e2b1b'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#1e2b1b'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
    >{children}</button>
  );
}

function Card({ title, sub, children }) {
  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6' }}>
      {(title || sub) && (
        <div style={{ marginBottom: '16px' }}>
          {title && <h2 style={{ margin: '0 0 3px', fontSize: '16px', fontWeight: 700, color: '#111827' }}>{title}</h2>}
          {sub && <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{sub}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function Empty({ text }) {
  return <p style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', padding: '28px 0', margin: 0 }}>{text}</p>;
}

function DTable({ headers, rows, renderRow, empty = 'No records.' }) {
  if (!rows.length) return <Empty text={empty} />;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{ background: '#f9fafb', textAlign: 'left', padding: '9px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '11px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
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
  else if (low.includes('cancel'))  { bg = '#fee2e2'; color = '#b91c1c'; }
  else if (low.includes('pending')) { bg = '#fef3c7'; color = '#d97706'; }
  else if (low.includes('paid'))    { bg = '#dcfce7'; color = '#166534'; }
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

/* ── Icons ─────────────────────────────────────────────────────── */
function CalIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function ClockIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function CheckIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function ShiftIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>; }

/* ── Styles ────────────────────────────────────────────────────── */
const td  = { textAlign: 'left', padding: '11px 12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', color: '#374151', verticalAlign: 'top' };
const inp = { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', boxSizing: 'border-box', fontSize: '14px', color: '#1a1a1a', background: 'white', fontFamily: 'inherit' };
const btn = { width: '100%', marginTop: '16px', background: '#0f766e', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit' };

const nursePageShell  = { minHeight: '100vh', background: 'radial-gradient(circle at top right, #ccfbf1 0%, #f0fdfa 35%, #ecfeff 65%, #f8fafc 100%)', fontFamily: 'Poppins, Inter, sans-serif' };
const nursePageInner  = { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' };
const nurseHeroCard   = { position: 'relative', overflow: 'hidden', borderRadius: '20px', background: 'linear-gradient(135deg, #134e4a 0%, #0f766e 48%, #0891b2 100%)', padding: '2.5rem 2.5rem 2rem', marginBottom: '2rem', boxShadow: '0 8px 32px rgba(15,118,110,0.25)' };
const nurseHeroOrb    = { position: 'absolute', top: '-60px', right: '-60px', width: '260px', height: '260px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' };
const nurseHeroContent= { position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' };
const nurseEyebrow    = { margin: '0 0 6px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.1em' };
const nurseHeroTitle  = { margin: '0 0 8px', fontSize: '28px', fontWeight: 700, color: '#ffffff', lineHeight: 1.15 };
const nurseHeroText   = { margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)', maxWidth: '520px' };
const nurseHeroHighlights = { display: 'flex', gap: '2rem', flexShrink: 0 };
const nurseHeroStat   = { textAlign: 'center' };
const nurseHeroStatValue = { fontSize: '30px', fontWeight: 700, color: '#ffffff', lineHeight: 1 };
const nurseHeroStatLabel = { fontSize: '12px', color: 'rgba(255,255,255,0.65)', marginTop: '4px' };
const nurseTabRow     = { display: 'flex', gap: '6px', marginBottom: '24px' };
const nurseTabButton  = { padding: '8px 20px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', color: '#374151', transition: 'all 0.15s' };
const nurseActiveTab  = { background: '#0f766e', color: 'white', borderColor: '#0f766e' };

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
