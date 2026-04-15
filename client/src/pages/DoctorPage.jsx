import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3000/api/doctor';

const styles = {
  page: {
    margin: 0,
    fontFamily: 'Arial, sans-serif',
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
  signOutButton: {
    background: 'white',
    color: '#1f2b1d',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: 'auto',
    marginTop: 0
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
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #cfcfcf',
    borderRadius: '8px',
    boxSizing: 'border-box',
    marginBottom: '12px',
    minHeight: '110px',
    resize: 'vertical'
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

export default function DoctorPage() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    upcomingAppointments: [],
    patientAppointmentInfo: [],
    visitLogs: [],
    appointmentOptions: []
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  const [visitForm, setVisitForm] = useState({
    appointmentId: '',
    symptoms: '',
    notes: '',
    dateTime: ''
  });

  const handleSignOut = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to sign out');
      }

      navigate('/patient/login');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const loadData = async () => {
    try {
      const res = await fetch(API_BASE, { credentials: 'include' });
      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load doctor data');
      }

      setData(result);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVisitSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/visit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(visitForm)
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to save visit');
      }

      setMessage({ type: 'success', text: result.message });
      setVisitForm({
        appointmentId: '',
        symptoms: '',
        notes: '',
        dateTime: ''
      });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.navbar}>
        <div><strong>Medical Clinic</strong> — Doctor Dashboard</div>
        <button onClick={handleSignOut} style={styles.signOutButton}>
          Sign Out
        </button>
      </div>

      <div style={styles.hero}>
        <h1>Doctor Responsibilities</h1>
        <p>Review patient appointment information, see visit logs, view upcoming appointments, and enter visit data.</p>
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
          <h2>Data Entry for Visits</h2>
          <form onSubmit={handleVisitSubmit}>
            <label>Appointment</label>
            <select
              style={styles.input}
              value={visitForm.appointmentId}
              onChange={(e) => setVisitForm({ ...visitForm, appointmentId: e.target.value })}
              required
            >
              <option value="">Select appointment</option>
              {data.appointmentOptions.map((row) => (
                <option key={row.AppointmentID} value={row.AppointmentID}>
                  Appt {row.AppointmentID} - {row.PatientLastName}, {row.PatientFirstName} with Dr. {row.DoctorLastName} on {row.AppointmentDate}
                </option>
              ))}
            </select>

            <label>Symptoms</label>
            <input
              style={styles.input}
              type="text"
              maxLength={100}
              value={visitForm.symptoms}
              onChange={(e) => setVisitForm({ ...visitForm, symptoms: e.target.value })}
            />

            <label>Notes</label>
            <textarea
              style={styles.textarea}
              maxLength={100}
              value={visitForm.notes}
              onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
            />

            <label>Visit Date and Time</label>
            <input
              style={styles.input}
              type="datetime-local"
              value={visitForm.dateTime}
              onChange={(e) => setVisitForm({ ...visitForm, dateTime: e.target.value })}
            />

            <button style={styles.button} type="submit">Add Visit Entry</button>
          </form>
        </div>

        <div style={styles.card}>
          <h2>Upcoming Appointments</h2>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Appointment ID</th>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Doctor</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.upcomingAppointments.map((row) => (
                  <tr key={row.AppointmentID}>
                    <td style={styles.td}>{row.AppointmentID}</td>
                    <td style={styles.td}>{row.PatientLastName}, {row.PatientFirstName}</td>
                    <td style={styles.td}>{row.DoctorLastName}, {row.DoctorFirstName}</td>
                    <td style={styles.td}>{row.AppointmentDate}</td>
                    <td style={styles.td}>{row.AppointmentTime || ''}</td>
                    <td style={styles.td}>{row.StatusText || row.StatusCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.card}>
          <h2>Patient Appointment Information</h2>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Appointment ID</th>
                  <th style={styles.th}>Patient ID</th>
                  <th style={styles.th}>Patient Name</th>
                  <th style={styles.th}>Doctor ID</th>
                  <th style={styles.th}>Doctor Name</th>
                  <th style={styles.th}>Reason</th>
                  <th style={styles.th}>Office</th>
                </tr>
              </thead>
              <tbody>
                {data.patientAppointmentInfo.map((row) => (
                  <tr key={row.AppointmentID}>
                    <td style={styles.td}>{row.AppointmentID}</td>
                    <td style={styles.td}>{row.PatientID}</td>
                    <td style={styles.td}>{row.PatientLastName}, {row.PatientFirstName}</td>
                    <td style={styles.td}>{row.DoctorID}</td>
                    <td style={styles.td}>{row.DoctorLastName}, {row.DoctorFirstName}</td>
                    <td style={styles.td}>{row.ReasonForVisit || ''}</td>
                    <td style={styles.td}>{row.OfficeID}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={styles.card}>
          <h2>Visit Logs</h2>
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Visit ID</th>
                  <th style={styles.th}>Appointment ID</th>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Doctor</th>
                  <th style={styles.th}>Symptoms</th>
                  <th style={styles.th}>Notes</th>
                  <th style={styles.th}>Date Time</th>
                </tr>
              </thead>
              <tbody>
                {data.visitLogs.map((row) => (
                  <tr key={row.VisitID}>
                    <td style={styles.td}>{row.VisitID}</td>
                    <td style={styles.td}>{row.AppointmentID}</td>
                    <td style={styles.td}>{row.PatientLastName}, {row.PatientFirstName}</td>
                    <td style={styles.td}>{row.DoctorLastName}, {row.DoctorFirstName}</td>
                    <td style={styles.td}>{row.Symptoms || ''}</td>
                    <td style={styles.td}>{row.Notes || ''}</td>
                    <td style={styles.td}>{row.DateTime || ''}</td>
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