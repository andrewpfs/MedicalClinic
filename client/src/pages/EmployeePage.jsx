import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = '/api/employee';

const styles = {
  page: {
    margin: 0,
    fontFamily: 'Poppins, sans-serif',
    background: '#f4f1eb',
    color: '#222',
    minHeight: '100vh'
  },
  navbar: {
    background: '#1f2b1d',
    color: 'white',
    padding: '18px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navLinks: {
    display: 'flex',
    gap: '18px'
  },
  hero: {
    padding: '28px 24px 10px'
  },
  message: {
    margin: '16px 24px',
    padding: '12px 14px',
    borderRadius: '8px'
  },
  success: {
    background: '#e7f7e7',
    color: '#1f5d1f',
    border: '1px solid #b9e0b9'
  },
  error: {
    background: '#fdeaea',
    color: '#8a1f1f',
    border: '1px solid #f0bcbc'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(320px, 1fr))',
    gap: '20px',
    padding: '20px 24px 32px'
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #cfcfcf',
    borderRadius: '8px',
    boxSizing: 'border-box',
    marginBottom: '12px'
  },
  button: {
    width: '100%',
    marginTop: '14px',
    background: '#1f2b1d',
    color: 'white',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  tableWrap: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px'
  },
  th: {
    background: '#edf2ea',
    textAlign: 'left',
    padding: '10px 8px',
    borderBottom: '1px solid #ddd'
  },
  td: {
    textAlign: 'left',
    padding: '10px 8px',
    borderBottom: '1px solid #ddd',
    verticalAlign: 'top'
  }
};

