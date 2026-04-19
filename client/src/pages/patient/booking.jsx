import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './patient-layout.css';
import { formatDoctorRating, getDoctorImageUrl, getDoctorInitials } from '../../utils/doctorProfiles';
import API from '../../api';

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDates(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  // If today is Sunday, jump straight to next week
  const effectiveOffset = day === 0 ? offset + 1 : offset;
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + effectiveOffset * 7);
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

function bookingWindowLabel(weekDates) {
  return `${weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDates[5].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function formatBookingReason(reason) {
  return reason?.trim() ? reason.trim() : 'General visit';
}

export default function Booking() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [doctorShifts, setDoctorShifts] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekDates, setWeekDates] = useState(getWeekDates(0));
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [reason, setReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/patient/api/doctors`, { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          navigate('/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setDoctors(data);
      })
      .catch(() => setError('Failed to load doctors.'));
  }, [navigate]);

  useEffect(() => {
    setWeekDates(getWeekDates(weekOffset));
  }, [weekOffset]);

  useEffect(() => {
    if (!selectedDoctor) return;
    const startDate = toLocalDateString(weekDates[0]);
    const endDate = toLocalDateString(weekDates[4]);
    fetch(`${API}/patient/api/booked-slots?doctorId=${selectedDoctor}&start=${startDate}&end=${endDate}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setBookedSlots(data))
      .catch(() => {});
    fetch(`${API}/patient/api/doctor-shifts?doctorId=${selectedDoctor}&start=${startDate}&end=${endDate}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setDoctorShifts(data))
      .catch(() => {});
  }, [selectedDoctor, weekDates]);

  const isDoctorWorking = (date, hour) => {
    const dateStr = toLocalDateString(date);
    return doctorShifts.some((shift) => {
      const shiftDate = String(shift.ShiftDate).slice(0, 10);
      if (shiftDate !== dateStr) return false;
      const start = parseInt(String(shift.StartTime).split(':')[0], 10);
      const end = parseInt(String(shift.EndTime).split(':')[0], 10);
      return hour >= start && hour < end;
    });
  };

  const getSlotStatus = (date, hour) => {
    const dateStr = toLocalDateString(date);

    for (const slot of bookedSlots) {
      const slotDate = new Date(slot.AppointmentDate);
      const slotDateStr = toLocalDateString(slotDate);
      const slotHour = slot.AppointmentTime
        ? Number(String(slot.AppointmentTime).split(':')[0])
        : slotDate.getHours();

      if (slotDateStr === dateStr && slotHour === hour) {
        return slot.conflictType;
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
    if (!selectedDoctor) {
      setError('Please select a doctor first.');
      return;
    }

    setError('');

    if (status === 'patient') {
      setError('You already have an appointment at this time. Visit History is the best place to reschedule it.');
      return;
    }

    const doctor = doctors.find((entry) => String(entry.EmployeeID) === String(selectedDoctor));
    if (doctor && isSpecialistDoctor(doctor) && !hasActiveReferral(doctor)) {
      setError('An approved referral is required before booking this specialist.');
      return;
    }

    setReason('');
    setConfirmData({
      date,
      hour,
      doctor,
      doctorName: doctor ? `Dr. ${doctor.FirstName} ${doctor.LastName}` : 'this doctor',
    });
  };

  const handleConfirmBooking = async () => {
    if (!confirmData) return;

    const { date, hour, doctorName } = confirmData;
    setConfirmData(null);
    setLoading(true);

    const dateStr = toLocalDateString(date);
    const hourStr = String(hour).padStart(2, '0');
    const datetime = `${dateStr}T${hourStr}:00`;

    const response = await fetch(`${API}/patient/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doctorId: selectedDoctor,
        date: datetime,
        reason: formatBookingReason(reason),
      }),
      credentials: 'include',
    });

    setLoading(false);

    if (response.ok) {
      const formattedDate = date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      const formattedTime = formatHour(hour);
      navigate(`/patient/visits?booked=true&doctor=${encodeURIComponent(doctorName)}&date=${encodeURIComponent(formattedDate)}&time=${encodeURIComponent(formattedTime)}`);
      return;
    }

    const payload = await response.json();
    setError(payload.error || 'Booking failed.');
  };

  const selectedDoctorDetails = doctors.find((doctor) => String(doctor.EmployeeID) === String(selectedDoctor));
  const todayStr = toLocalDateString(new Date());
  const filteredDoctors = doctors.filter((doctor) => {
    const haystack = `${doctor.FirstName} ${doctor.LastName} ${doctor.Specialty || ''} ${doctor.DepartmentName || ''}`.toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  });

  return (
    <>
      <Navbar />
      <div style={pageShell}>
        <div style={pageInner}>
          <section style={heroCard}>
            <div style={heroPattern} />
            <div style={heroCopy}>
              <p style={eyebrow}>Patient scheduling</p>
              <h1 style={heroTitle}>Book the right doctor with confidence</h1>
              <p style={heroText}>
                Browse doctor cards, compare specialties and reviews, then pick a time slot from the live weekly grid.
              </p>
            </div>
            <div style={heroAside}>
              <div style={heroStat}>
                <div style={heroStatValue}>{doctors.length}</div>
                <div style={heroStatLabel}>Doctors available</div>
              </div>
              <div style={heroStat}>
                <div style={heroStatValue}>{selectedDoctorDetails ? bookingWindowLabel(weekDates) : 'Pick a doctor'}</div>
                <div style={heroStatLabel}>Current booking window</div>
              </div>
            </div>
          </section>

          <section style={layout}>
            <div style={leftRail}>
              <section style={surfaceCard}>
                <div style={sectionHeader}>
                  <div>
                    <h2 style={sectionTitle}>Choose a doctor</h2>
                    <p style={sectionSubtitle}>Every card shows specialty, clinic department, review summary, and whether specialist referral approval is on file.</p>
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search specialty or doctor name"
                    style={searchInput}
                  />
                </div>

                <div style={doctorGrid}>
                  {filteredDoctors.map((doctor) => {
                    const isSelected = String(doctor.EmployeeID) === String(selectedDoctor);

                    return (
                      <button
                        key={doctor.EmployeeID}
                        type="button"
                        onClick={() => {
                          setSelectedDoctor(String(doctor.EmployeeID));
                          setDoctorShifts([]);
                          setError('');
                        }}
                        style={{
                          ...doctorCard,
                          ...(isSelected ? doctorCardActive : null),
                        }}
                      >
                        <div style={doctorPhotoWrap}>
                          {doctor.ProfileImageUrl ? (
                            <img
                              src={getDoctorImageUrl(doctor)}
                              alt={`Dr. ${doctor.FirstName} ${doctor.LastName}`}
                              style={doctorPhoto}
                            />
                          ) : (
                            <div style={doctorAvatarFallback}>{getDoctorInitials(doctor)}</div>
                          )}
                        </div>

                        <div style={doctorCardBody}>
                          <div style={doctorCardTitle}>Dr. {doctor.FirstName} {doctor.LastName}</div>
                          <div style={doctorCardMeta}>{doctor.Specialty || 'General practice'}{doctor.DepartmentName ? ` - ${doctor.DepartmentName}` : ''}</div>
                          <div style={doctorCardRating}>{formatDoctorRating(doctor)}</div>
                          {isSpecialistDoctor(doctor) && (
                            <div style={hasActiveReferral(doctor) ? referralApprovedBadge : referralRequiredBadge}>
                              {hasActiveReferral(doctor)
                                ? `Referral approved${doctor.ReferralExpirationDate ? ` through ${formatReferralDate(doctor.ReferralExpirationDate)}` : ''}`
                                : 'Referral required'}
                            </div>
                          )}
                          <p style={doctorCardBio}>{doctor.Bio || 'No custom bio yet. Patients will still see the clinic default profile.'}</p>
                        </div>

                        <div style={doctorCardBadge}>{isSelected ? 'Selected' : 'View schedule'}</div>
                      </button>
                    );
                  })}
                </div>

                {!filteredDoctors.length && <p style={emptyState}>No doctors match that search.</p>}
              </section>
            </div>

            <div style={rightRail}>
              <section style={surfaceCard}>
                <div style={sectionHeader}>
                  <div>
                    <h2 style={sectionTitle}>Availability planner</h2>
                    <p style={sectionSubtitle}>
                      {selectedDoctorDetails
                        ? `Scheduling with Dr. ${selectedDoctorDetails.FirstName} ${selectedDoctorDetails.LastName}`
                        : 'Choose a doctor to unlock the live booking grid.'}
                    </p>
                  </div>
                  <div style={weekNav}>
                    <button
                      type="button"
                      onClick={() => setWeekOffset((value) => value - 1)}
                      disabled={weekOffset === 0}
                      style={weekOffset === 0 ? navButtonDisabled : navButton}
                    >
                      Prev
                    </button>
                    <span style={weekLabel}>{bookingWindowLabel(weekDates)}</span>
                    <button type="button" onClick={() => setWeekOffset((value) => value + 1)} style={navButton}>
                      Next
                    </button>
                  </div>
                </div>

                {selectedDoctorDetails ? (
                  <>
                    <div style={selectedDoctorBanner}>
                      <div style={selectedDoctorSummary}>
                        <div style={selectedDoctorName}>Dr. {selectedDoctorDetails.FirstName} {selectedDoctorDetails.LastName}</div>
                        <div style={selectedDoctorSub}>{selectedDoctorDetails.Specialty || 'General practice'} - {formatDoctorRating(selectedDoctorDetails)}</div>
                        {isSpecialistDoctor(selectedDoctorDetails) && (
                          <div style={hasActiveReferral(selectedDoctorDetails) ? referralApprovedInline : referralRequiredInline}>
                            {hasActiveReferral(selectedDoctorDetails)
                              ? `Referral approved by Dr. ${selectedDoctorDetails.ReferringDoctorLastName || 'your doctor'}`
                              : 'Referral required before booking'}
                          </div>
                        )}
                      </div>
                      <div style={legend}>
                        <LegendChip color="#dff4ea" label="Available" />
                        <LegendChip color="#fde2de" label="Booked" />
                        <LegendChip color="#f8ecce" label="Your appointment" />
                        <LegendChip color="#f1f5f9" label="Unavailable" />
                      </div>
                    </div>

                    {error && <div style={errorBanner}>{error}</div>}
                    {loading && <div style={infoBanner}>Booking appointment...</div>}

                    <div style={calendarWrap}>
                      <table style={calendarTable}>
                        <thead>
                          <tr>
                            <th style={timeHead}></th>
                            {weekDates.map((date, index) => {
                              const isToday = toLocalDateString(date) === todayStr;
                              return (
                                <th key={SHORT_DAYS[index]} style={calendarHead}>
                                  <div style={calendarDayLabel}>{SHORT_DAYS[index]}</div>
                                  <div style={isToday ? calendarDayActive : calendarDayNumber}>{date.getDate()}</div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {HOURS.map((hour) => (
                            <tr key={hour}>
                              <td style={timeCell}>{formatHour(hour)}</td>
                              {weekDates.map((date, index) => {
                                const status = getSlotStatus(date, hour);
                                const past = isPast(date, hour);
                                const working = isDoctorWorking(date, hour);
                                const clickable = !past && working && status !== 'doctor';
                                const slotStyle = past
                                  ? slotPast
                                  : !working
                                    ? slotOff
                                    : status === 'doctor'
                                      ? slotBooked
                                      : status === 'patient'
                                        ? slotMine
                                        : slotAvailable;
                                const slotText = past ? '—' : !working ? '—' : status === 'doctor' ? 'Booked' : status === 'patient' ? 'Your visit' : 'Book';

                                return (
                                  <td key={`${index}-${hour}`} style={calendarCell}>
                                    <button
                                      type="button"
                                      onClick={() => clickable && handleSlotClick(date, hour, status)}
                                      disabled={!clickable}
                                      style={slotStyle}
                                    >
                                      {slotText}
                                    </button>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <div style={emptyPlanner}>
                    <div style={emptyPlannerTitle}>Select a doctor to view availability</div>
                    <p style={emptyPlannerText}>Once you choose a doctor on the left, this planner will show the live weekly schedule and let you book directly from available slots.</p>
                  </div>
                )}
              </section>
            </div>
          </section>

          {confirmData && (
            <div style={modalOverlay}>
              <div style={modalCard}>
                <h3 style={modalTitle}>Confirm appointment</h3>
                <p style={modalText}>
                  Book with <strong>{confirmData.doctorName}</strong> on <strong>{confirmData.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at <strong>{formatHour(confirmData.hour)}</strong>.
                </p>

                <label style={fieldLabel}>
                  Reason for visit
                  <textarea
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    rows={4}
                    style={reasonInput}
                    placeholder="Annual checkup, follow-up, new symptoms, prescription question..."
                  />
                </label>

                <div style={modalActions}>
                  <button type="button" onClick={handleConfirmBooking} style={confirmButton}>
                    Confirm booking
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmData(null);
                      setReason('');
                    }}
                    style={cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function LegendChip({ color, label }) {
  return (
    <div style={legendChip}>
      <span style={{ ...legendDot, background: color }} />
      <span>{label}</span>
    </div>
  );
}

function isSpecialistDoctor(doctor = {}) {
  return doctor.IsPrimaryCare !== null && doctor.IsPrimaryCare !== undefined && Number(doctor.IsPrimaryCare) === 0;
}

function hasActiveReferral(doctor = {}) {
  return Boolean(doctor.ReferralID);
}

function formatReferralDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const pageShell = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at top left, #f3fbf7 0%, #f8fafc 52%, #eef2ff 100%)',
  fontFamily: '"Poppins", sans-serif',
};

const pageInner = {
  maxWidth: '1260px',
  margin: '0 auto',
  padding: '28px 24px 64px',
};

const heroCard = {
  position: 'relative',
  overflow: 'hidden',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
  gap: '22px',
  alignItems: 'center',
  borderRadius: '30px',
  padding: '30px',
  background: 'linear-gradient(135deg, #0f3a2e 0%, #145f4c 52%, #2b8a73 100%)',
  color: '#ffffff',
  boxShadow: '0 24px 60px rgba(15, 58, 46, 0.18)',
};

const heroPattern = {
  position: 'absolute',
  inset: 'auto -70px -90px auto',
  width: '240px',
  height: '240px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.12)',
};

const heroCopy = {
  position: 'relative',
};

const eyebrow = {
  margin: 0,
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  fontWeight: 700,
  opacity: 0.82,
};

const heroTitle = {
  margin: '10px 0 12px',
  fontSize: 'clamp(30px, 5vw, 44px)',
  lineHeight: 1.04,
};

const heroText = {
  margin: 0,
  maxWidth: '680px',
  fontSize: '15px',
  lineHeight: 1.7,
  color: 'rgba(255,255,255,0.9)',
};

const heroAside = {
  position: 'relative',
  display: 'grid',
  gap: '12px',
};

const heroStat = {
  borderRadius: '18px',
  padding: '16px 18px',
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.18)',
};

const heroStatValue = {
  fontSize: '22px',
  fontWeight: 700,
  lineHeight: 1.2,
};

const heroStatLabel = {
  marginTop: '6px',
  fontSize: '12px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  opacity: 0.82,
};

const layout = {
  display: 'grid',
  gridTemplateColumns: 'minmax(340px, 430px) minmax(0, 1fr)',
  gap: '20px',
  marginTop: '22px',
  alignItems: 'start',
};

const leftRail = {
  display: 'grid',
  gap: '20px',
};

const rightRail = {
  display: 'grid',
  gap: '20px',
};

const surfaceCard = {
  background: 'rgba(255,255,255,0.9)',
  borderRadius: '26px',
  border: '1px solid rgba(255,255,255,0.95)',
  boxShadow: '0 18px 44px rgba(15, 23, 42, 0.08)',
  padding: '24px',
  backdropFilter: 'blur(10px)',
};

const sectionHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '14px',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  marginBottom: '18px',
};

const sectionTitle = {
  margin: 0,
  color: '#0f172a',
  fontSize: '19px',
};

const sectionSubtitle = {
  margin: '6px 0 0',
  color: '#64748b',
  fontSize: '13px',
  lineHeight: 1.55,
  maxWidth: '640px',
};

const searchInput = {
  minWidth: '230px',
  maxWidth: '290px',
  width: '100%',
  padding: '11px 14px',
  borderRadius: '14px',
  border: '1px solid #dbe4ea',
  background: '#f8fafc',
  color: '#0f172a',
  fontSize: '14px',
  fontFamily: 'inherit',
};

const doctorGrid = {
  display: 'grid',
  gap: '14px',
};

const doctorCard = {
  display: 'grid',
  gridTemplateColumns: '92px minmax(0, 1fr)',
  gap: '16px',
  alignItems: 'center',
  width: '100%',
  textAlign: 'left',
  padding: '16px',
  borderRadius: '22px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const doctorCardActive = {
  borderColor: '#123524',
  background: '#eef9f3',
  boxShadow: '0 12px 28px rgba(18, 53, 36, 0.08)',
};

const doctorPhotoWrap = {
  width: '92px',
  height: '92px',
  borderRadius: '24px',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #e2f3ea 0%, #d5e8df 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const doctorPhoto = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const doctorAvatarFallback = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '28px',
  fontWeight: 700,
  color: '#145f4c',
};

const doctorCardBody = {
  display: 'grid',
  gap: '4px',
};

const doctorCardTitle = {
  fontSize: '17px',
  fontWeight: 700,
  color: '#0f172a',
};

const doctorCardMeta = {
  color: '#475569',
  fontSize: '13px',
};

const doctorCardRating = {
  color: '#145f4c',
  fontSize: '13px',
  fontWeight: 700,
};

const referralBadgeBase = {
  display: 'inline-flex',
  width: 'fit-content',
  padding: '5px 9px',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
};

const referralApprovedBadge = {
  ...referralBadgeBase,
  background: '#dcfce7',
  color: '#166534',
};

const referralRequiredBadge = {
  ...referralBadgeBase,
  background: '#fef3c7',
  color: '#92400e',
};

const doctorCardBio = {
  margin: '2px 0 0',
  color: '#64748b',
  fontSize: '13px',
  lineHeight: 1.55,
};

const doctorCardBadge = {
  gridColumn: '2 / span 1',
  display: 'inline-flex',
  width: 'fit-content',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#dff4ea',
  color: '#0f6b52',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const emptyState = {
  margin: 0,
  padding: '24px 8px',
  color: '#94a3b8',
  textAlign: 'center',
  fontSize: '14px',
};

const weekNav = {
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const navButton = {
  border: '1px solid #dbe4ea',
  borderRadius: '12px',
  background: '#ffffff',
  color: '#334155',
  padding: '9px 12px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const navButtonDisabled = {
  ...navButton,
  opacity: 0.45,
  cursor: 'not-allowed',
};

const weekLabel = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#475569',
};

const selectedDoctorBanner = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '16px',
  alignItems: 'center',
  padding: '14px 16px',
  borderRadius: '18px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  marginBottom: '14px',
  flexWrap: 'wrap',
};

const selectedDoctorSummary = {
  display: 'grid',
  gap: '4px',
};

const selectedDoctorName = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#0f172a',
};

const selectedDoctorSub = {
  fontSize: '13px',
  color: '#64748b',
};

const referralApprovedInline = {
  color: '#166534',
  fontSize: '12px',
  fontWeight: 700,
  marginTop: '4px',
};

const referralRequiredInline = {
  color: '#92400e',
  fontSize: '12px',
  fontWeight: 700,
  marginTop: '4px',
};

const legend = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
};

const legendChip = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '7px 10px',
  borderRadius: '999px',
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  color: '#475569',
  fontSize: '12px',
  fontWeight: 600,
};

const legendDot = {
  width: '10px',
  height: '10px',
  borderRadius: '999px',
  display: 'inline-block',
};

const errorBanner = {
  marginBottom: '14px',
  padding: '12px 14px',
  borderRadius: '14px',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  color: '#991b1b',
  fontSize: '13px',
  fontWeight: 600,
};

const infoBanner = {
  marginBottom: '14px',
  padding: '12px 14px',
  borderRadius: '14px',
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  color: '#1d4ed8',
  fontSize: '13px',
  fontWeight: 600,
};

const calendarWrap = {
  overflowX: 'auto',
};

const calendarTable = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: '0 10px',
};

const calendarHead = {
  padding: '0 6px 12px',
  textAlign: 'center',
};

const timeHead = {
  width: '92px',
};

const calendarDayLabel = {
  fontSize: '12px',
  color: '#64748b',
  marginBottom: '8px',
};

const calendarDayNumber = {
  width: '38px',
  height: '38px',
  margin: '0 auto',
  borderRadius: '999px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f8fafc',
  color: '#0f172a',
  fontWeight: 700,
};

const calendarDayActive = {
  ...calendarDayNumber,
  background: '#dbeafe',
  color: '#1d4ed8',
};

const timeCell = {
  fontSize: '12px',
  color: '#64748b',
  fontWeight: 600,
  textAlign: 'right',
  paddingRight: '12px',
  whiteSpace: 'nowrap',
};

const calendarCell = {
  padding: '0 6px',
};

const slotBase = {
  width: '100%',
  borderRadius: '16px',
  padding: '14px 10px',
  fontSize: '12px',
  fontWeight: 700,
  fontFamily: 'inherit',
};

const slotAvailable = {
  ...slotBase,
  background: '#dff4ea',
  border: '1px solid #b9e1cf',
  color: '#0f6b52',
  cursor: 'pointer',
};

const slotBooked = {
  ...slotBase,
  background: '#fde2de',
  border: '1px solid #f6c7c0',
  color: '#b42318',
  cursor: 'not-allowed',
};

const slotMine = {
  ...slotBase,
  background: '#f8ecce',
  border: '1px solid #f1d592',
  color: '#9a6700',
  cursor: 'pointer',
};

const slotOff = {
  ...slotBase,
  background: '#f1f5f9',
  border: '1px solid #e2e8f0',
  color: '#94a3b8',
  cursor: 'not-allowed',
};

const slotPast = {
  ...slotBase,
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  color: '#cbd5e1',
  cursor: 'not-allowed',
};

const emptyPlanner = {
  borderRadius: '20px',
  padding: '36px 24px',
  background: '#f8fafc',
  border: '1px dashed #cbd5e1',
  textAlign: 'center',
};

const emptyPlannerTitle = {
  fontSize: '18px',
  fontWeight: 700,
  color: '#0f172a',
};

const emptyPlannerText = {
  margin: '8px auto 0',
  maxWidth: '520px',
  color: '#64748b',
  fontSize: '14px',
  lineHeight: 1.7,
};

const modalOverlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  zIndex: 1200,
};

const modalCard = {
  width: '100%',
  maxWidth: '520px',
  background: '#ffffff',
  borderRadius: '26px',
  padding: '28px',
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.2)',
};

const modalTitle = {
  margin: 0,
  fontSize: '22px',
  color: '#0f172a',
};

const modalText = {
  margin: '12px 0 18px',
  color: '#64748b',
  fontSize: '14px',
  lineHeight: 1.7,
};

const fieldLabel = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
  color: '#334155',
};

const reasonInput = {
  width: '100%',
  boxSizing: 'border-box',
  marginTop: '8px',
  borderRadius: '16px',
  border: '1px solid #dbe4ea',
  background: '#f8fafc',
  padding: '14px',
  fontSize: '14px',
  color: '#0f172a',
  fontFamily: 'inherit',
  resize: 'vertical',
};

const modalActions = {
  display: 'flex',
  gap: '12px',
  marginTop: '18px',
};

const confirmButton = {
  flex: 1,
  border: 'none',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #123524 0%, #1f7a5c 100%)',
  color: '#ffffff',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const cancelButton = {
  flex: 1,
  borderRadius: '16px',
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#334155',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};
