import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function getWeekDates(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatHour(hour) {
  if (hour === 12) return '12:00 PM';
  return hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
}

function toLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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

const styles = {
  wrap: { padding: '1.5rem', maxWidth: '860px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' },
  heading: { fontSize: '22px', fontWeight: 500, marginBottom: '1.5rem', color: '#1e2b1b' },
  sectionHeading: { fontSize: '12px', fontWeight: 500, marginBottom: '0.75rem', marginTop: '1.5rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' },
  th: { fontSize: '12px', fontWeight: 500, color: '#6b7280', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' },
  td: { fontSize: '13px', color: '#374151', padding: '12px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
  badge: (status) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 500,
    background: status === 'Scheduled' ? '#EAF3DE' : status === 'Paid' ? '#E6F1FB' : status === 'Cancelled' ? '#FAECE7' : '#f3f4f6',
    color: status === 'Scheduled' ? '#3B6D11' : status === 'Paid' ? '#185FA5' : status === 'Cancelled' ? '#993C1D' : '#6b7280',
    border: `1px solid ${status === 'Scheduled' ? '#C0DD97' : status === 'Paid' ? '#B5D4F4' : status === 'Cancelled' ? '#F5C4B3' : '#e5e7eb'}`,
  }),
  rescheduleBtn: { fontSize: '11px', padding: '5px 10px', background: 'white', color: '#185FA5', border: '1px solid #B5D4F4', borderRadius: '6px', cursor: 'pointer', marginRight: '6px', width: 'auto' },
  cancelBtn: { fontSize: '11px', padding: '5px 10px', background: 'white', color: '#993C1D', border: '1px solid #F5C4B3', borderRadius: '6px', cursor: 'pointer', width: 'auto' },
  emptyMsg: { fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', padding: '1rem 0' },
  divider: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '1.5rem 0' },
  backLink: { fontSize: '13px', color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginTop: '1rem' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox: { background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '420px', width: '90%' },
  modalHeading: { fontSize: '18px', fontWeight: 500, marginBottom: '0.75rem', color: '#1e2b1b' },
  modalSub: { fontSize: '14px', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 },
  modalBtns: { display: 'flex', gap: '10px' },
  confirmCancelBtn: { flex: 1, padding: '10px', background: '#993C1D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', width: 'auto' },
  dismissBtn: { flex: 1, padding: '10px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', width: 'auto' },
  calendarWrap: { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' },
  calHeading: { fontSize: '14px', fontWeight: 500, color: '#1e2b1b', marginBottom: '0.5rem' },
  weekNav: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' },
  navBtn: { fontSize: '12px', padding: '5px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', width: 'auto' },
  navBtnDisabled: { fontSize: '12px', padding: '5px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'not-allowed', opacity: 0.35, width: 'auto' },
  weekLabel: { fontSize: '13px', fontWeight: 500, color: '#374151' },
  calTh: { fontSize: '11px', fontWeight: 500, color: '#6b7280', padding: '8px 4px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' },
  timeCell: { fontSize: '10px', color: '#9ca3af', padding: '0 8px 0 0', textAlign: 'right', width: '60px', verticalAlign: 'middle' },
  slotAvailable: { padding: '6px 4px', textAlign: 'center', borderRadius: '4px', fontSize: '10px', fontWeight: 500, cursor: 'pointer', background: '#EAF3DE', color: '#3B6D11', border: '1px solid #C0DD97' },
  slotBooked: { padding: '6px 4px', textAlign: 'center', borderRadius: '4px', fontSize: '10px', fontWeight: 500, cursor: 'not-allowed', background: '#FAECE7', color: '#993C1D', border: '1px solid #F5C4B3' },
  slotPast: { padding: '6px 4px', textAlign: 'center', borderRadius: '4px', fontSize: '12px', cursor: 'not-allowed', background: '#f9fafb', color: '#d1d5db', border: '1px solid #f3f4f6' },
};

export default function Visits() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [error, setError] = useState('');
  const [bookingMsg, setBookingMsg] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates] = useState(getWeekDates(0));
  const [rescheduleError, setRescheduleError] = useState('');
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

  useEffect(() => { setWeekDates(getWeekDates(weekOffset)); }, [weekOffset]);

  const loadVisits = () => {
    fetch('/patient/api/visits', { credentials: 'include' })
      .then(res => { if (res.status === 401) { navigate('/patient/login'); return null; } return res.json(); })
      .then(data => {
        if (!data) return;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const up = data.filter(v => new Date(v.AppointmentDate) >= now && v.Status === 'Scheduled');
        const pa = data.filter(v => new Date(v.AppointmentDate) < now || v.Status === 'Paid' || v.Status === 'Cancelled');
        up.sort((a, b) => new Date(a.AppointmentDate) - new Date(b.AppointmentDate));
        pa.sort((a, b) => new Date(b.AppointmentDate) - new Date(a.AppointmentDate));
        setUpcoming(up);
        setPast(pa);
      })
      .catch(() => setError('Failed to load visits.'));
  };

  useEffect(() => { loadVisits(); }, [navigate]);

  useEffect(() => {
    if (!rescheduleTarget) return;
    const startDate = toLocalDateString(weekDates[0]);
    const endDate = toLocalDateString(weekDates[4]);
    fetch(`/patient/api/booked-slots?doctorId=${rescheduleTarget.DoctorID}&start=${startDate}&end=${endDate}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setBookedSlots(data))
      .catch(() => {});
  }, [rescheduleTarget, weekDates]);

  const handleCancel = async () => {
    const res = await fetch('/patient/cancel-appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: cancelTarget.AppointmentID }),
      credentials: 'include',
    });
    setCancelTarget(null);
    if (res.ok) { loadVisits(); }
    else { setError('Failed to cancel appointment.'); }
  };

  const handleReschedule = async (date, hour) => {
    setRescheduleError('');
    const dateStr = toLocalDateString(date);
    const hourStr = String(hour).padStart(2, '0');
    const newDate = `${dateStr}T${hourStr}:00`;
    const res = await fetch('/patient/reschedule-appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: rescheduleTarget.AppointmentID, newDate }),
      credentials: 'include',
    });
    if (res.ok) {
      setRescheduleTarget(null);
      setWeekOffset(0);
      loadVisits();
    } else {
      const msg = await res.json();
      setRescheduleError(msg.error || 'Failed to reschedule.');
    }
  };

  const isBooked = (date, hour) => {
    const dateStr = toLocalDateString(date);
    return bookedSlots.some(slot => {
      const slotLocal = new Date(slot.AppointmentDate);
      return toLocalDateString(slotLocal) === dateStr && slotLocal.getHours() === hour;
    });
  };

  const isPast = (date, hour) => {
    const now = new Date();
    const slotTime = new Date(date);
    slotTime.setHours(hour, 0, 0, 0);
    return slotTime < now;
  };

  const todayStr = toLocalDateString(new Date());

  return (
    <div style={styles.wrap}>
      <h1 style={styles.heading}>Visit history</h1>

      {bookingMsg && (
        <div style={{ background: '#EAF3DE', border: '1px solid #C0DD97', borderRadius: '8px', padding: '12px 16px', marginBottom: '1.5rem', fontSize: '14px', color: '#3B6D11', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>🎉</span>
          <span>{bookingMsg}</span>
        </div>
      )}
      {error && <p style={{ color: '#993C1D', fontSize: '13px' }}>{error}</p>}

      <p style={styles.sectionHeading}>Upcoming appointments</p>

      {upcoming.length === 0
        ? <p style={styles.emptyMsg}>No upcoming appointments.</p>
        : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Doctor</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {upcoming.map(v => (
                <React.Fragment key={v.AppointmentID}>
                  <tr style={{ background: rescheduleTarget?.AppointmentID === v.AppointmentID ? '#f0f7ff' : 'white' }}>
                    <td style={styles.td}>{formatDate(v.AppointmentDate)}</td>
                    <td style={styles.td}>{formatTime(v.AppointmentDate)}</td>
                    <td style={styles.td}>Dr. {v.FirstName} {v.LastName}</td>
                    <td style={styles.td}><span style={styles.badge(v.Status)}>{v.Status}</span></td>
                    <td style={styles.td}>
                      <button
                        style={styles.rescheduleBtn}
                        onClick={() => { setRescheduleTarget(v); setWeekOffset(0); setRescheduleError(''); }}
                      >
                        Reschedule
                      </button>
                      <button style={styles.cancelBtn} onClick={() => setCancelTarget(v)}>
                        Cancel
                      </button>
                    </td>
                  </tr>

                  {/* Inline reschedule calendar */}
                  {rescheduleTarget?.AppointmentID === v.AppointmentID && (
                    <tr>
                      <td colSpan={5} style={{ padding: '0 0 12px 0', background: '#f9fafb' }}>
                        <div style={styles.calendarWrap}>
                          <p style={styles.calHeading}>
                            Select a new time for your appointment with Dr. {v.FirstName} {v.LastName}
                          </p>
                          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1rem' }}>
                            Current: {formatDate(v.AppointmentDate)} at {formatTime(v.AppointmentDate)}
                          </p>
                          {rescheduleError && <p style={{ color: '#993C1D', fontSize: '12px', marginBottom: '0.5rem' }}>{rescheduleError}</p>}

                          <div style={styles.weekNav}>
                            <button onClick={() => setWeekOffset(w => w - 1)} disabled={weekOffset === 0} style={weekOffset === 0 ? styles.navBtnDisabled : styles.navBtn}>← Prev</button>
                            <span style={styles.weekLabel}>
                              {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekDates[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <button onClick={() => setWeekOffset(w => w + 1)} style={styles.navBtn}>Next →</button>
                          </div>

                          <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                              <thead>
                                <tr>
                                  <th style={{ width: '60px' }}></th>
                                  {weekDates.map((date, i) => {
                                    const isToday = toLocalDateString(date) === todayStr;
                                    return (
                                      <th key={i} style={{ ...styles.calTh, color: isToday ? '#185FA5' : '#6b7280' }}>
                                        <div>{SHORT_DAYS[i]}</div>
                                        <div style={{ fontSize: '15px', fontWeight: 500 }}>{date.getDate()}</div>
                                      </th>
                                    );
                                  })}
                                </tr>
                              </thead>
                              <tbody>
                                {HOURS.map(hour => (
                                  <tr key={hour}>
                                    <td style={styles.timeCell}>{formatHour(hour)}</td>
                                    {weekDates.map((date, i) => {
                                      const booked = isBooked(date, hour);
                                      const past = isPast(date, hour);
                                      const unavailable = booked || past;
                                      return (
                                        <td key={i} style={{ padding: '2px 3px' }}>
                                          <div
                                            onClick={() => !unavailable && handleReschedule(date, hour)}
                                            style={past ? styles.slotPast : booked ? styles.slotBooked : styles.slotAvailable}
                                            onMouseEnter={e => { if (!unavailable) e.currentTarget.style.opacity = '0.7'; }}
                                            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                                          >
                                            {past ? '–' : booked ? 'Booked' : 'Available'}
                                          </div>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          <button
                            onClick={() => { setRescheduleTarget(null); setWeekOffset(0); }}
                            style={{ marginTop: '0.75rem', fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 'auto' }}
                          >
                            ✕ Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )
      }

      <hr style={styles.divider} />

      <p style={styles.sectionHeading}>Past visits</p>
      {past.length === 0
        ? <p style={styles.emptyMsg}>No past visits on record.</p>
        : (
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
              {past.map(v => (
                <tr key={v.AppointmentID} style={{ background: 'white' }}>
                  <td style={styles.td}>{formatDate(v.AppointmentDate)}</td>
                  <td style={styles.td}>{formatTime(v.AppointmentDate)}</td>
                  <td style={styles.td}>Dr. {v.FirstName} {v.LastName}</td>
                  <td style={styles.td}><span style={styles.badge(v.Status)}>{v.Status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }

      <a href="/patient/profile" style={styles.backLink}>← Back to profile</a>

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <div style={styles.modal}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalHeading}>Cancel appointment</h3>
            <p style={styles.modalSub}>
              Are you sure you want to cancel your appointment with <strong>Dr. {cancelTarget.FirstName} {cancelTarget.LastName}</strong> on <strong>{formatDate(cancelTarget.AppointmentDate)}</strong> at <strong>{formatTime(cancelTarget.AppointmentDate)}</strong>? This cannot be undone.
            </p>
            <div style={styles.modalBtns}>
              <button style={styles.confirmCancelBtn} onClick={handleCancel}>Yes, cancel it</button>
              <button style={styles.dismissBtn} onClick={() => setCancelTarget(null)}>Keep appointment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