export default function EmployeePage() {
  const navigate = useNavigate();
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [data, setData] = useState({
    patients: [],
    doctors: [],
    employees: [],
    paymentMethods: [],
    appointments: [],
    transactions: [],
    availability: []
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  const [bookForm, setBookForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    reasonForVisit: '',
    officeId: '1'
  });

  const [paymentForm, setPaymentForm] = useState({
    appointmentId: '',
    patientId: '',
    paymentCode: '',
    amount: '',
    status: 'Posted'
  });

  const [availabilityForm, setAvailabilityForm] = useState({
    employeeId: '',
    officeId: '',
    shiftDate: '',
    startTime: '',
    endTime: ''
  });

  const loadData = async () => {
    try {
      const res = await fetch(API_BASE, { credentials: 'include' });
      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load employee data');
      }

      setData(result);
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
        } else if (session.role === 'Doctor') {
          navigate('/doctor');
        } else if (session.role === 'Admin') {
          navigate('/admin');
        } else {
          setStaffName(session.name);
          setStaffRole(session.role);
          loadData();
        }
      })
      .catch(() => navigate('/staff-login'));
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('/api/employee/logout', { credentials: 'include' });
    navigate('/staff-login');
  };

  const postJson = async (url, payload) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!result.success) {
      throw new Error(result.error || 'Request failed');
    }
    return result;
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await postJson(`${API_BASE}/book`, bookForm);
      setMessage({ type: 'success', text: result.message });
      setBookForm({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        reasonForVisit: '',
        officeId: '1'
      });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await postJson(`${API_BASE}/payment`, paymentForm);
      setMessage({ type: 'success', text: result.message });
      setPaymentForm({
        appointmentId: '',
        patientId: '',
        paymentCode: '',
        amount: '',
        status: 'Posted'
      });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await postJson(`${API_BASE}/availability`, availabilityForm);
      setMessage({ type: 'success', text: result.message });
      setAvailabilityForm({
        employeeId: '',
        officeId: '',
        shiftDate: '',
        startTime: '',
        endTime: ''
      });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <div><strong>Medical Clinic</strong> — {staffRole || 'Employee'} Dashboard</div>
        <div style={styles.navLinks}>
          {staffName && <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px' }}>{staffName}</span>}
          <button onClick={handleLogout} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
            Log Out
          </button>
        </div>
      </div>

      <div style={styles.hero}>
        <h1>Employee Responsibilities</h1>
        <p>Book appointments, record payments, and set employee availability.</p>
      </div>

      {message.text && (
        <div
          style={{
            ...styles.message,
            ...(message.type === 'success' ? styles.success : styles.error)
          }}
        >
          {message.text}
        </div>
      )}

      <div style={styles.grid}>
        <div style={styles.card}>
          <h2>Book Appointment for Patient</h2>
          <form onSubmit={handleBookSubmit}>
            <label>Patient</label>
            <select
              style={styles.input}
              value={bookForm.patientId}
              onChange={(e) => setBookForm({ ...bookForm, patientId: e.target.value })}
              required
            >
              <option value="">Select patient</option>
              {data.patients.map((patient) => (
                <option key={patient.PatientID} value={patient.PatientID}>
                  {patient.LastName}, {patient.FirstName} (ID: {patient.PatientID})
                </option>
              ))}
            </select>

            <label>Doctor</label>
            <select
              style={styles.input}
              value={bookForm.doctorId}
              onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })}
              required
            >
              <option value="">Select doctor</option>
              {data.doctors.map((doctor) => (
                <option key={doctor.EmployeeID} value={doctor.EmployeeID}>
                  Dr. {doctor.LastName}, {doctor.FirstName} (ID: {doctor.EmployeeID})
                </option>
              ))}
            </select>

            <label>Appointment Date and Time</label>
            <input
              style={styles.input}
              type="datetime-local"
              value={bookForm.appointmentDate}
              onChange={(e) => setBookForm({ ...bookForm, appointmentDate: e.target.value })}
              required
            />

            <label>Reason for Visit</label>
            <input
              style={styles.input}
              type="text"
              maxLength={20}
              value={bookForm.reasonForVisit}
              onChange={(e) => setBookForm({ ...bookForm, reasonForVisit: e.target.value })}
            />

            <label>Office ID</label>
            <input
              style={styles.input}
              type="number"
              min="1"
              value={bookForm.officeId}
              onChange={(e) => setBookForm({ ...bookForm, officeId: e.target.value })}
              required
            />

            <button style={styles.button} type="submit">Book Appointment</button>
          </form>
        </div>

        <div style={styles.card}>
          <h2>Make Payment for Patient</h2>
          <form onSubmit={handlePaymentSubmit}>
            <label>Patient</label>
            <select
              style={styles.input}
              value={paymentForm.patientId}
              onChange={(e) => setPaymentForm({ ...paymentForm, patientId: e.target.value })}
              required
            >
              <option value="">Select patient</option>
              {data.patients.map((patient) => (
                <option key={patient.PatientID} value={patient.PatientID}>
                  {patient.LastName}, {patient.FirstName} (ID: {patient.PatientID})
                </option>
              ))}
            </select>

            <label>Appointment ID</label>
            <input
              style={styles.input}
              type="number"
              min="1"
              value={paymentForm.appointmentId}
              onChange={(e) => setPaymentForm({ ...paymentForm, appointmentId: e.target.value })}
              required
            />

            <label>Amount</label>
            <input
              style={styles.input}
              type="number"
              step="0.01"
              min="0"
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
              required
            />

            <label>Payment Method</label>
            <select
              style={styles.input}
              value={paymentForm.paymentCode}
              onChange={(e) => setPaymentForm({ ...paymentForm, paymentCode: e.target.value })}
            >
              <option value="">Select payment method</option>
              {data.paymentMethods.map((method) => (
                <option key={method.PaymentCode} value={method.PaymentCode}>
                  {method.PaymentText} (Code: {method.PaymentCode})
                </option>
              ))}
            </select>

            <label>Status</label>
            <select
              style={styles.input}
              value={paymentForm.status}
              onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
            >
              <option value="Posted">Posted</option>
              <option value="Pending">Pending</option>
              <option value="Void">Void</option>
              <option value="Refunded">Refunded</option>
            </select>

            <button style={styles.button} type="submit">Record Payment</button>
          </form>
        </div>

        <div style={styles.card}>
          <h2>Set Availability</h2>
          <form onSubmit={handleAvailabilitySubmit}>
            <label>Employee</label>
            <select
              style={styles.input}
              value={availabilityForm.employeeId}
              onChange={(e) => setAvailabilityForm({ ...availabilityForm, employeeId: e.target.value })}
              required
            >
              <option value="">Select employee</option>
              {data.employees.map((employee) => (
                <option key={employee.EmployeeID} value={employee.EmployeeID}>
                  {employee.LastName}, {employee.FirstName} - {employee.Role} (ID: {employee.EmployeeID})
                </option>
              ))}
            </select>

            <label>Shift Date</label>
            <input
              style={styles.input}
              type="date"
              value={availabilityForm.shiftDate}
              onChange={(e) => setAvailabilityForm({ ...availabilityForm, shiftDate: e.target.value })}
              required
            />

            <label>Start Time</label>
            <input
              style={styles.input}
              type="time"
              value={availabilityForm.startTime}
              onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
              required
            />

            <label>End Time</label>
            <input
              style={styles.input}
              type="time"
              value={availabilityForm.endTime}
              onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
              required
            />

            <label>Office ID</label>
            <input
              style={styles.input}
              type="number"
              min="1"
              value={availabilityForm.officeId}
              onChange={(e) => setAvailabilityForm({ ...availabilityForm, officeId: e.target.value })}
              required
            />

            <button style={styles.button} type="submit">Save Availability</button>
          </form>
        </div>

        <div style={styles.card}>
          <h2>Recent Appointments</h2>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Doctor</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Office</th>
                </tr>
              </thead>
              <tbody>
                {data.appointments.map((row) => (
                  <tr key={row.AppointmentID}>
                    <td style={styles.td}>{row.AppointmentID}</td>
                    <td style={styles.td}>{row.PatientLastName}, {row.PatientFirstName}</td>
                    <td style={styles.td}>{row.DoctorLastName}, {row.DoctorFirstName}</td>
                    <td style={styles.td}>{row.AppointmentDate}</td>
                    <td style={styles.td}>{row.AppointmentTime || ''}</td>
                    <td style={styles.td}>{row.ReasonForVisit || ''}</td>
                    <td style={styles.td}>{row.StatusText || row.StatusCode}</td>
                    <td style={styles.td}>{row.OfficeID}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.card}>
          <h2>Recent Payments</h2>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Transaction ID</th>
                  <th style={styles.th}>Appointment ID</th>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Payment Method</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}>Date Time</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((row) => (
                  <tr key={row.TransactionID}>
                    <td style={styles.td}>{row.TransactionID}</td>
                    <td style={styles.td}>{row.AppointmentID}</td>
                    <td style={styles.td}>{row.PatientLastName}, {row.PatientFirstName}</td>
                    <td style={styles.td}>{row.PaymentText || row.PaymentCode || ''}</td>
                    <td style={styles.td}>{row.Amount}</td>
                    <td style={styles.td}>{row.TransactionDateTime || ''}</td>
                    <td style={styles.td}>{row.Status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.card}>
          <h2>Saved Availability</h2>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Shift ID</th>
                  <th style={styles.th}>Employee</th>
                  <th style={styles.th}>Role</th>
                  <th style={styles.th}>Office</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Start</th>
                  <th style={styles.th}>End</th>
                </tr>
              </thead>
              <tbody>
                {data.availability.map((row) => (
                  <tr key={row.ShiftID}>
                    <td style={styles.td}>{row.ShiftID}</td>
                    <td style={styles.td}>{row.LastName}, {row.FirstName}</td>
                    <td style={styles.td}>{row.Role}</td>
                    <td style={styles.td}>{row.OfficeID}</td>
                    <td style={styles.td}>{row.ShiftDate}</td>
                    <td style={styles.td}>{row.StartTime}</td>
                    <td style={styles.td}>{row.EndTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}