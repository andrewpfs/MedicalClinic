import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffNavbar from '../components/StaffNavbar';
import WeekDayPicker from '../components/WeekDayPicker';

import API from '../api';
const EMP_API = `${API}/api/employee`;

const TABS = [
  { id: 'overview',     label: 'Overview'     },
  { id: 'appointments', label: 'Appointments' },
  { id: 'payments',     label: 'Payments'     },
  { id: 'schedule',     label: 'Schedule'     },
  { id: 'patients',     label: 'Patients'     },
  { id: 'staff',        label: 'Staff'        },
];

export default function EmployeePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [data, setData] = useState({
    patients: [], doctors: [], employees: [], paymentMethods: [],
    appointments: [], transactions: [], availability: [],
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [schedEmpId, setSchedEmpId] = useState('');

  const [bookForm, setBookForm] = useState({
    patientId: '', doctorId: '', appointmentDate: '', reasonForVisit: '', officeId: '1',
  });
  const [payForm, setPayForm] = useState({
    appointmentId: '', patientId: '', paymentCode: '', amount: '', status: 'Posted',
  });

  const loadData = async () => {
    try {
      const res = await fetch(EMP_API, { credentials: 'include' });
      const r = await res.json();
      if (!r.success) throw new Error(r.error || 'Failed to load data');
      setData(r);
    } catch (err) { setMessage({ type: 'error', text: err.message }); }
  };

  useEffect(() => {
    fetch(`${API}/api/employee/session`, { credentials: 'include' })
      .then(r => r.json())
      .then(s => {
        if (!s.isLoggedIn) navigate('/staff-login');
        else if (s.role === 'Doctor') navigate('/doctor');
        else if (s.role === 'Nurse')  navigate('/nurse');
        else if (s.role === 'Admin')  navigate('/admin');
        else { setStaffName(s.name); setStaffRole(s.role); loadData(); }
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
    } catch (err) { setMessage({ type: 'error', text: err.message }); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const r = await post(`${EMP_API}/payment`, payForm);
      setMessage({ type: 'success', text: r.message });
      setPayForm({ appointmentId: '', patientId: '', paymentCode: '', amount: '', status: 'Posted' });
      loadData();
    } catch (err) { setMessage({ type: 'error', text: err.message }); }
  };

  const handleShiftSave = async (slot) => {
    if (!schedEmpId) { setMessage({ type: 'error', text: 'Please select an employee first.' }); return; }
    try {
      await post(`${EMP_API}/availability`, { ...slot, employeeId: schedEmpId });
      setMessage({ type: 'success', text: 'Shift saved!' });
      loadData();
    } catch (err) { setMessage({ type: 'error', text: err.message }); }
  };

  const totalRevenue = data.transactions.reduce((s, t) => s + parseFloat(t.Amount || 0), 0);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", margin: 0, background: '#f4f6f4', minHeight: '100vh' }}>
      <StaffNavbar />

      {/* ── Page header + tab bar ── */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>
          <div style={{ paddingTop: '24px', paddingBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {staffRole || 'Employee'} Dashboard
              </p>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#111827' }}>
                {staffName || '…'}
              </h1>
            </div>
            <div style={{ fontSize: '13px', color: '#9ca3af' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '2px' }}>
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
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 40px 60px' }}>

        {/* Toast */}
        {message.text && (
          <div style={{
            marginBottom: '20px', padding: '13px 16px', borderRadius: '10px', fontSize: '14px',
            display: 'flex', alignItems: 'center', gap: '10px',
            ...(message.type === 'success'
              ? { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }
              : { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' }),
          }}>
            <span style={{ fontSize: '16px' }}>{message.type === 'success' ? '✓' : '!'}</span>
            {message.text}
          </div>
        )}

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <StatCard
                icon={<CalendarIcon />}
                value={data.appointments.length}
                label="Appointments"
                sub="This month"
                color="#2563eb"
                bg="#eff6ff"
                onClick={() => setActiveTab('appointments')}
              />
              <StatCard
                icon={<DollarIcon />}
                value={`$${totalRevenue.toFixed(2)}`}
                label="Revenue"
                sub={`${data.transactions.length} transactions`}
                color="#16a34a"
                bg="#f0fdf4"
                onClick={() => setActiveTab('payments')}
              />
              <StatCard
                icon={<PersonIcon />}
                value={data.patients.length}
                label="Patients"
                sub="Registered"
                color="#d97706"
                bg="#fffbeb"
                onClick={() => setActiveTab('patients')}
              />
              <StatCard
                icon={<TeamIcon />}
                value={data.employees.length}
                label="Staff Members"
                sub={`${data.doctors.length} doctors`}
                color="#7c3aed"
                bg="#f5f3ff"
                onClick={() => setActiveTab('staff')}
              />
            </div>

            {/* Quick actions */}
            <div>
              <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quick Actions</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <ActionBtn onClick={() => setActiveTab('appointments')}>Book Appointment</ActionBtn>
                <ActionBtn onClick={() => setActiveTab('payments')}>Record Payment</ActionBtn>
                <ActionBtn onClick={() => setActiveTab('schedule')}>Manage Schedule</ActionBtn>
              </div>
            </div>

            {/* Two-column: recent appointments + recent transactions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <Card title="Recent Appointments" sub="Latest scheduled visits" action={{ label: 'View all', onClick: () => setActiveTab('appointments') }}>
                {data.appointments.length === 0
                  ? <Empty text="No appointments yet." />
                  : <DTable
                      headers={['Patient', 'Doctor', 'Date', 'Status']}
                      rows={data.appointments.slice(0, 5)}
                      renderRow={r => (
                        <tr key={r.AppointmentID} style={{ cursor: 'default' }}>
                          <td style={td}>{r.PatientLastName}, {r.PatientFirstName}</td>
                          <td style={td}>Dr. {r.DoctorLastName}</td>
                          <td style={td}>{fmtDate(r.AppointmentDate)}</td>
                          <td style={td}><SBadge s={r.StatusText || r.StatusCode} /></td>
                        </tr>
                      )}
                    />
                }
              </Card>
              <Card title="Recent Transactions" sub="Latest payment records" action={{ label: 'View all', onClick: () => setActiveTab('payments') }}>
                {data.transactions.length === 0
                  ? <Empty text="No transactions yet." />
                  : <DTable
                      headers={['Patient', 'Amount', 'Method', 'Status']}
                      rows={data.transactions.slice(0, 5)}
                      renderRow={r => (
                        <tr key={r.TransactionID}>
                          <td style={td}>{r.PatientLastName}, {r.PatientFirstName}</td>
                          <td style={{ ...td, fontWeight: 600, color: '#111827' }}>${r.Amount}</td>
                          <td style={td}>{r.PaymentText || '—'}</td>
                          <td style={td}><SBadge s={r.Status} /></td>
                        </tr>
                      )}
                    />
                }
              </Card>
            </div>
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
                        Dr. {d.LastName}, {d.FirstName}
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
                <FField label="Office ID">
                  <input style={inp} type="number" min="1" value={bookForm.officeId}
                    onChange={e => setBookForm({ ...bookForm, officeId: e.target.value })} required />
                </FField>
                <button style={btn} type="submit">Book Appointment</button>
              </form>
            </Card>

            <Card title="All Appointments" sub="Recent clinic appointments">
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

        {/* ── PAYMENTS ── */}
        {activeTab === 'payments' && (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>
            <Card title="Record Payment" sub="Post a new patient payment">
              <form onSubmit={handlePayment}>
                <FField label="Patient">
                  <select style={inp} value={payForm.patientId}
                    onChange={e => setPayForm({ ...payForm, patientId: e.target.value })} required>
                    <option value="">Select patient…</option>
                    {data.patients.map(p => (
                      <option key={p.PatientID} value={p.PatientID}>
                        {p.LastName}, {p.FirstName}
                      </option>
                    ))}
                  </select>
                </FField>
                <FField label="Appointment ID">
                  <input style={inp} type="number" min="1" value={payForm.appointmentId}
                    onChange={e => setPayForm({ ...payForm, appointmentId: e.target.value })} required />
                </FField>
                <FField label="Amount ($)">
                  <input style={inp} type="number" step="0.01" min="0" value={payForm.amount}
                    onChange={e => setPayForm({ ...payForm, amount: e.target.value })} required />
                </FField>
                <FField label="Payment Method">
                  <select style={inp} value={payForm.paymentCode}
                    onChange={e => setPayForm({ ...payForm, paymentCode: e.target.value })}>
                    <option value="">Select method…</option>
                    {data.paymentMethods.map(m => (
                      <option key={m.PaymentCode} value={m.PaymentCode}>{m.PaymentText}</option>
                    ))}
                  </select>
                </FField>
                <FField label="Status">
                  <select style={inp} value={payForm.status}
                    onChange={e => setPayForm({ ...payForm, status: e.target.value })}>
                    <option value="Posted">Posted</option>
                    <option value="Pending">Pending</option>
                    <option value="Void">Void</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </FField>
                <button style={btn} type="submit">Record Payment</button>
              </form>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Revenue summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <MiniStat
                  label="Total Revenue"
                  value={`$${totalRevenue.toFixed(2)}`}
                  color="#16a34a"
                />
                <MiniStat
                  label="Transactions"
                  value={data.transactions.length}
                  color="#2563eb"
                />
                <MiniStat
                  label="Posted"
                  value={data.transactions.filter(t => t.Status === 'Posted').length}
                  color="#7c3aed"
                />
              </div>

              <Card title="Transaction History" sub="Recent payment records">
                <DTable
                  headers={['ID', 'Appt', 'Patient', 'Method', 'Amount', 'Date', 'Status']}
                  rows={data.transactions}
                  empty="No transactions found."
                  renderRow={r => (
                    <tr key={r.TransactionID}>
                      <td style={td}><IBadge>{r.TransactionID}</IBadge></td>
                      <td style={td}>{r.AppointmentID}</td>
                      <td style={td}>{r.PatientLastName}, {r.PatientFirstName}</td>
                      <td style={td}>{r.PaymentText || r.PaymentCode || '—'}</td>
                      <td style={{ ...td, fontWeight: 600, color: '#111827' }}>${r.Amount}</td>
                      <td style={td}>{fmtDate(r.TransactionDateTime)}</td>
                      <td style={td}><SBadge s={r.Status} /></td>
                    </tr>
                  )}
                />
              </Card>
            </div>
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {activeTab === 'schedule' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                  Scheduling for:
                </label>
                <select
                  value={schedEmpId}
                  onChange={e => setSchedEmpId(e.target.value)}
                  style={{ ...inp, maxWidth: '320px', marginBottom: 0 }}
                >
                  <option value="">— select an employee —</option>
                  {data.employees.map(e => (
                    <option key={e.EmployeeID} value={e.EmployeeID}>
                      {e.LastName}, {e.FirstName} — {e.Role}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            {schedEmpId ? (
              <Card
                title={(() => { const e = data.employees.find(x => String(x.EmployeeID) === schedEmpId); return e ? `${e.FirstName} ${e.LastName}'s Schedule` : 'Schedule'; })()}
                sub="Click any day to set shift hours."
              >
                <WeekDayPicker
                  shifts={data.availability}
                  employeeId={schedEmpId}
                  onSave={handleShiftSave}
                />
              </Card>
            ) : (
              <Card title="All Staff Shifts" sub="Select an employee above to edit their schedule.">
                {data.availability.length === 0
                  ? <Empty text="No shifts scheduled yet." />
                  : <DTable
                      headers={['Employee', 'Role', 'Date', 'Start', 'End']}
                      rows={data.availability.slice(0, 25)}
                      renderRow={(r, i) => (
                        <tr key={r.ShiftID ?? i}>
                          <td style={td}>{r.FirstName} {r.LastName}</td>
                          <td style={td}><RoleBadge role={r.Role} /></td>
                          <td style={td}>{fmtDate(r.ShiftDate)}</td>
                          <td style={td}>{r.StartTime}</td>
                          <td style={td}>{r.EndTime}</td>
                        </tr>
                      )}
                    />
                }
              </Card>
            )}
          </div>
        )}

        {/* ── PATIENTS ── */}
        {activeTab === 'patients' && (
          <Card
            title="Patient Registry"
            sub={`${data.patients.length} registered patients`}
          >
            {data.patients.length === 0
              ? <Empty text="No patients found." />
              : <DTable
                  headers={['ID', 'Last Name', 'First Name']}
                  rows={data.patients}
                  renderRow={p => (
                    <tr key={p.PatientID}>
                      <td style={td}><IBadge>{p.PatientID}</IBadge></td>
                      <td style={{ ...td, fontWeight: 600 }}>{p.LastName}</td>
                      <td style={td}>{p.FirstName}</td>
                    </tr>
                  )}
                />
            }
          </Card>
        )}

        {/* ── STAFF ── */}
        {activeTab === 'staff' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <MiniStat label="Total Staff"  value={data.employees.length} color="#7c3aed" />
              <MiniStat label="Doctors"      value={data.doctors.length}   color="#2563eb" />
              <MiniStat label="Other Staff"  value={data.employees.length - data.doctors.length} color="#d97706" />
            </div>
            <Card title="All Staff" sub="Clinic employees and their roles">
              <DTable
                headers={['ID', 'Name', 'Role']}
                rows={data.employees}
                renderRow={e => (
                  <tr key={e.EmployeeID}>
                    <td style={td}><IBadge>{e.EmployeeID}</IBadge></td>
                    <td style={{ ...td, fontWeight: 600 }}>{e.LastName}, {e.FirstName}</td>
                    <td style={td}><RoleBadge role={e.Role} /></td>
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

/* ── UI Helpers ────────────────────────────────────────────────── */

function StatCard({ icon, value, label, sub, color, bg, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white', borderRadius: '14px', padding: '20px 22px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer',
        border: '1px solid #f3f4f6', transition: 'box-shadow 0.15s',
        display: 'flex', alignItems: 'flex-start', gap: '14px',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'}
    >
      <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginTop: '3px' }}>{label}</div>
        {sub && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ background: 'white', borderRadius: '12px', padding: '16px 20px', border: `2px solid ${color}20`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: '22px', fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, marginTop: '3px' }}>{label}</div>
    </div>
  );
}

function ActionBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #e5e7eb',
      background: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
      fontFamily: 'inherit', color: '#1e2b1b', transition: 'background 0.12s, border-color 0.12s',
    }}
      onMouseEnter={e => { e.currentTarget.style.background = '#1e2b1b'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = '#1e2b1b'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#1e2b1b'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
    >
      {children}
    </button>
  );
}

function Card({ title, sub, children, action }) {
  return (
    <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #f3f4f6' }}>
      {(title || sub || action) && (
        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            {title && <h2 style={{ margin: '0 0 3px', fontSize: '16px', fontWeight: 700, color: '#111827' }}>{title}</h2>}
            {sub && <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>{sub}</p>}
          </div>
          {action && (
            <button onClick={action.onClick} style={{ padding: '5px 12px', borderRadius: '6px', border: '1.5px solid #e5e7eb', background: 'white', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {action.label}
            </button>
          )}
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
  else if (low.includes('posted'))                            { bg = '#dcfce7'; color = '#166534'; }
  else if (low.includes('void'))                              { bg = '#f3f4f6'; color = '#6b7280'; }
  else if (low.includes('refund'))                            { bg = '#fef3c7'; color = '#d97706'; }
  else if (low.includes('paid'))                              { bg = '#dcfce7'; color = '#166534'; }
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: bg, color }}>{s || 'Unknown'}</span>;
}

function RoleBadge({ role }) {
  const r = (role || '').toLowerCase();
  let bg = '#f3f4f6', color = '#6b7280';
  if (r === 'doctor')    { bg = '#dbeafe'; color = '#1d4ed8'; }
  else if (r === 'nurse' || r === 'receptionist') { bg = '#fef3c7'; color = '#d97706'; }
  return <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, background: bg, color }}>{role || '—'}</span>;
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
function CalendarIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function DollarIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}
function PersonIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
}
function TeamIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}

/* ── Styles ────────────────────────────────────────────────────── */
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
