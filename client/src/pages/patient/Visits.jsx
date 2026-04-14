import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  wrap: { padding: '1.5rem', maxWidth: '860px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' },
  heading: { fontSize: '22px', fontWeight: 500, marginBottom: '1.5rem', color: '#1e2b1b' },
  sectionHeading: { fontSize: '15px', fontWeight: 500, marginBottom: '0.75rem', marginTop: '1.5rem', color: '#374151' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' },
  th: { fontSize: '12px', fontWeight: 500, color: '#6b7280', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
  td: { fontSize: '13px', color: '#374151', padding: '12px', borderBottom: '1px solid #f3f4f6' },
  badge: (status) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: 500,
    background: status === 'Scheduled' ? '#EAF3DE' : status === 'Paid' ? '#E6F1FB' : '#f3f4f6',
    color: status === 'Scheduled' ? '#3B6D11' : status === 'Paid' ? '#185FA5' : '#6b7280',
    border: `1px solid ${status === 'Scheduled' ? '#C0DD97' : status === 'Paid' ? '#B5D4F4' : '#e5e7eb'}`,
  }),
  emptyMsg: { fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', padding: '1rem 0' },
  backLink: { fontSize: '13px', color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginTop: '1rem' },
  divider: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '1.5rem 0' },
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  const h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, '0');
  if (h === 0 && min === '00') return '—';
  return h < 12 ? `${h}:${min} AM` : h === 12 ? `12:${min} PM` : `${h - 12}:${min} PM`;
}

export default function Visits() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [error, setError] = useState('');
  const [bookingMsg, setBookingMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('booked') === 'true') {
      const doctor = params.get('doctor');
      const date = params.get('date');
      const time = params.get('time');
      setBookingMsg(`Thank you for booking! Your appointment is with ${doctor} on ${date} at ${time}.`);
    }
  }, []);

  useEffect(() => {
    fetch('/patient/api/visits', { credentials: 'include' })
      .then(res => {
        if (res.status === 401) { navigate('/patient/login'); return null; }
        return res.json();
      })
      .then(data => {
        if (!data) return;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const up = data.filter(v => new Date(v.AppointmentDate) >= now && v.Status === 'Scheduled');
        const pa = data.filter(v => new Date(v.AppointmentDate) < now || v.Status === 'Paid');
        up.sort((a, b) => new Date(a.AppointmentDate) - new Date(b.AppointmentDate));
        pa.sort((a, b) => new Date(b.AppointmentDate) - new Date(a.AppointmentDate));
        setUpcoming(up);
        setPast(pa);
      })
      .catch(() => setError('Failed to load visits.'));
  }, [navigate]);

  const renderTable = (visits, empty) => {
    if (visits.length === 0) return <p style={styles.emptyMsg}>{empty}</p>;
    return (
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Time</th>
            <th style={styles.th}>Doctor</th>
            <th style={styles.th}>Status</th>
          </tr>
        </thead>
        <tbody>
          {visits.map(v => (
            <tr key={v.AppointmentID} style={{ background: 'white' }}>
              <td style={styles.td}>{formatDate(v.AppointmentDate)}</td>
              <td style={styles.td}>{formatTime(v.AppointmentDate)}</td>
              <td style={styles.td}>Dr. {v.FirstName} {v.LastName}</td>
              <td style={styles.td}><span style={styles.badge(v.Status)}>{v.Status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div style={styles.wrap}>
      <h1 style={styles.heading}>Visit history</h1>
      {bookingMsg && (
        <div style={{ background: '#EAF3DE', border: '1px solid #C0DD97', borderRadius: '8px', padding: '12px 16px', marginBottom: '1.5rem', fontSize: '14px', color: '#3B6D11', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>🎉</span>
          <span>{bookingMsg}</span>
        </div>
      )}
      {error && <p style={{ color: '#993C1D' }}>{error}</p>}

      <p style={styles.sectionHeading}>Upcoming appointments</p>
      {renderTable(upcoming, 'No upcoming appointments.')}

      <hr style={styles.divider} />

      <p style={styles.sectionHeading}>Past visits</p>
      {renderTable(past, 'No past visits on record.')}

      <a href="/patient/profile" style={styles.backLink}>← Back to profile</a>
    </div>
  );
}
