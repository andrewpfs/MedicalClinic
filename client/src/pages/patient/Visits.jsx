import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './patient-layout.css';
import API from '../../api';

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const REVIEW_OPTIONS = [1, 2, 3, 4, 5];

function getWeekDates(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);

  return DAYS.map((_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function formatHour(hour) {
  if (hour === 12) return '12:00 PM';
  return hour < 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`;
}

function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTime(dateStr, timeStr) {
  if (timeStr) {
    const [hours = 0, minutes = 0] = String(timeStr).split(':').map(Number);
    const temp = new Date();
    temp.setHours(hours, minutes, 0, 0);
    return temp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  const date = new Date(dateStr);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (hours === 0 && minutes === '00') return 'Not set';
  if (hours === 12) return `12:${minutes} PM`;
  return hours < 12 ? `${hours}:${minutes} AM` : `${hours - 12}:${minutes} PM`;
}

function isCompletedVisit(visit) {
  const status = String(visit.Status || visit.StatusCode || '').toLowerCase();
  return status.includes('completed') || status === '4';
}

const styles = {
  body: { background: '#f5f3ee', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' },
  wrap: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 4rem' },
  sectionHeading: { fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '12px' },
  /* upcoming cards */
  apptCard: { background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '18px 22px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', flexWrap: 'wrap' },
  apptDate: { fontSize: '14px', fontWeight: 600, color: '#111827', minWidth: '140px' },
  apptTime: { fontSize: '14px', color: '#6b7280', minWidth: '90px' },
  apptDoctor: { fontSize: '14px', color: '#374151', flex: 1 },
  apptActions: { display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 },
  /* past visits table in a card */
  tableCard: { background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', overflow: 'hidden', marginBottom: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: '11px', fontWeight: 700, color: '#6b7280', padding: '11px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' },
  td: { fontSize: '13px', color: '#374151', padding: '13px 16px', borderBottom: '1px solid #f3f4f6', verticalAlign: 'middle' },
  badge: (status) => ({
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: 500,
    background: status === 'Scheduled' ? '#EAF3DE' : status === 'Paid' ? '#E6F1FB' : status === 'Cancelled' ? '#FAECE7' : status === 'Completed' ? '#E7F8EE' : '#f3f4f6',
    color: status === 'Scheduled' ? '#3B6D11' : status === 'Paid' ? '#185FA5' : status === 'Cancelled' ? '#993C1D' : status === 'Completed' ? '#166534' : '#6b7280',
    border: `1px solid ${status === 'Scheduled' ? '#C0DD97' : status === 'Paid' ? '#B5D4F4' : status === 'Cancelled' ? '#F5C4B3' : status === 'Completed' ? '#BBF7D0' : '#e5e7eb'}`,
  }),
  rescheduleBtn: { fontSize: '11px', padding: '5px 10px', background: 'white', color: '#185FA5', border: '1px solid #B5D4F4', borderRadius: '6px', cursor: 'pointer', marginRight: '6px', width: 'auto' },
  cancelBtn: { fontSize: '11px', padding: '5px 10px', background: 'white', color: '#993C1D', border: '1px solid #F5C4B3', borderRadius: '6px', cursor: 'pointer', width: 'auto' },
  reviewBtn: { fontSize: '11px', padding: '5px 10px', background: '#123524', color: 'white', border: '1px solid #123524', borderRadius: '6px', cursor: 'pointer', width: 'auto' },
  reviewStatus: { display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: '#eef2ff', color: '#4338ca' },
  emptyMsg: { fontSize: '13px', color: '#9ca3af', fontStyle: 'italic', padding: '1rem 0' },
  divider: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '1.5rem 0' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalBox: { background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '92%' },
  modalHeading: { fontSize: '18px', fontWeight: 500, marginBottom: '0.75rem', color: '#1e2b1b' },
  modalSub: { fontSize: '14px', color: '#6b7280', marginBottom: '1.25rem', lineHeight: 1.6 },
  modalBtns: { display: 'flex', gap: '10px', marginTop: '1rem' },
  confirmCancelBtn: { flex: 1, padding: '10px', background: '#993C1D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', width: 'auto' },
  saveBtn: { flex: 1, padding: '10px', background: '#123524', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', width: 'auto' },
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
  reviewOptions: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' },
  ratingButton: (selected) => ({
    padding: '9px 14px',
    borderRadius: '999px',
    border: `1px solid ${selected ? '#123524' : '#d1d5db'}`,
    background: selected ? '#123524' : '#ffffff',
    color: selected ? '#ffffff' : '#374151',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
  }),
  textarea: { width: '100%', minHeight: '120px', resize: 'vertical', borderRadius: '12px', border: '1px solid #d1d5db', padding: '12px 14px', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' },
  helperText: { fontSize: '12px', color: '#6b7280', marginTop: '0.5rem', lineHeight: 1.5 },
  reviewSummary: { display: 'grid', gap: '4px' },
  reviewComment: { color: '#6b7280', lineHeight: 1.55, maxWidth: '320px' },
  summaryBtn: { fontSize: '11px', padding: '5px 10px', background: '#eef2ff', color: '#4338ca', border: '1px solid #c7d2fe', borderRadius: '6px', cursor: 'pointer', width: 'auto', fontWeight: 600 },
  summaryBody: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', fontSize: '14px', color: '#1e293b', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: '0.5rem' },
  messageBtn: { fontSize: '11px', padding: '5px 10px', background: '#f0fdf4', color: '#166534', border: '1px solid #86efac', borderRadius: '6px', cursor: 'pointer', width: 'auto', fontWeight: 600 },
  chatWrap: { maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '12px' },
  bubblePatient: { padding: '8px 12px', borderRadius: '10px', background: '#EAF3DE', color: '#1e293b', fontSize: '13px', marginLeft: 'auto', maxWidth: '80%' },
  bubbleDoctor: { padding: '8px 12px', borderRadius: '10px', background: '#eef2ff', color: '#1e293b', fontSize: '13px', marginRight: 'auto', maxWidth: '80%' },
  bubbleSender: { fontWeight: 600, fontSize: '10px', color: '#64748b', marginBottom: '3px' },
  bubbleTime: { fontSize: '10px', color: '#94a3b8', marginTop: '3px' },
};

export default function Visits() {
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [error, setError] = useState('');
  const [bookingMsg, setBookingMsg] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates] = useState(getWeekDates(0));
  const [rescheduleError, setRescheduleError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [summaryVisit, setSummaryVisit] = useState(null);
  const [messageTarget, setMessageTarget] = useState(null);
  const [threadMessages, setThreadMessages] = useState([]);
  const [messageDraft, setMessageDraft] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState('');
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
    setWeekDates(getWeekDates(weekOffset));
  }, [weekOffset]);

  const loadVisits = () => {
    fetch(`${API}/patient/api/visits`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          navigate('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;

        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const upcomingVisits = data.filter(
          (visit) => new Date(visit.AppointmentDate) >= now && visit.Status !== 'Cancelled' && !isCompletedVisit(visit)
        );
        const pastVisits = data.filter((visit) => new Date(visit.AppointmentDate) < now || visit.Status === 'Cancelled' || isCompletedVisit(visit));

        upcomingVisits.sort((left, right) => new Date(left.AppointmentDate) - new Date(right.AppointmentDate));
        pastVisits.sort((left, right) => new Date(right.AppointmentDate) - new Date(left.AppointmentDate));

        setUpcoming(upcomingVisits);
        setPast(pastVisits);
      })
      .catch(() => setError('Failed to load visits.'));
  };

  useEffect(() => {
    loadVisits();
  }, [navigate]);

  useEffect(() => {
    if (!rescheduleTarget) return;

    const startDate = toLocalDateString(weekDates[0]);
    const endDate = toLocalDateString(weekDates[4]);

    fetch(`${API}/patient/api/booked-slots?doctorId=${rescheduleTarget.DoctorID}&start=${startDate}&end=${endDate}`, {
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => setBookedSlots(data))
      .catch(() => {});
  }, [rescheduleTarget, weekDates]);

  const handleCancel = async () => {
    const response = await fetch(`${API}/patient/cancel-appointment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: cancelTarget.AppointmentID }),
      credentials: 'include',
    });

    setCancelTarget(null);

    if (response.ok) loadVisits();
    else setError('Failed to cancel appointment.');
  };

  const handleReschedule = async (date, hour) => {
    setRescheduleError('');

    const dateStr = toLocalDateString(date);
    const hourStr = String(hour).padStart(2, '0');
    const newDate = `${dateStr}T${hourStr}:00`;

    const response = await fetch(`${API}/patient/reschedule-appointment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: rescheduleTarget.AppointmentID, newDate }),
      credentials: 'include',
    });

    if (response.ok) {
      setRescheduleTarget(null);
      setWeekOffset(0);
      loadVisits();
    } else {
      const payload = await response.json();
      setRescheduleError(payload.error || 'Failed to reschedule.');
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewTarget) return;

    setIsSubmittingReview(true);
    setReviewError('');

    try {
      const response = await fetch(`${API}/patient/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          appointmentId: reviewTarget.AppointmentID,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to save review.');

      setReviewTarget(null);
      setReviewForm({ rating: 5, comment: '' });
      loadVisits();
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const loadThread = async (appointmentId) => {
    try {
      const res = await fetch(`${API}/patient/api/messages/${appointmentId}`, { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) setThreadMessages(data);
    } catch {}
  };

  const handleOpenThread = (visit) => {
    setMessageTarget(visit);
    setMessageDraft('');
    setMessageError('');
    setThreadMessages([]);
    loadThread(visit.AppointmentID);
  };

  const handleSendMessage = async () => {
    if (!messageDraft.trim() || !messageTarget) return;
    setIsSendingMessage(true);
    setMessageError('');
    try {
      const res = await fetch(`${API}/patient/api/messages/${messageTarget.AppointmentID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ body: messageDraft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setMessageDraft('');
      loadThread(messageTarget.AppointmentID);
    } catch (err) {
      setMessageError(err.message);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const isBooked = (date, hour) => {
    const dateStr = toLocalDateString(date);
    return bookedSlots.some((slot) => {
      const slotLocal = new Date(slot.AppointmentDate);
      const slotHour = slot.AppointmentTime
        ? Number(String(slot.AppointmentTime).split(':')[0])
        : slotLocal.getHours();
      return toLocalDateString(slotLocal) === dateStr && slotHour === hour;
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
    <div style={styles.body}>
      <Navbar />

      <div className="pt-banner">
        <div className="pt-banner__inner">
          <div className="pt-banner__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
              <line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
          </div>
          <div>
            <h1 className="pt-banner__title">Visit History</h1>
            <p className="pt-banner__sub">Manage your upcoming and past appointments</p>
          </div>
        </div>
      </div>

      <div style={styles.wrap}>

        {bookingMsg && (
          <div style={{ background: '#EAF3DE', border: '1px solid #C0DD97', borderRadius: '10px', padding: '13px 16px', marginBottom: '1.5rem', fontSize: '14px', color: '#3B6D11' }}>
            {bookingMsg}
          </div>
        )}
        {error && <p style={{ color: '#993C1D', fontSize: '13px', marginBottom: '1rem' }}>{error}</p>}

        {/* ── Upcoming appointments ── */}
        <p style={styles.sectionHeading}>Upcoming appointments</p>

        {upcoming.length === 0 ? (
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>No upcoming appointments.</p>
          </div>
        ) : (
          <div style={{ marginBottom: '1.5rem' }}>
            {upcoming.map((visit) => (
              <React.Fragment key={visit.AppointmentID}>
                <div style={{ ...styles.apptCard, borderLeft: rescheduleTarget?.AppointmentID === visit.AppointmentID ? '4px solid #185FA5' : '4px solid #e5e7eb' }}>
                  <div style={styles.apptDate}>{formatDate(visit.AppointmentDate)}</div>
                  <div style={styles.apptTime}>{formatTime(visit.AppointmentDate, visit.AppointmentTime)}</div>
                  <div style={styles.apptDoctor}>Dr. {visit.FirstName} {visit.LastName}</div>
                  <span style={styles.badge(visit.Status)}>{visit.Status}</span>
                  <div style={styles.apptActions}>
                    <button style={styles.rescheduleBtn} onClick={() => { setRescheduleTarget(visit); setWeekOffset(0); setRescheduleError(''); }}>
                      Reschedule
                    </button>
                    <button style={styles.cancelBtn} onClick={() => setCancelTarget(visit)}>Cancel</button>
                  </div>
                </div>

                {rescheduleTarget?.AppointmentID === visit.AppointmentID && (
                  <div style={{ ...styles.calendarWrap, marginBottom: '10px', borderRadius: '14px' }}>
                    <p style={styles.calHeading}>Select a new time for your appointment with Dr. {visit.FirstName} {visit.LastName}</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '1rem' }}>
                      Current: {formatDate(visit.AppointmentDate)} at {formatTime(visit.AppointmentDate, visit.AppointmentTime)}
                    </p>
                    {rescheduleError && <p style={{ color: '#993C1D', fontSize: '12px', marginBottom: '0.5rem' }}>{rescheduleError}</p>}
                    <div style={styles.weekNav}>
                      <button onClick={() => setWeekOffset((v) => v - 1)} disabled={weekOffset === 0} style={weekOffset === 0 ? styles.navBtnDisabled : styles.navBtn}>Prev</button>
                      <span style={styles.weekLabel}>
                        {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekDates[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <button onClick={() => setWeekOffset((v) => v + 1)} style={styles.navBtn}>Next</button>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '60px' }}></th>
                            {weekDates.map((date, index) => {
                              const isToday = toLocalDateString(date) === todayStr;
                              return (
                                <th key={index} style={{ ...styles.calTh, color: isToday ? '#185FA5' : '#6b7280' }}>
                                  <div>{SHORT_DAYS[index]}</div>
                                  <div style={{ fontSize: '15px', fontWeight: 500 }}>{date.getDate()}</div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {HOURS.map((hour) => (
                            <tr key={hour}>
                              <td style={styles.timeCell}>{formatHour(hour)}</td>
                              {weekDates.map((date, index) => {
                                const booked = isBooked(date, hour);
                                const pastTime = isPast(date, hour);
                                const unavailable = booked || pastTime;
                                return (
                                  <td key={index} style={{ padding: '2px 3px' }}>
                                    <div
                                      onClick={() => !unavailable && handleReschedule(date, hour)}
                                      style={pastTime ? styles.slotPast : booked ? styles.slotBooked : styles.slotAvailable}
                                      onMouseEnter={(e) => { if (!unavailable) e.currentTarget.style.opacity = '0.7'; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                                    >
                                      {pastTime ? '-' : booked ? 'Booked' : 'Available'}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button onClick={() => { setRescheduleTarget(null); setWeekOffset(0); }}
                      style={{ marginTop: '0.75rem', fontSize: '12px', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 'auto' }}>
                      Close
                    </button>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* ── Past visits ── */}
        <p style={{ ...styles.sectionHeading, marginTop: '0.5rem' }}>Past visits</p>

        {past.length === 0 ? (
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>No past visits on record.</p>
          </div>
        ) : (
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Doctor</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Review</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {past.map((visit) => (
                  <tr key={visit.AppointmentID}>
                    <td style={styles.td}>{formatDate(visit.AppointmentDate)}</td>
                    <td style={styles.td}>{formatTime(visit.AppointmentDate, visit.AppointmentTime)}</td>
                    <td style={styles.td}>Dr. {visit.FirstName} {visit.LastName}</td>
                    <td style={styles.td}><span style={styles.badge(visit.Status)}>{visit.Status}</span></td>
                    <td style={styles.td}>
                      {Number(visit.HasReview) === 1 ? (
                        <div style={styles.reviewSummary}>
                          <span style={styles.reviewStatus}>{visit.ReviewRating}/5 rating</span>
                          <span style={styles.reviewComment}>{visit.ReviewComment || 'No comment left.'}</span>
                        </div>
                      ) : Number(visit.CanReview) === 1 ? (
                        <span style={styles.reviewStatus}>Ready for review</span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>Not available</span>
                      )}
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {visit.Status !== 'Cancelled' && (
                          <button type="button" style={styles.messageBtn} onClick={() => handleOpenThread(visit)}>Message</button>
                        )}
                        {visit.PatientSummary && (
                          <button type="button" style={styles.summaryBtn} onClick={() => setSummaryVisit(visit)}>View summary</button>
                        )}
                        {Number(visit.HasReview) === 1 ? (
                          <span style={{ color: '#64748b', fontSize: '12px' }}>Review submitted</span>
                        ) : Number(visit.CanReview) === 1 ? (
                          <button type="button" style={styles.reviewBtn} onClick={() => { setReviewTarget(visit); setReviewForm({ rating: 5, comment: '' }); setReviewError(''); }}>
                            Leave review
                          </button>
                        ) : (
                          !visit.PatientSummary && <span style={{ color: '#9ca3af', fontSize: '12px' }}>No action</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {summaryVisit && (
          <div style={styles.modal}>
            <div style={{ ...styles.modalBox, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', borderRadius: '16px' }}>
              <h3 style={styles.modalHeading}>Visit summary</h3>
              <p style={styles.modalSub}>
                <strong>Dr. {summaryVisit.FirstName} {summaryVisit.LastName}</strong> · {formatDate(summaryVisit.AppointmentDate)}
              </p>
              <div style={styles.summaryBody}>
                {summaryVisit.PatientSummary}
              </div>
              <div style={styles.modalBtns}>
                <button style={styles.dismissBtn} onClick={() => setSummaryVisit(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        {messageTarget && (
          <div style={styles.modal}>
            <div style={{ ...styles.modalBox, maxWidth: '540px' }}>
              <h3 style={styles.modalHeading}>Messages — Dr. {messageTarget.FirstName} {messageTarget.LastName}</h3>
              <p style={styles.modalSub}>Appointment · {formatDate(messageTarget.AppointmentDate)}</p>

              <div style={styles.chatWrap}>
                {threadMessages.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', padding: '1rem 0' }}>
                    No messages yet. Start the conversation below.
                  </p>
                ) : threadMessages.map((msg) => (
                  <div key={msg.MessageID} style={msg.SenderType === 'patient' ? styles.bubblePatient : styles.bubbleDoctor}>
                    <div style={styles.bubbleSender}>{msg.SenderType === 'patient' ? 'You' : `Dr. ${messageTarget.LastName}`}</div>
                    {msg.Body}
                    <div style={styles.bubbleTime}>
                      {new Date(msg.SentAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>

              <textarea
                style={styles.textarea}
                value={messageDraft}
                onChange={(e) => setMessageDraft(e.target.value)}
                placeholder="Write a message to your doctor..."
                rows={3}
              />
              {messageError && <p style={{ color: '#993C1D', fontSize: '12px', marginTop: '4px' }}>{messageError}</p>}

              <div style={styles.modalBtns}>
                <button style={styles.saveBtn} onClick={handleSendMessage} disabled={isSendingMessage || !messageDraft.trim()}>
                  {isSendingMessage ? 'Sending...' : 'Send'}
                </button>
                <button style={styles.dismissBtn} onClick={() => { setMessageTarget(null); setThreadMessages([]); }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {cancelTarget && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h3 style={styles.modalHeading}>Cancel appointment</h3>
              <p style={styles.modalSub}>
                Are you sure you want to cancel your appointment with <strong>Dr. {cancelTarget.FirstName} {cancelTarget.LastName}</strong> on <strong>{formatDate(cancelTarget.AppointmentDate)}</strong> at <strong>{formatTime(cancelTarget.AppointmentDate, cancelTarget.AppointmentTime)}</strong>? This cannot be undone.
              </p>
              <div style={styles.modalBtns}>
                <button style={styles.confirmCancelBtn} onClick={handleCancel}>Yes, cancel it</button>
                <button style={styles.dismissBtn} onClick={() => setCancelTarget(null)}>Keep appointment</button>
              </div>
            </div>
          </div>
        )}

        {reviewTarget && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h3 style={styles.modalHeading}>Leave a doctor review</h3>
              <p style={styles.modalSub}>
                Share feedback for Dr. {reviewTarget.FirstName} {reviewTarget.LastName} after your completed visit on {formatDate(reviewTarget.AppointmentDate)}.
              </p>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Rating</div>
                <div style={styles.reviewOptions}>
                  {REVIEW_OPTIONS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      style={styles.ratingButton(reviewForm.rating === value)}
                      onClick={() => setReviewForm((current) => ({ ...current, rating: value }))}
                    >
                      {value} / 5
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Comment</div>
                <textarea
                  style={styles.textarea}
                  value={reviewForm.comment}
                  onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
                  maxLength={1000}
                  placeholder="What went well? Was the explanation clear, respectful, and helpful?"
                />
                <div style={styles.helperText}>
                  One review is allowed per completed appointment. Comments are optional and stay attached to this visit.
                </div>
              </div>

              {reviewError && <p style={{ color: '#993C1D', fontSize: '12px', marginTop: '0.75rem' }}>{reviewError}</p>}

              <div style={styles.modalBtns}>
                <button style={styles.saveBtn} onClick={handleReviewSubmit} disabled={isSubmittingReview}>
                  {isSubmittingReview ? 'Saving...' : 'Submit review'}
                </button>
                <button
                  style={styles.dismissBtn}
                  onClick={() => {
                    setReviewTarget(null);
                    setReviewError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
