import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffNavbar from '../components/StaffNavbar';
import WeekDayPicker from '../components/WeekDayPicker';

const EMPLOYEE_API = '/api/employee';

const EMPLOYEE_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'payments', label: 'Payments' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'patients', label: 'Patients' },
  { id: 'staff', label: 'Staff' },
];

const RECEPTIONIST_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'appointments', label: 'Appointments' },
  { id: 'payments', label: 'Payments' },
  { id: 'patients', label: 'Patients' },
  { id: 'schedule', label: 'My Schedule' },
];

export default function EmployeePage({ mode = 'employee' }) {
  const isReceptionistPortal = mode === 'receptionist';
  const tabs = isReceptionistPortal ? RECEPTIONIST_TABS : EMPLOYEE_TABS;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [schedEmpId, setSchedEmpId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmingId, setConfirmingId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [data, setData] = useState({
    patients: [],
    doctors: [],
    employees: [],
    paymentMethods: [],
    appointments: [],
    transactions: [],
    availability: [],
  });
  const [bookForm, setBookForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    reasonForVisit: '',
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [schedDoctorId, setSchedDoctorId] = useState('');
  const [rescheduleData, setRescheduleData] = useState(null);
  const [payForm, setPayForm] = useState({
    appointmentId: '',
    patientId: '',
    paymentCode: '',
    amount: '',
    status: 'Posted',
    dueDate: '',
  });

  const loadTodaySchedule = async (doctorId = '') => {
    const url = `${EMPLOYEE_API}/today-schedule${doctorId ? `?doctorId=${doctorId}` : ''}`;
    fetch(url, { credentials: 'include' }).then(r => r.json()).then(d => { if (Array.isArray(d)) setTodaySchedule(d) }).catch(() => {});
  };

  const loadData = async () => {
    try {
      const endpoint = isReceptionistPortal ? `${EMPLOYEE_API}/receptionist` : EMPLOYEE_API;
      const response = await fetch(endpoint, { credentials: 'include' });
      const payload = await response.json();
      if (!payload.success) {
        throw new Error(payload.error || `Failed to load ${isReceptionistPortal ? 'receptionist' : 'employee'} workspace.`);
      }
      setData((current) => ({
        ...current,
        ...payload,
        employees: payload.employees || [],
      }));
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };


  useEffect(() => {
    fetch('/api/employee/session', { credentials: 'include' })
      .then(res => res.json())
      .then(session => {
        if (!session.isLoggedIn) {
          navigate('/staff-login');
          return;
        }

        if (session.role === 'Receptionist') {
          if (!isReceptionistPortal) {
            navigate('/receptionist');
            return;
          }
        } else if (isReceptionistPortal) {
          if (session.role === 'Doctor') navigate('/doctor');
          else if (session.role === 'Nurse') navigate('/nurse');
          else if (session.role === 'Admin') navigate('/admin');
          else navigate('/employee');
          return;
        }

        if (session.role === 'Doctor') {
          navigate('/doctor');
          return;
        }

        if (session.role === 'Nurse') {
          navigate('/nurse');
          return;
        }

        if (session.role === 'Admin') {
          navigate('/admin');
          return;
        }

        setStaffName(session.name || '');
        setStaffRole(session.role || 'Employee');
        setEmployeeId(String(session.id || ''));
        loadData();
        if (session.role === 'Receptionist') {
          loadTodaySchedule();
        }
      })
      .catch(() => navigate('/staff-login'));
  }, [isReceptionistPortal, navigate]);

  useEffect(() => {
    if (!message.text) return undefined;
    const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4500);
    return () => clearTimeout(timer);
  }, [message]);

  const post = async (url, body) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!payload.success) throw new Error(payload.error || 'Request failed.');
    return payload;
  };

  const handleBook = async (event) => {
    event.preventDefault();
    try {
      const payload = await post(`${EMPLOYEE_API}/book`, bookForm);
      setBookForm({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        reasonForVisit: '',
      });
      setMessage({ type: 'success', text: payload.message });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handlePayment = async (event) => {
    event.preventDefault();
    try {
      const payload = await post(`${EMPLOYEE_API}/payment`, payForm);
      setPayForm({
        appointmentId: '',
        patientId: '',
        paymentCode: '',
        amount: '',
        status: 'Posted',
        dueDate: '',
      });
      setMessage({ type: 'success', text: payload.message });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleShiftDelete = async (shift) => {
    try {
      await fetch(`${EMPLOYEE_API}/availability/${shift.ShiftID}`, { method: 'DELETE', credentials: 'include' });
      setMessage({ type: 'success', text: 'Shift removed.' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleShiftSave = async (slot) => {
    if (!isReceptionistPortal && !schedEmpId) {
      setMessage({ type: 'error', text: 'Select an employee before saving a shift.' });
      return;
    }

    try {
      const targetEmployeeId = isReceptionistPortal ? employeeId : schedEmpId;
      await post(`${EMPLOYEE_API}/availability`, { ...slot, employeeId: targetEmployeeId });
      setMessage({ type: 'success', text: 'Shift saved successfully.' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleConfirmAppointment = async (appointmentId) => {
    setConfirmingId(String(appointmentId));
    try {
      const response = await fetch(`${EMPLOYEE_API}/appointments/${appointmentId}/confirm`, {
        method: 'POST',
        credentials: 'include',
      });
      const payload = await response.json();
      if (!payload.success) throw new Error(payload.error || 'Failed to confirm appointment.');
      setMessage({ type: 'success', text: payload.message });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setConfirmingId('');
    }
  };

  const canConfirmAppointments = staffRole === 'Receptionist' || staffRole === 'Employee';
  const scheduledAppointments = data.appointments.filter(isScheduledStatus);
  const confirmedAppointments = data.appointments.filter(isConfirmedStatus);
  const overdueInvoices = data.transactions.filter(isOverdueTransaction);
  const totalRevenue = data.transactions.reduce((sum, transaction) => sum + Number(transaction.Amount || 0), 0);
  const staffRoleCounts = (data.employees || []).reduce((acc, employee) => {
    const key = employee.Role || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const filteredAppointments = data.appointments.filter((appointment) => {
    const text = `${appointment.AppointmentID} ${appointment.PatientFirstName} ${appointment.PatientLastName} ${appointment.DoctorFirstName} ${appointment.DoctorLastName} ${appointment.ReasonForVisit || ''}`.toLowerCase();
    const matchesSearch = text.includes(appointmentSearch.trim().toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : normalizeStatus(appointment.StatusText || appointment.StatusCode) === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPatients = data.patients.filter((patient) => {
    const text = `${patient.PatientID} ${patient.FirstName} ${patient.LastName}`.toLowerCase();
    return text.includes(patientSearch.trim().toLowerCase());
  });

  const selectedEmployee = (data.employees || []).find((employee) => String(employee.EmployeeID) === schedEmpId);

  return (
    <div style={pageShell}>
      <StaffNavbar />

      <div style={pageInner}>
        <section style={heroCard}>
          <div style={heroOrb} />
          <div style={heroContent}>
            <div>
              <p style={eyebrow}>{isReceptionistPortal ? 'Reception desk' : `${staffRole || 'Employee'} operations`}</p>
              <h1 style={heroTitle}>{staffName || 'Staff workspace'}</h1>
              <p style={heroText}>
                {isReceptionistPortal
                  ? 'This dashboard keeps the receptionist role focused on front-desk work: book visits, confirm appointments, manage payments, find patients, and review only your own schedule.'
                  : 'This dashboard is tuned for front-desk workflow: book visits, confirm appointments, track payments, and keep the clinic schedule organized with data that matches the current schema.'}
              </p>
            </div>
            <div style={heroHighlights}>
              <HeroStat label="Awaiting confirmation" value={scheduledAppointments.length} />
              <HeroStat label="Confirmed visits" value={confirmedAppointments.length} />
              <HeroStat label="Overdue invoices" value={overdueInvoices.length} />
            </div>
          </div>
        </section>

        <nav style={tabRow}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...tabButton,
                ...(activeTab === tab.id ? activeTabButton : null),
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {message.text && (
          <div style={message.type === 'success' ? successBanner : errorBanner}>
            {message.text}
          </div>
        )}

        {activeTab === 'overview' && (
          <div style={stackLayout}>
            <section style={metricGrid}>
              <MetricCard label="Appointments" value={data.appointments.length} detail="All recent bookings" tone="blue" />
              <MetricCard label="Need Confirmation" value={scheduledAppointments.length} detail="Scheduled but not confirmed" tone="amber" />
              {!isReceptionistPortal && <MetricCard label="Revenue Posted" value={`$${totalRevenue.toFixed(2)}`} detail={`${data.transactions.length} transactions tracked`} tone="green" />}
              <MetricCard label="Patients" value={data.patients.length} detail="Searchable patient roster" tone="plum" />
            </section>

            <section style={twoColumnLayout}>
              <SurfaceCard
                title="Confirmation Queue"
                subtitle={canConfirmAppointments
                  ? 'Reception and employee staff should confirm upcoming visits here.'
                  : 'This account can view the queue, but confirmation is intended for reception staff.'}
              >
                <DataTable
                  headers={['Patient', 'Doctor', 'When', 'Status', 'Action']}
                  rows={scheduledAppointments.slice(0, 6)}
                  empty="No appointments are waiting for confirmation."
                  renderRow={(row) => (
                    <tr key={row.AppointmentID}>
                      <td style={tableCellStrong}>
                        {row.PatientLastName}, {row.PatientFirstName}
                      </td>
                      <td style={tableCell}>
                        Dr. {row.DoctorLastName}
                        <div style={microText}>{row.Specialty || 'General'}</div>
                      </td>
                      <td style={tableCell}>
                        {fmtDate(row.AppointmentDate)}
                        <div style={microText}>{fmtTime(row.AppointmentDate, row.AppointmentTime)}</div>
                      </td>
                      <td style={tableCell}>
                        <StatusBadge status={row.StatusText || row.StatusCode} />
                      </td>
                      <td style={tableCell}>
                        {canConfirmAppointments ? (
                          <button
                            type="button"
                            onClick={() => handleConfirmAppointment(row.AppointmentID)}
                            disabled={confirmingId === String(row.AppointmentID)}
                            style={secondaryActionButton}
                          >
                            {confirmingId === String(row.AppointmentID) ? 'Confirming...' : 'Confirm'}
                          </button>
                        ) : (
                          <span style={microText}>Reception only</span>
                        )}
                      </td>
                    </tr>
                  )}
                />
              </SurfaceCard>

              <SurfaceCard title="Billing Snapshot" subtitle="Due dates and late-fee columns now surface directly from the transaction table">
                <DataTable
                  headers={['Patient', 'Amount', 'Due', 'Late Fee', 'Status']}
                  rows={data.transactions.slice(0, 6)}
                  empty="No transactions posted yet."
                  renderRow={(row) => (
                    <tr key={row.TransactionID}>
                      <td style={tableCellStrong}>
                        {row.PatientLastName}, {row.PatientFirstName}
                      </td>
                      <td style={tableCell}>${currency(row.Amount)}</td>
                      <td style={tableCell}>{fmtDate(row.DueDate)}</td>
                      <td style={tableCell}>${currency(row.LateFeeAmount)}</td>
                      <td style={tableCell}>
                        <StatusBadge status={row.Status} />
                      </td>
                    </tr>
                  )}
                />
              </SurfaceCard>
            </section>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div style={formLayout}>
            <SurfaceCard title="Book Appointment" subtitle="Creates a staff-booked appointment and stores it with CreatedVia = 1">
              <form onSubmit={handleBook}>
                <Field label="Patient">
                  <select
                    style={inputStyle}
                    value={bookForm.patientId}
                    onChange={(event) => setBookForm({ ...bookForm, patientId: event.target.value })}
                    required
                  >
                    <option value="">Select patient</option>
                    {data.patients.map((patient) => (
                      <option key={patient.PatientID} value={patient.PatientID}>
                        {patient.LastName}, {patient.FirstName} (#{patient.PatientID})
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Doctor">
                  <select
                    style={inputStyle}
                    value={bookForm.doctorId}
                    onChange={(event) => setBookForm({ ...bookForm, doctorId: event.target.value })}
                    required
                  >
                    <option value="">Select doctor</option>
                    {data.doctors.map((doctor) => (
                      <option key={doctor.EmployeeID} value={doctor.EmployeeID}>
                        Dr. {doctor.LastName}, {doctor.FirstName}{doctor.Specialty ? ` · ${doctor.Specialty}` : ''}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Date and Time">
                  <input
                    type="datetime-local"
                    style={inputStyle}
                    value={bookForm.appointmentDate}
                    onChange={(event) => setBookForm({ ...bookForm, appointmentDate: event.target.value })}
                    required
                  />
                </Field>

                <Field label="Reason for Visit">
                  <input
                    type="text"
                    maxLength={20}
                    style={inputStyle}
                    placeholder="Check-up, follow-up, pain, cleaning..."
                    value={bookForm.reasonForVisit}
                    onChange={(event) => setBookForm({ ...bookForm, reasonForVisit: event.target.value })}
                  />
                </Field>

                <button type="submit" style={primaryButton}>Book Appointment</button>
              </form>
            </SurfaceCard>

            <div style={stackLayout}>
              <SurfaceCard
                title="Appointment Workspace"
                subtitle="Search by patient, doctor, reason, or appointment ID"
                aside={
                  <div style={filterRow}>
                    <input
                      type="text"
                      value={appointmentSearch}
                      onChange={(event) => setAppointmentSearch(event.target.value)}
                      placeholder="Search appointments"
                      style={searchInput}
                    />
                    <select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      style={filterSelect}
                    >
                      <option value="all">All statuses</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="paid">Paid</option>
                    </select>
                  </div>
                }
              >
                <DataTable
                  headers={['ID', 'Patient', 'Doctor', 'When', 'Created Via', 'Status', 'Action']}
                  rows={filteredAppointments}
                  empty="No appointments match the current filters."
                  renderRow={(row) => (
                    <tr key={row.AppointmentID}>
                      <td style={tableCell}>
                        <IdBadge>{row.AppointmentID}</IdBadge>
                      </td>
                      <td style={tableCellStrong}>
                        {row.PatientLastName}, {row.PatientFirstName}
                        <div style={microText}>{row.ReasonForVisit || 'No reason recorded'}</div>
                      </td>
                      <td style={tableCell}>
                        Dr. {row.DoctorLastName}
                        <div style={microText}>{row.Specialty || 'General'}</div>
                      </td>
                      <td style={tableCell}>
                        {fmtDate(row.AppointmentDate)}
                        <div style={microText}>{fmtTime(row.AppointmentDate, row.AppointmentTime)}</div>
                      </td>
                      <td style={tableCell}>{row.CreatedVia === 1 ? 'Staff' : 'Patient'}</td>
                      <td style={tableCell}>
                        <StatusBadge status={row.StatusText || row.StatusCode} />
                      </td>
                      <td style={tableCell}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {isScheduledStatus(row) && (
                            canConfirmAppointments ? (
                              <button
                                type="button"
                                onClick={() => handleConfirmAppointment(row.AppointmentID)}
                                disabled={confirmingId === String(row.AppointmentID)}
                                style={secondaryActionButton}
                              >
                                {confirmingId === String(row.AppointmentID) ? 'Confirming...' : 'Confirm'}
                              </button>
                            ) : (
                              <span style={microText}>Reception only</span>
                            )
                          )}
                          {isReceptionistPortal && normalizeStatus(row.StatusText || row.StatusCode) !== 'cancelled' && normalizeStatus(row.StatusText || row.StatusCode) !== 'completed' && (
                            <button
                              type="button"
                              style={{ ...secondaryActionButton, background: '#fef2f2', color: '#b91c1c' }}
                              onClick={async () => {
                                if (!window.confirm('Cancel this appointment?')) return;
                                await fetch(`${EMPLOYEE_API}/appointments/${row.AppointmentID}/cancel`, { method: 'POST', credentials: 'include' });
                                loadData();
                              }}
                            >
                              Cancel
                            </button>
                          )}
                          {!isReceptionistPortal && !isScheduledStatus(row) && <span style={microText}>No action</span>}
                        </div>
                      </td>
                    </tr>
                  )}
                />
              </SurfaceCard>

              {isReceptionistPortal && (
                <SurfaceCard
                  title="Today's Doctor Schedule"
                  subtitle="All appointments for today — filter by doctor, reschedule or cancel"
                  aside={
                    <select
                      style={filterSelect}
                      value={schedDoctorId}
                      onChange={(e) => { setSchedDoctorId(e.target.value); loadTodaySchedule(e.target.value); }}
                    >
                      <option value="">All doctors</option>
                      {data.doctors.map(d => (
                        <option key={d.EmployeeID} value={d.EmployeeID}>Dr. {d.LastName}, {d.FirstName}</option>
                      ))}
                    </select>
                  }
                >
                  {rescheduleData && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px', display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>New date &amp; time</label>
                        <input
                          type="datetime-local"
                          style={{ ...inputStyle, width: 'auto' }}
                          value={rescheduleData.newDate}
                          onChange={e => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                        />
                      </div>
                      <button style={primaryButton} onClick={async () => {
                        await fetch(`${EMPLOYEE_API}/appointments/${rescheduleData.id}/reschedule`, {
                          method: 'PUT', credentials: 'include',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ newDate: rescheduleData.newDate })
                        });
                        setRescheduleData(null);
                        loadTodaySchedule(schedDoctorId);
                        loadData();
                      }}>Save</button>
                      <button style={secondaryActionButton} onClick={() => setRescheduleData(null)}>Cancel</button>
                    </div>
                  )}
                  <DataTable
                    headers={['Time', 'Patient', 'Doctor', 'Reason', 'Status', 'Actions']}
                    rows={todaySchedule}
                    empty="No appointments scheduled for today."
                    renderRow={(row) => (
                      <tr key={row.AppointmentID}>
                        <td style={tableCell}>{fmtTime(row.AppointmentDate, row.AppointmentTime)}</td>
                        <td style={tableCellStrong}>{row.PatFirst} {row.PatLast}</td>
                        <td style={tableCell}>Dr. {row.DoctorFirst} {row.DoctorLast}</td>
                        <td style={tableCell}>{row.ReasonForVisit || '—'}</td>
                        <td style={tableCell}><StatusBadge status={row.StatusText} /></td>
                        <td style={tableCell}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button style={secondaryActionButton} onClick={() => setRescheduleData({ id: row.AppointmentID, newDate: '' })}>Reschedule</button>
                            <button
                              style={{ ...secondaryActionButton, background: '#fef2f2', color: '#b91c1c', borderColor: '#fecaca' }}
                              onClick={async () => {
                                if (!window.confirm('Cancel this appointment?')) return;
                                await fetch(`${EMPLOYEE_API}/appointments/${row.AppointmentID}/cancel`, { method: 'POST', credentials: 'include' });
                                loadTodaySchedule(schedDoctorId);
                                loadData();
                              }}
                            >Cancel</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  />
                </SurfaceCard>
              )}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div style={formLayout}>
            <SurfaceCard title="Record Payment" subtitle="Payments now support DueDate so overdue invoice reporting can build on real transaction data">
              <form onSubmit={handlePayment}>
                <Field label="Patient">
                  <select
                    style={inputStyle}
                    value={payForm.patientId}
                    onChange={(event) => setPayForm({ ...payForm, patientId: event.target.value, appointmentId: '' })}
                    required
                  >
                    <option value="">Select patient</option>
                    {data.patients.map((patient) => (
                      <option key={patient.PatientID} value={patient.PatientID}>
                        {patient.LastName}, {patient.FirstName}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Appointment">
                  <select
                    style={inputStyle}
                    value={payForm.appointmentId}
                    onChange={(event) => setPayForm({ ...payForm, appointmentId: event.target.value })}
                    required
                  >
                    <option value="">{payForm.patientId ? 'Select appointment' : 'Select a patient first'}</option>
                    {data.appointments
                      .filter(a => String(a.PatientID) === String(payForm.patientId))
                      .map(a => (
                        <option key={a.AppointmentID} value={a.AppointmentID}>
                          #{a.AppointmentID} — {a.AppointmentDate ? String(a.AppointmentDate).split('T')[0] : ''} · Dr. {a.DoctorLastName} · {a.StatusText || ''}
                        </option>
                      ))}
                  </select>
                </Field>

                <Field label="Amount">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                    value={payForm.amount}
                    onChange={(event) => setPayForm({ ...payForm, amount: event.target.value })}
                    required
                  />
                </Field>

                <Field label="Payment Method">
                  <select
                    style={inputStyle}
                    value={payForm.paymentCode}
                    onChange={(event) => setPayForm({ ...payForm, paymentCode: event.target.value })}
                  >
                    <option value="">Select method</option>
                    {data.paymentMethods.map((method) => (
                      <option key={method.PaymentCode} value={method.PaymentCode}>
                        {method.PaymentText}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Status">
                  <select
                    style={inputStyle}
                    value={payForm.status}
                    onChange={(event) => setPayForm({ ...payForm, status: event.target.value })}
                  >
                    <option value="Posted">Posted</option>
                    <option value="Pending">Pending</option>
                    <option value="Void">Void</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </Field>

                <Field label="Due Date">
                  <input
                    type="date"
                    style={inputStyle}
                    value={payForm.dueDate}
                    onChange={(event) => setPayForm({ ...payForm, dueDate: event.target.value })}
                  />
                </Field>

                <button type="submit" style={primaryButton}>Record Payment</button>
              </form>
            </SurfaceCard>

            <div style={stackLayout}>
              <section style={metricGrid}>
                {!isReceptionistPortal && <MetricCard label="Posted Revenue" value={`$${totalRevenue.toFixed(2)}`} detail="Across recent transactions" tone="green" />}
                <MetricCard label="Overdue" value={overdueInvoices.length} detail="Invoices past due date" tone="amber" />
                <MetricCard label="Late Fees" value={`$${currency(data.transactions.reduce((sum, transaction) => sum + Number(transaction.LateFeeAmount || 0), 0))}`} detail="Current accrued fees" tone="blue" />
              </section>

              <SurfaceCard title="Transaction History" subtitle="Includes DueDate and LateFeeAmount from the schema for overdue billing visibility">
                <DataTable
                  headers={['ID', 'Patient', 'Amount', 'Method', 'Due', 'Late Fee', 'Status']}
                  rows={data.transactions}
                  empty="No transactions found."
                  renderRow={(row) => (
                    <tr key={row.TransactionID}>
                      <td style={tableCell}>
                        <IdBadge>{row.TransactionID}</IdBadge>
                      </td>
                      <td style={tableCellStrong}>
                        {row.PatientLastName}, {row.PatientFirstName}
                        <div style={microText}>Appointment #{row.AppointmentID}</div>
                      </td>
                      <td style={tableCell}>${currency(row.Amount)}</td>
                      <td style={tableCell}>{row.PaymentText || row.PaymentCode || 'Not set'}</td>
                      <td style={tableCell}>
                        {fmtDate(row.DueDate)}
                        {isOverdueTransaction(row) && <div style={microText}>{daysOverdue(row)} days overdue</div>}
                      </td>
                      <td style={tableCell}>${currency(row.LateFeeAmount)}</td>
                      <td style={tableCell}>
                        <StatusBadge status={row.Status} />
                      </td>
                    </tr>
                  )}
                />
              </SurfaceCard>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div style={stackLayout}>
            {isReceptionistPortal ? (
              <SurfaceCard
                title="My Schedule"
                subtitle="Review and add shifts only for your receptionist account."
              >
                <WeekDayPicker
                  shifts={data.availability}
                  employeeId={employeeId}
                  onSave={handleShiftSave}
                  onDelete={handleShiftDelete}
                />
              </SurfaceCard>
            ) : (
            <SurfaceCard
              title="Staff Schedule"
              subtitle="Choose an employee, then assign shifts for the week"
              aside={
                <select
                  value={schedEmpId}
                  onChange={(event) => setSchedEmpId(event.target.value)}
                  style={filterSelect}
                >
                  <option value="">Select an employee</option>
                  {data.employees.map((employee) => (
                    <option key={employee.EmployeeID} value={employee.EmployeeID}>
                      {employee.LastName}, {employee.FirstName} · {employee.Role}
                    </option>
                  ))}
                </select>
              }
            >
              {schedEmpId ? (
                <div>
                  <div style={selectedEmployeeBanner}>
                    Scheduling {selectedEmployee ? `${selectedEmployee.FirstName} ${selectedEmployee.LastName}` : 'employee'} ({selectedEmployee?.Role || 'Role not set'})
                  </div>
                  <WeekDayPicker
                    shifts={data.availability.filter(s => String(s.EmployeeID) === String(schedEmpId))}
                    employeeId={schedEmpId}
                    onSave={handleShiftSave}
                    onDelete={handleShiftDelete}
                  />
                </div>
              ) : (
                <DataTable
                  headers={['Employee', 'Role', 'Shift Date', 'Start', 'End']}
                  rows={data.availability}
                  empty="No shifts scheduled yet."
                  renderRow={(row, index) => (
                    <tr key={row.ShiftID || `${row.EmployeeID}-${index}`}>
                      <td style={tableCellStrong}>{row.FirstName} {row.LastName}</td>
                      <td style={tableCell}><RoleBadge role={row.Role} /></td>
                      <td style={tableCell}>{fmtDate(row.ShiftDate)}</td>
                      <td style={tableCell}>{row.StartTime || '—'}</td>
                      <td style={tableCell}>{row.EndTime || '—'}</td>
                    </tr>
                  )}
                />
              )}
            </SurfaceCard>
            )}
          </div>
        )}

        {activeTab === 'patients' && (
          <SurfaceCard
            title="Patient Directory"
            subtitle="Search patients by name or ID from the employee and receptionist view"
            aside={
              <input
                type="text"
                value={patientSearch}
                onChange={(event) => setPatientSearch(event.target.value)}
                placeholder="Search patient name or ID"
                style={searchInput}
              />
            }
          >
            <DataTable
              headers={['ID', 'Last Name', 'First Name']}
              rows={filteredPatients}
              empty="No patients match that search."
              renderRow={(row) => (
                <tr key={row.PatientID}>
                  <td style={tableCell}>
                    <IdBadge>{row.PatientID}</IdBadge>
                  </td>
                  <td style={tableCellStrong}>{row.LastName}</td>
                  <td style={tableCell}>{row.FirstName}</td>
                </tr>
              )}
            />
          </SurfaceCard>
        )}

        {!isReceptionistPortal && activeTab === 'staff' && (
          <div style={stackLayout}>
            <section style={metricGrid}>
              <MetricCard label="Total Staff" value={data.employees.length} detail="Employee records in scope" tone="plum" />
              <MetricCard label="Doctors" value={staffRoleCounts.Doctor || 0} detail="Practitioners in the employee table" tone="blue" />
              <MetricCard label="Receptionists" value={staffRoleCounts.Receptionist || 0} detail="Front-desk staff now modeled as a distinct role" tone="amber" />
              <MetricCard label="Nurses" value={staffRoleCounts.Nurse || 0} detail="Clinical support staff" tone="green" />
            </section>


            <SurfaceCard title="Staff Directory" subtitle="Role breakdown aligned with the employee table">
              <DataTable
                headers={['ID', 'Name', 'Role']}
                rows={data.employees}
                empty="No employees found."
                renderRow={(row) => (
                  <tr key={row.EmployeeID}>
                    <td style={tableCell}>
                      <IdBadge>{row.EmployeeID}</IdBadge>
                    </td>
                    <td style={tableCellStrong}>
                      {row.LastName}, {row.FirstName}
                    </td>
                    <td style={tableCell}>
                      <RoleBadge role={row.Role} />
                    </td>
                  </tr>
                )}
              />
            </SurfaceCard>
          </div>
        )}
      </div>
    </div>
  );
}

function HeroStat({ label, value }) {
  return (
    <div style={heroStat}>
      <div style={heroStatValue}>{value}</div>
      <div style={heroStatLabel}>{label}</div>
    </div>
  );
}

function MetricCard({ label, value, detail, tone }) {
  const palette = toneStyles[tone] || toneStyles.blue;
  return (
    <article style={{ ...metricCard, background: palette.card }}>
      <div style={{ ...metricValue, color: palette.strong }}>{value}</div>
      <div style={metricLabel}>{label}</div>
      <div style={metricDetail}>{detail}</div>
    </article>
  );
}

function SurfaceCard({ title, subtitle, aside, children }) {
  return (
    <section style={surfaceCard}>
      {(title || subtitle || aside) && (
        <div style={surfaceHeader}>
          <div>
            {title && <h2 style={surfaceTitle}>{title}</h2>}
            {subtitle && <p style={surfaceSubtitle}>{subtitle}</p>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

function DataTable({ headers, rows, renderRow, empty }) {
  if (!rows.length) return <p style={emptyState}>{empty}</p>;

  return (
    <div style={tableWrap}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} style={tableHead}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map(renderRow)}</tbody>
      </table>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={fieldWrap}>
      <span style={fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function StatusBadge({ status }) {
  const text = String(status || 'Unknown');
  const normalized = text.toLowerCase();
  let style = badgeNeutral;

  if (normalized.includes('confirm')) style = badgePurple;
  else if (normalized.includes('schedule')) style = badgeBlue;
  else if (normalized.includes('cancel')) style = badgeRed;
  else if (normalized.includes('paid') || normalized.includes('complete') || normalized.includes('posted')) style = badgeGreen;
  else if (normalized.includes('pending')) style = badgeAmber;

  return <span style={{ ...badgeBase, ...style }}>{text}</span>;
}

function RoleBadge({ role }) {
  const normalized = String(role || '').toLowerCase();
  const style = normalized === 'doctor'
    ? badgeBlue
    : normalized === 'receptionist'
      ? badgePurple
      : normalized === 'nurse'
        ? badgeAmber
        : normalized === 'admin'
          ? badgeGreen
          : badgeNeutral;

  return <span style={{ ...badgeBase, ...style }}>{role || 'Unknown'}</span>;
}

function IdBadge({ children }) {
  return <span style={idBadge}>{children}</span>;
}

function normalizeStatus(status) {
  const text = String(status || '').toLowerCase();
  if (text.includes('confirm')) return 'confirmed';
  if (text.includes('schedule') || text === '1') return 'scheduled';
  if (text.includes('cancel') || text === '3') return 'cancelled';
  if (text.includes('complete') || text === '4') return 'completed';
  if (text.includes('paid') || text === '2') return 'paid';
  return text;
}

function isScheduledStatus(appointment) {
  return normalizeStatus(appointment.StatusText || appointment.StatusCode) === 'scheduled';
}

function isConfirmedStatus(appointment) {
  return normalizeStatus(appointment.StatusText || appointment.StatusCode) === 'confirmed';
}

function fmtDate(value) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value).split('T')[0] || String(value);
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtTime(dateValue, timeValue) {
  if (timeValue) {
    const [hours = 0, minutes = 0] = String(timeValue).split(':').map(Number);
    const tempDate = new Date();
    tempDate.setHours(hours, minutes, 0, 0);
    return tempDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  if (!dateValue) return '—';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function currency(value) {
  return Number(value || 0).toFixed(2);
}

function isOverdueTransaction(transaction) {
  if (!transaction.DueDate) return false;
  const due = new Date(transaction.DueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return due < today && String(transaction.Status || '').toLowerCase() !== 'posted';
}

function daysOverdue(transaction) {
  if (!transaction.DueDate) return 0;
  const due = new Date(transaction.DueDate);
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.max(0, Math.round((today - due) / 86400000));
}

const toneStyles = {
  blue: { card: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 100%)', strong: '#3730a3' },
  amber: { card: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)', strong: '#b45309' },
  green: { card: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)', strong: '#047857' },
  plum: { card: 'linear-gradient(135deg, #faf5ff 0%, #ffffff 100%)', strong: '#7e22ce' },
};

const pageShell = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at top right, #fde68a 0%, #fff7ed 28%, #eef2ff 62%, #f8fafc 100%)',
  fontFamily: '"Poppins", sans-serif',
};

const pageInner = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '28px 24px 64px',
};

const heroCard = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '28px',
  background: 'linear-gradient(135deg, #3b2f73 0%, #284b8f 48%, #0f766e 100%)',
  color: '#ffffff',
  boxShadow: '0 24px 56px rgba(41, 62, 133, 0.22)',
};

const heroOrb = {
  position: 'absolute',
  right: '-50px',
  top: '-60px',
  width: '220px',
  height: '220px',
  borderRadius: '999px',
  background: 'rgba(255, 255, 255, 0.1)',
};

const heroContent = {
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 2fr) minmax(260px, 1fr)',
  gap: '20px',
  alignItems: 'end',
  padding: '30px',
};

const eyebrow = {
  margin: 0,
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  fontWeight: 700,
  opacity: 0.82,
};

const heroTitle = {
  margin: '10px 0 12px',
  fontSize: 'clamp(28px, 4vw, 42px)',
  lineHeight: 1,
};

const heroText = {
  margin: 0,
  maxWidth: '650px',
  lineHeight: 1.65,
  color: 'rgba(255, 255, 255, 0.88)',
};

const heroHighlights = {
  display: 'grid',
  gap: '12px',
};

const heroStat = {
  borderRadius: '18px',
  padding: '14px 16px',
  background: 'rgba(255, 255, 255, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
};

const heroStatValue = {
  fontSize: '26px',
  fontWeight: 700,
  lineHeight: 1,
};

const heroStatLabel = {
  marginTop: '6px',
  fontSize: '12px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  opacity: 0.82,
};

const tabRow = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  margin: '24px 0 18px',
};

const tabButton = {
  border: '1px solid rgba(15, 23, 42, 0.08)',
  borderRadius: '999px',
  background: 'rgba(255, 255, 255, 0.84)',
  color: '#475569',
  padding: '10px 18px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const activeTabButton = {
  background: '#312e81',
  color: '#ffffff',
  boxShadow: '0 12px 26px rgba(49, 46, 129, 0.24)',
};

const successBanner = {
  marginBottom: '18px',
  padding: '14px 16px',
  borderRadius: '16px',
  background: '#ecfdf5',
  border: '1px solid #bbf7d0',
  color: '#166534',
  fontSize: '14px',
  fontWeight: 600,
};

const errorBanner = {
  marginBottom: '18px',
  padding: '14px 16px',
  borderRadius: '16px',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#991b1b',
  fontSize: '14px',
  fontWeight: 600,
};

const stackLayout = {
  display: 'grid',
  gap: '18px',
};

const metricGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '16px',
};

const metricCard = {
  borderRadius: '22px',
  padding: '20px 22px',
  border: '1px solid rgba(148, 163, 184, 0.14)',
  boxShadow: '0 16px 34px rgba(15, 23, 42, 0.07)',
};

const metricValue = {
  fontSize: '30px',
  lineHeight: 1,
  fontWeight: 700,
};

const metricLabel = {
  marginTop: '12px',
  fontSize: '15px',
  color: '#0f172a',
  fontWeight: 600,
};

const metricDetail = {
  marginTop: '4px',
  fontSize: '13px',
  color: '#64748b',
};

const twoColumnLayout = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
  gap: '18px',
};

const formLayout = {
  display: 'grid',
  gridTemplateColumns: 'minmax(300px, 360px) minmax(0, 1fr)',
  gap: '18px',
  alignItems: 'start',
};

const surfaceCard = {
  background: 'rgba(255, 255, 255, 0.88)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.94)',
  boxShadow: '0 18px 44px rgba(15, 23, 42, 0.09)',
  padding: '24px',
  backdropFilter: 'blur(10px)',
};

const surfaceHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '12px',
  flexWrap: 'wrap',
  marginBottom: '16px',
};

const surfaceTitle = {
  margin: 0,
  color: '#0f172a',
  fontSize: '18px',
};

const surfaceSubtitle = {
  margin: '6px 0 0',
  color: '#64748b',
  fontSize: '13px',
  lineHeight: 1.5,
};

const filterRow = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
};

const searchInput = {
  minWidth: '240px',
  width: '100%',
  maxWidth: '320px',
  padding: '11px 14px',
  borderRadius: '14px',
  border: '1px solid #dbe4ea',
  background: '#f8fafc',
  color: '#0f172a',
  fontSize: '14px',
  fontFamily: 'inherit',
};

const filterSelect = {
  minWidth: '190px',
  padding: '11px 14px',
  borderRadius: '14px',
  border: '1px solid #dbe4ea',
  background: '#f8fafc',
  color: '#0f172a',
  fontSize: '14px',
  fontFamily: 'inherit',
};

const tableWrap = {
  overflowX: 'auto',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

const tableHead = {
  textAlign: 'left',
  padding: '11px 12px',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#64748b',
  borderBottom: '1px solid #e2e8f0',
  whiteSpace: 'nowrap',
};

const tableCell = {
  padding: '13px 12px',
  borderBottom: '1px solid #eef2f7',
  color: '#334155',
  fontSize: '14px',
  verticalAlign: 'top',
};

const tableCellStrong = {
  ...tableCell,
  fontWeight: 600,
  color: '#0f172a',
};

const microText = {
  marginTop: '4px',
  fontSize: '12px',
  color: '#94a3b8',
  fontWeight: 500,
};

const emptyState = {
  margin: 0,
  padding: '22px 8px',
  textAlign: 'center',
  color: '#94a3b8',
  fontSize: '14px',
};

const fieldWrap = {
  display: 'block',
  marginBottom: '14px',
};

const fieldLabel = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '13px',
  fontWeight: 600,
  color: '#334155',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  borderRadius: '14px',
  border: '1px solid #dbe4ea',
  background: '#f8fafc',
  padding: '12px 14px',
  fontSize: '14px',
  color: '#0f172a',
  fontFamily: 'inherit',
};

const primaryButton = {
  width: '100%',
  border: 'none',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #312e81 0%, #0f766e 100%)',
  color: '#ffffff',
  padding: '13px 18px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
  boxShadow: '0 14px 28px rgba(49, 46, 129, 0.18)',
};

const secondaryActionButton = {
  border: 'none',
  borderRadius: '12px',
  background: '#312e81',
  color: '#ffffff',
  padding: '9px 12px',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const selectedEmployeeBanner = {
  marginBottom: '16px',
  display: 'inline-flex',
  alignItems: 'center',
  padding: '9px 12px',
  borderRadius: '999px',
  background: '#eef2ff',
  color: '#3730a3',
  fontSize: '12px',
  fontWeight: 700,
};

const badgeBase = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 700,
};

const badgeBlue = { background: '#dbeafe', color: '#1d4ed8' };
const badgeGreen = { background: '#dcfce7', color: '#166534' };
const badgePurple = { background: '#ede9fe', color: '#6d28d9' };
const badgeRed = { background: '#fee2e2', color: '#b91c1c' };
const badgeAmber = { background: '#fef3c7', color: '#b45309' };
const badgeNeutral = { background: '#e2e8f0', color: '#475569' };

const idBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '34px',
  padding: '4px 9px',
  borderRadius: '10px',
  background: '#f1f5f9',
  color: '#334155',
  fontSize: '12px',
  fontWeight: 700,
};
