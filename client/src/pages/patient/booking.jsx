import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

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

const styles = {
  wrap: { padding: '1.5rem', maxWidth: '860px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' },
  heading: { fontSize: '22px', fontWeight: 500, marginBottom: '1.5rem', color: '#1e2b1b' },
  doctorGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '2rem' },
  doctorCard: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', border: '1.5px solid #e5e7eb', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontFamily: 'Poppins, sans-serif', transition: 'border-color 0.15s, background 0.15s', width: '100%' },
  doctorAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#1e2b1b', color: 'white', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  doctorCardInfo: { display: 'flex', flexDirection: 'column', flex: 1 },
  doctorCardName: { fontSize: '14px', fontWeight: 600, color: '#1e2b1b' },
  doctorCardSpecialty: { fontSize: '12px', color: '#6b7280', marginTop: '2px' },
  doctorCardCheck: { fontSize: '16px', color: '#3b6d11', fontWeight: 700, flexShrink: 0 },
  weekNav: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1rem' },
  navBtn: { fontSize: '13px', padding: '6px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', cursor: 'pointer', width: 'auto' },
  navBtnDisabled: { fontSize: '13px', padding: '6px 14px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', cursor: 'not-allowed', opacity: 0.35, width: 'auto' },
  weekLabel: { fontSize: '14px', fontWeight: 500, color: '#111', minWidth: '200px', textAlign: 'center' },
  legend: { display: 'flex', gap: '20px', marginBottom: '1rem' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' },
  dot: { width: '10px', height: '10px', borderRadius: '50%' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: '12px', fontWeight: 500, color: '#6b7280', padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' },
  thToday: { fontSize: '12px', fontWeight: 500, color: '#185FA5', padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' },
  dayNum: { fontSize: '20px', fontWeight: 500, lineHeight: 1.2 },
  dayNumToday: { fontSize: '20px', fontWeight: 500, lineHeight: 1.2, background: '#E6F1FB', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#185FA5' },
  timeCell: { fontSize: '11px', color: '#9ca3af', padding: '0 10px 0 0', textAlign: 'right', whiteSpace: 'nowrap', width: '70px', verticalAlign: 'middle' },
  slotTd: { padding: '2px 3px' },
  slotAvailable: { padding: '8px 4px', textAlign: 'center', borderRadius: '6px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', background: '#EAF3DE', color: '#3B6D11', border: '1px solid #C0DD97', transition: 'opacity 0.15s' },
  slotBooked: { padding: '8px 4px', textAlign: 'center', borderRadius: '6px', fontSize: '11px', fontWeight: 500, cursor: 'not-allowed', background: '#FAECE7', color: '#993C1D', border: '1px solid #F5C4B3' },
  slotMine: { padding: '8px 4px', textAlign: 'center', borderRadius: '6px', fontSize: '11px', fontWeight: 500, cursor: 'pointer', background: '#FAEEDA', color: '#854F0B', border: '1px solid #FAC775' },
  slotPast: { padding: '8px 4px', textAlign: 'center', borderRadius: '6px', fontSize: '13px', fontWeight: 400, cursor: 'not-allowed', background: '#f9fafb', color: '#d1d5db', border: '1px solid #f3f4f6' },
  successBar: { background: '#EAF3DE', border: '1px solid #C0DD97', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', color: '#3B6D11', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' },
  errorBar: { background: '#FAECE7', border: '1px solid #F5C4B3', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', color: '#993C1D', marginBottom: '1rem' },
  checkCircle: { width: '18px', height: '18px', borderRadius: '50%', background: '#639922', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'white', fontSize: '11px', fontWeight: 700 },
  emptyMsg: { color: '#9ca3af', fontStyle: 'italic', fontSize: '14px', padding: '2rem 0' },
  backLink: { fontSize: '13px', color: '#6b7280', textDecoration: 'none', display: 'inline-block', marginTop: '1rem' },
};

export default function Booking() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates] = useState(getWeekDates(0));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [reason, setReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/patient/api/doctors', { credentials: 'include' })
      .then(res => { if (res.status === 401) { navigate('/login'); return null; } return res.json(); })
      .then(data => { if (data) setDoctors(data); })
      .catch(() => setError('Failed to load doctors.'));
  }, [navigate]);

  useEffect(() => { setWeekDates(getWeekDates(weekOffset)); }, [weekOffset]);

  useEffect(() => {
    if (!selectedDoctor) return;
    const startDate = toLocalDateString(weekDates[0]);
    const endDate = toLocalDateString(weekDates[4]);
    fetch(`/patient/api/booked-slots?doctorId=${selectedDoctor}&start=${startDate}&end=${endDate}`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => setBookedSlots(data))
      .catch(() => {});
  }, [selectedDoctor, weekDates]);

  const getSlotStatus = (date, hour) => {
    const dateStr = toLocalDateString(date);
    for (const slot of bookedSlots) {
      const slotLocal = new Date(slot.AppointmentDate);
      const slotDateStr = toLocalDateString(slotLocal);
      const slotHour = slotLocal.getHours();
      if (slotDateStr === dateStr && slotHour === hour) {
        return slot.conflictType; // 'doctor' or 'patient'
      }
    }
    return null;
  };

  const isPast = (date, hour) => {
    const now = new Date();
    const slotTime = new Date(date);
    slotTime.setHours(hour, 0, 0, 0);
    return slotTime < now;
  };

  const handleSlotClick = (date, hour, status) => {
    if (!selectedDoctor) { setError('Please select a doctor first.'); return; }
    setError('');
    setSuccess('');
    if (status === 'patient') {
      setError('You already have an appointment at this time. Please cancel it from your Visit History before booking a new one.');
      return;
    }
    const doctorObj = doctors.find(d => String(d.EmployeeID) === String(selectedDoctor));
    setReason('');
    setConfirmData({ date, hour, doctorName: doctorObj ? `Dr. ${doctorObj.FirstName} ${doctorObj.LastName}` : 'this doctor' });
  };

  const handleConfirmBooking = async () => {
    const { date, hour, doctorName } = confirmData;
    setConfirmData(null);
    setLoading(true);
    const dateStr = toLocalDateString(date);
    const hourStr = String(hour).padStart(2, '0');
    const datetime = `${dateStr}T${hourStr}:00`;
    const res = await fetch('/patient/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorId: selectedDoctor, date: datetime }),
      credentials: 'include',
    });
    setLoading(false);
    if (res.ok) {
      const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      const formattedTime = formatHour(hour);
      navigate(`/patient/visits?booked=true&doctor=${encodeURIComponent(doctorName)}&date=${encodeURIComponent(formattedDate)}&time=${encodeURIComponent(formattedTime)}`);
    } else {
      const msg = await res.json();
      setError(msg.error || 'Booking failed.');
    }
  };

  const todayStr = toLocalDateString(new Date());

  return (
    <>
      <Navbar />
      <div style={styles.wrap}>
      <h1 style={styles.heading}>Schedule an appointment</h1>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '1.5rem' }}>
        Select a doctor below to view their available time slots.
      </p>

      {/* Doctor cards */}
      <div style={styles.doctorGrid}>
        {doctors.map(doc => {
          const isSelected = String(doc.EmployeeID) === String(selectedDoctor);
          return (
            <button
              key={doc.EmployeeID}
              onClick={() => { setSelectedDoctor(String(doc.EmployeeID)); setSuccess(''); setError(''); }}
              style={{
                ...styles.doctorCard,
                borderColor: isSelected ? '#1e2b1b' : '#e5e7eb',
                background: isSelected ? '#f0f4ee' : 'white',
              }}
            >
              <div style={styles.doctorAvatar}>
                {doc.FirstName?.[0] ?? ''}{doc.LastName?.[0] ?? ''}
              </div>
              <div style={styles.doctorCardInfo}>
                <span style={styles.doctorCardName}>Dr. {doc.FirstName} {doc.LastName}</span>
                {doc.Specialty && <span style={styles.doctorCardSpecialty}>{doc.Specialty}</span>}
              </div>
              {isSelected && <span style={styles.doctorCardCheck}>✓</span>}
            </button>
          );
        })}
      </div>

      {success && (
        <div style={styles.successBar}>
          <div style={styles.checkCircle}>✓</div>
          <span>{success}</span>
        </div>
      )}
      {error && <div style={styles.errorBar}>{error}</div>}
      {loading && <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '1rem' }}>Booking...</div>}

      <div style={styles.weekNav}>
        <button
          onClick={() => { setWeekOffset(w => w - 1); setError(''); setSuccess(''); }}
          disabled={weekOffset === 0}
          style={weekOffset === 0 ? styles.navBtnDisabled : styles.navBtn}
        >← Previous</button>
        <span style={styles.weekLabel}>
          {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {weekDates[4].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <button onClick={() => { setWeekOffset(w => w + 1); setError(''); setSuccess(''); }} style={styles.navBtn}>
          Next →
        </button>
      </div>

      <div style={styles.legend}>
        <div style={styles.legendItem}><div style={{ ...styles.dot, background: '#639922' }}></div> Available</div>
        <div style={styles.legendItem}><div style={{ ...styles.dot, background: '#D85A30' }}></div> Booked</div>
        <div style={styles.legendItem}><div style={{ ...styles.dot, background: '#d1d5db' }}></div> Unavailable</div>
        <div style={styles.legendItem}><div style={{ ...styles.dot, background: '#BA7517' }}></div> Your appointment</div>
      </div>

      {selectedDoctor ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '70px' }}></th>
                {weekDates.map((date, i) => {
                  const isToday = toLocalDateString(date) === todayStr;
                  return (
                    <th key={i} style={isToday ? styles.thToday : styles.th}>
                      <div style={{ fontSize: '12px', marginBottom: '4px' }}>{SHORT_DAYS[i]}</div>
                      {isToday
                        ? <div style={styles.dayNumToday}>{date.getDate()}</div>
                        : <div style={styles.dayNum}>{date.getDate()}</div>
                      }
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
                    const status = getSlotStatus(date, hour);
                    const past = isPast(date, hour);
                    const slotStyle = past ? styles.slotPast : status === 'doctor' ? styles.slotBooked : status === 'patient' ? styles.slotMine : styles.slotAvailable;
                    const slotText = past ? '–' : status === 'doctor' ? 'Booked' : status === 'patient' ? 'My appt' : 'Available';
                    const clickable = !past && status !== 'doctor';
                    return (
                      <td key={i} style={styles.slotTd}>
                        <div
                          onClick={() => clickable && handleSlotClick(date, hour, status)}
                          style={slotStyle}
                          onMouseEnter={e => { if (clickable) e.currentTarget.style.opacity = '0.7'; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                        >
                          {slotText}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
      {confirmData && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', maxWidth: '420px', width: '90%', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 500, marginBottom: '0.75rem', color: '#1e2b1b' }}>Confirm appointment</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Please confirm you would like to book an appointment with <strong>{confirmData.doctorName}</strong> on <strong>{confirmData.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at <strong>{formatHour(confirmData.hour)}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleConfirmBooking}
                style={{ flex: 1, padding: '10px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', width: 'auto' }}
              >
                Confirm booking
              </button>
              <button
                onClick={() => setConfirmData(null)}
                style={{ flex: 1, padding: '10px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', width: 'auto' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      ) : (
        <p style={styles.emptyMsg}>Select a doctor above to see available time slots.</p>
      )}

      <a href="/patient/profile" style={styles.backLink}>← Back to profile</a>
    </div>
    </>
  );
}
