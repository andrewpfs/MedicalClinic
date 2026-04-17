import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffNavbar from '../components/StaffNavbar';
import WeekDayPicker from '../components/WeekDayPicker';
import { getDoctorImageUrl, getDoctorInitials } from '../utils/doctorProfiles';

const DOCTOR_API = '/api/doctor';
const EMPLOYEE_API = '/api/employee';
const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'patients', label: 'Care Panel' },
];

export default function DoctorPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [staffName, setStaffName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [bioDraft, setBioDraft] = useState('');
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [markingReviewId, setMarkingReviewId] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [data, setData] = useState({
    profile: null,
    upcomingAppointments: [],
    patientAppointmentInfo: [],
    patientSummary: [],
    reviews: [],
    unreadReviewCount: 0,
    reviewSummary: { reviewCount: 0, averageRating: 0 },
  });
  const [shifts, setShifts] = useState([]);

  const loadData = async () => {
    try {
      const [doctorRes, employeeRes] = await Promise.all([
        fetch(DOCTOR_API, { credentials: 'include' }),
        fetch(EMPLOYEE_API, { credentials: 'include' }),
      ]);

      const doctorPayload = await doctorRes.json();
      const employeePayload = await employeeRes.json();

      if (!doctorPayload.success) throw new Error(doctorPayload.error || 'Failed to load doctor dashboard.');
      if (!employeePayload.success) throw new Error(employeePayload.error || 'Failed to load schedule data.');

      setData({
        profile: doctorPayload.profile,
        upcomingAppointments: doctorPayload.upcomingAppointments || [],
        patientAppointmentInfo: doctorPayload.patientAppointmentInfo || [],
        patientSummary: doctorPayload.patientSummary || [],
        reviews: doctorPayload.reviews || [],
        unreadReviewCount: doctorPayload.unreadReviewCount || 0,
        reviewSummary: doctorPayload.reviewSummary || { reviewCount: 0, averageRating: 0 },
      });
      setBioDraft(doctorPayload.profile?.Bio || '');
      setShifts(employeePayload.availability || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  useEffect(() => {
    fetch('/api/employee/session', { credentials: 'include' })
      .then((res) => res.json())
      .then((session) => {
        if (!session.isLoggedIn) {
          navigate('/staff-login');
          return;
        }

        if (session.role !== 'Doctor') {
          if (session.role === 'Admin') navigate('/admin');
          else if (session.role === 'Nurse') navigate('/nurse');
          else navigate('/employee');
          return;
        }

        setStaffName(session.name || '');
        setEmployeeId(String(session.id || ''));
        loadData();
      })
      .catch(() => navigate('/staff-login'));
  }, [navigate]);

  useEffect(() => {
    if (!message.text) return undefined;
    const timer = setTimeout(() => setMessage({ type: '', text: '' }), 4500);
    return () => clearTimeout(timer);
  }, [message]);

  const handleShiftSave = async (slot) => {
    try {
      const response = await fetch(`${EMPLOYEE_API}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...slot, employeeId }),
      });

      const payload = await response.json();
      if (!payload.success) throw new Error(payload.error || 'Failed to save shift.');

      setMessage({ type: 'success', text: 'Shift saved successfully.' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleShiftDelete = async (shift) => {
    try {
      const response = await fetch(`${EMPLOYEE_API}/availability/${shift.ShiftID}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const payload = await response.json();
      if (!payload.success) throw new Error(payload.error || 'Failed to remove shift.');

      setMessage({ type: 'success', text: payload.message });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleBioSave = async () => {
    setIsSavingBio(true);

    try {
      const response = await fetch(`${DOCTOR_API}/bio`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ bio: bioDraft }),
      });

      const payload = await response.json();
      if (!payload.success) throw new Error(payload.error || 'Failed to update bio.');

      setMessage({ type: 'success', text: payload.message || 'Bio updated successfully.' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleProfileImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setIsUploadingImage(true);

    try {
      const response = await fetch(`${DOCTOR_API}/profile-image`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      });

      const payload = await response.json();
      if (!payload.success) throw new Error(payload.error || 'Failed to upload profile image.');

      setMessage({ type: 'success', text: payload.message || 'Profile image updated successfully.' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleMarkReviewSeen = async (reviewId) => {
    setMarkingReviewId(String(reviewId));

    try {
      const response = await fetch(`${DOCTOR_API}/reviews/${reviewId}/seen`, {
        method: 'PATCH',
        credentials: 'include',
      });

      const payload = await response.json();
      if (!payload.success) throw new Error(payload.error || 'Failed to update review.');

      setMessage({ type: 'success', text: payload.message || 'Review marked as seen.' });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setMarkingReviewId('');
    }
  };

  const todayIso = new Date().toISOString().split('T')[0];
  const filteredPatients = data.patientSummary.filter((patient) => {
    const haystack = `${patient.PatientFirstName} ${patient.PatientLastName} ${patient.PatientID} ${patient.RelationshipType}`.toLowerCase();
    return haystack.includes(patientSearch.trim().toLowerCase());
  });
  const todayAppointments = data.upcomingAppointments.filter((appointment) => normalizeDateKey(appointment.AppointmentDate) === todayIso);
  const doctorShifts = shifts
    .filter((shift) => String(shift.EmployeeID) === employeeId)
    .sort((left, right) => `${left.ShiftDate} ${left.StartTime}`.localeCompare(`${right.ShiftDate} ${right.StartTime}`));
  const weeklyShiftCount = doctorShifts.filter((shift) => isInCurrentWeek(shift.ShiftDate)).length;
  const activePatients = data.patientSummary.length;
  const upcomingAppointments = data.upcomingAppointments.filter((appointment) => normalizeDateKey(appointment.AppointmentDate) >= todayIso).length;
  const upcomingShifts = doctorShifts.filter((shift) => shift.ShiftDate >= todayIso);
  const nextShift = upcomingShifts[0] || null;
  const totalPatientVisits = data.patientSummary.reduce((sum, patient) => sum + Number(patient.VisitCount || 0), 0);
  const profile = data.profile || {};
  const unreadReviews = (data.reviews || []).filter((review) => Number(review.IsSeenByDoctor) === 0);
  const averageRating = Number(data.reviewSummary?.averageRating || 0);

  return (
    <div style={pageShell}>
      <StaffNavbar />

      <div style={pageInner}>
        <section style={heroCard}>
          <div style={heroAccent} />
          <div style={heroContent}>
            <div>
              <p style={eyebrow}>Doctor workspace</p>
              <h1 style={heroTitle}>Dr. {staffName || 'Doctor'}</h1>
              <p style={heroText}>
                Review your queue, keep track of your care panel, manage availability, and stay on top of patient feedback without duplicating clinical records.
              </p>
            </div>
            <div style={heroMetaWrap}>
              <MetaPill label="Specialty" value={profile.Specialty || 'General practice'} />
              <MetaPill label="Department" value={profile.DepartmentName || 'Clinic'} />
              <MetaPill label="Care role" value={profile.IsPrimaryCare ? 'Primary care' : 'Specialist'} />
            </div>
          </div>
        </section>

        <nav style={tabRow}>
          {TABS.map((tab) => (
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
              <MetricCard label="Today's Appointments" value={todayAppointments.length} tone="blue" detail="Scheduled for your queue" />
              <MetricCard label="Active Patients" value={activePatients} tone="green" detail="Seen across appointments and visits" />
              <MetricCard label="Unread Reviews" value={data.unreadReviewCount} tone="plum" detail="New feedback waiting for you" />
              <MetricCard label="Average Rating" value={data.reviewSummary.reviewCount ? averageRating.toFixed(1) : 'No reviews'} tone="gold" detail={`${data.reviewSummary.reviewCount || 0} patient reviews`} />
              <MetricCard label="Scheduled Shifts" value={doctorShifts.length} tone="teal" detail="Availability blocks on file" />
            </section>

            <section style={threeColumnLayout}>
              <SurfaceCard
                title="Today's Queue"
                subtitle="Who is on deck for care today"
                aside={<span style={subtleTag}>{totalPatientVisits} total visits on record</span>}
              >
                <DataTable
                  headers={['Patient', 'Time', 'Reason', 'Status']}
                  rows={todayAppointments}
                  empty="No appointments on your calendar for today."
                  renderRow={(row) => (
                    <tr key={row.AppointmentID}>
                      <td style={tableCellStrong}>{row.PatientLastName}, {row.PatientFirstName}</td>
                      <td style={tableCell}>{fmtTime(row.AppointmentDate, row.AppointmentTime)}</td>
                      <td style={tableCell}>{row.ReasonForVisit || 'No reason recorded'}</td>
                      <td style={tableCell}><StatusBadge status={row.StatusText || row.StatusCode} /></td>
                    </tr>
                  )}
                />
              </SurfaceCard>

              <SurfaceCard title="About Your Practice" subtitle="Keep a short professional bio on your dashboard for reference and future patient-facing use.">
                <div style={profileMediaRow}>
                  <div style={doctorPortraitWrap}>
                    {profile.ProfileImageUrl ? (
                      <img
                        src={getDoctorImageUrl(profile)}
                        alt={`Dr. ${profile.LastName || staffName || 'Doctor'}`}
                        style={doctorPortrait}
                      />
                    ) : (
                      <div style={doctorPortraitFallback}>{getDoctorInitials(profile)}</div>
                    )}
                  </div>

                  <div style={profileMediaBody}>
                    <div style={profileMediaTitle}>Photo for patient selection</div>
                    <p style={profileMediaText}>
                      Upload a square JPG, PNG, or WEBP image. If no image is uploaded, patients will see the default clinic avatar.
                    </p>
                    <label style={uploadButton}>
                      <input type="file" accept="image/png,image/jpeg,image/webp" style={{ display: 'none' }} onChange={handleProfileImageUpload} />
                      {isUploadingImage ? 'Uploading...' : 'Upload headshot'}
                    </label>
                  </div>
                </div>

                <textarea
                  style={bioTextarea}
                  value={bioDraft}
                  maxLength={800}
                  onChange={(event) => setBioDraft(event.target.value)}
                  placeholder="Share your care philosophy, focus areas, languages, or specialties."
                />
                <div style={helperRow}>
                  <span style={helperText}>{bioDraft.length}/800 characters</span>
                  <button type="button" style={primaryButton} onClick={handleBioSave} disabled={isSavingBio}>
                    {isSavingBio ? 'Saving...' : 'Save bio'}
                  </button>
                </div>
              </SurfaceCard>

              <SurfaceCard
                title="Review Inbox"
                subtitle="Unread feedback stays here until you acknowledge it."
                aside={<span style={subtleTag}>{data.unreadReviewCount} unread</span>}
              >
                <ReviewList
                  reviews={data.reviews}
                  empty="No doctor reviews have been submitted yet."
                  markingReviewId={markingReviewId}
                  onMarkSeen={handleMarkReviewSeen}
                />
              </SurfaceCard>
            </section>

            <section style={twoColumnLayout}>
              <SurfaceCard title="Care Panel Snapshot" subtitle="Patients with recent activity tied to your profile">
                <DataTable
                  headers={['Patient', 'Relationship', 'Visits', 'Last Activity']}
                  rows={filteredPatients.slice(0, 6)}
                  empty="No patient relationships found yet."
                  renderRow={(row) => (
                    <tr key={row.PatientID}>
                      <td style={tableCellStrong}>
                        {row.PatientLastName}, {row.PatientFirstName}
                        <div style={microText}>Patient #{row.PatientID}</div>
                      </td>
                      <td style={tableCell}><RelationshipBadge relationship={row.RelationshipType} /></td>
                      <td style={tableCell}>{row.VisitCount}</td>
                      <td style={tableCell}>{fmtDateTime(row.LastVisitDate)}</td>
                    </tr>
                  )}
                />
              </SurfaceCard>

              <SurfaceCard title="Recent Feedback" subtitle={unreadReviews.length ? 'Unread reviews stay pinned at the top.' : 'The latest patient comments and ratings.'}>
                <ReviewList
                  reviews={(data.reviews || []).slice(0, 6)}
                  empty="No recent review activity."
                  markingReviewId={markingReviewId}
                  onMarkSeen={handleMarkReviewSeen}
                  compact
                />
              </SurfaceCard>
            </section>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div style={stackLayout}>
            <section style={metricGrid}>
              <MetricCard label="This Week" value={weeklyShiftCount} tone="blue" detail="Shifts scheduled this week" />
              <MetricCard label="Upcoming Shifts" value={upcomingShifts.length} tone="green" detail="Future shifts on your calendar" />
              <MetricCard
                label="Next Shift"
                value={nextShift ? fmtDateShort(nextShift.ShiftDate) : 'None'}
                tone="gold"
                detail={nextShift ? `${fmtClock(nextShift.StartTime)} to ${fmtClock(nextShift.EndTime)}` : 'Nothing scheduled yet'}
              />
              <MetricCard label="Total Saved" value={doctorShifts.length} tone="plum" detail="All current availability entries" />
            </section>

            <div style={twoColumnLayout}>
              <SurfaceCard
                title="Availability Planner"
                subtitle="Click an empty day to add a shift, or click an existing shift to review and remove it."
                aside={<span style={subtleTag}>Employee #{employeeId || 'Not set'}</span>}
              >
                <WeekDayPicker
                  shifts={shifts}
                  employeeId={employeeId}
                  onSave={handleShiftSave}
                  onDelete={handleShiftDelete}
                />
              </SurfaceCard>

              <SurfaceCard title="Upcoming Shift List" subtitle="A quick view of your upcoming hours">
                <DataTable
                  headers={['Date', 'Day', 'Hours', 'Office']}
                  rows={upcomingShifts.slice(0, 8)}
                  empty="No upcoming shifts scheduled."
                  renderRow={(row) => (
                    <tr key={row.ShiftID}>
                      <td style={tableCellStrong}>{fmtDate(row.ShiftDate)}</td>
                      <td style={tableCell}>{fmtWeekday(row.ShiftDate)}</td>
                      <td style={tableCell}>{fmtClock(row.StartTime)} - {fmtClock(row.EndTime)}</td>
                      <td style={tableCell}>Office {row.OfficeID || '1'}</td>
                    </tr>
                  )}
                />
              </SurfaceCard>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div style={stackLayout}>
            <SurfaceCard
              title="Patient Care Panel"
              subtitle="This view reflects the doctor, appointment, visit, and patient_doctor tables together"
              aside={
                <input
                  type="text"
                  value={patientSearch}
                  onChange={(event) => setPatientSearch(event.target.value)}
                  placeholder="Search by patient name, ID, or relationship"
                  style={searchInput}
                />
              }
            >
              <DataTable
                headers={['Patient', 'Relationship', 'Appointments', 'Visits', 'Last Activity']}
                rows={filteredPatients}
                empty="No patients match that search."
                renderRow={(row) => (
                  <tr key={row.PatientID}>
                    <td style={tableCellStrong}>
                      {row.PatientLastName}, {row.PatientFirstName}
                      <div style={microText}>Patient #{row.PatientID}</div>
                    </td>
                    <td style={tableCell}><RelationshipBadge relationship={row.RelationshipType} /></td>
                    <td style={tableCell}>{row.AppointmentCount}</td>
                    <td style={tableCell}>{row.VisitCount}</td>
                    <td style={tableCell}>{fmtDateTime(row.LastVisitDate)}</td>
                  </tr>
                )}
              />
            </SurfaceCard>

            <SurfaceCard title="Upcoming Appointments" subtitle="A doctor-facing schedule only, without any front-desk confirmation controls">
              <DataTable
                headers={['Appt', 'Patient', 'Date', 'Time', 'Office', 'Reason', 'Status']}
                rows={data.upcomingAppointments.filter((appointment) => {
                  const haystack = `${appointment.PatientFirstName} ${appointment.PatientLastName} ${appointment.PatientID}`.toLowerCase();
                  return haystack.includes(patientSearch.trim().toLowerCase());
                })}
                empty="No appointments match that search."
                renderRow={(row) => (
                  <tr key={row.AppointmentID}>
                    <td style={tableCell}><IdBadge>{row.AppointmentID}</IdBadge></td>
                    <td style={tableCellStrong}>{row.PatientLastName}, {row.PatientFirstName}</td>
                    <td style={tableCell}>{fmtDate(row.AppointmentDate)}</td>
                    <td style={tableCell}>{fmtTime(row.AppointmentDate, row.AppointmentTime)}</td>
                    <td style={tableCell}>Office {row.OfficeID || 'Not set'}</td>
                    <td style={tableCell}>{row.ReasonForVisit || 'No reason recorded'}</td>
                    <td style={tableCell}><StatusBadge status={row.StatusText || row.StatusCode} /></td>
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

function MetricCard({ label, value, detail, tone }) {
  const colors = toneStyles[tone] || toneStyles.blue;

  return (
    <article style={{ ...metricCard, background: colors.card }}>
      <div style={{ ...metricValue, color: colors.strong }}>{value}</div>
      <div style={metricLabel}>{label}</div>
      <div style={metricDetail}>{detail}</div>
    </article>
  );
}

function SurfaceCard({ title, subtitle, children, aside }) {
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

function ReviewList({ reviews, empty, markingReviewId, onMarkSeen, compact = false }) {
  if (!reviews.length) return <p style={emptyState}>{empty}</p>;

  return (
    <div style={{ display: 'grid', gap: compact ? '10px' : '14px' }}>
      {reviews.map((review) => {
        const isUnread = Number(review.IsSeenByDoctor) === 0;

        return (
          <article key={review.ReviewID} style={{ ...reviewCard, ...(isUnread ? unreadReviewCard : null) }}>
            <div style={reviewHeader}>
              <div>
                <div style={reviewTitle}>{review.PatientFirstName} {review.PatientLastName}</div>
                <div style={reviewMeta}>
                  Appointment #{review.AppointmentID} on {fmtDate(review.AppointmentDate)} at {fmtTime(review.AppointmentDate, review.AppointmentTime)}
                </div>
              </div>
              <div style={reviewHeaderRight}>
                <span style={ratingBadge}>{review.Rating}/5</span>
                <span style={isUnread ? unreadBadge : seenBadge}>{isUnread ? 'New review' : 'Seen'}</span>
              </div>
            </div>

            <p style={reviewComment}>{review.Comment || 'No written comment left for this review.'}</p>

            <div style={reviewFooter}>
              <span style={reviewTimestamp}>{fmtDateTime(review.CreatedAt)}</span>
              {isUnread && (
                <button
                  type="button"
                  style={secondaryButton}
                  onClick={() => onMarkSeen(review.ReviewID)}
                  disabled={markingReviewId === String(review.ReviewID)}
                >
                  {markingReviewId === String(review.ReviewID) ? 'Saving...' : 'Mark as seen'}
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MetaPill({ label, value }) {
  return (
    <div style={metaPill}>
      <div style={metaLabel}>{label}</div>
      <div style={metaValue}>{value}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const text = String(status || 'Unknown');
  const normalized = text.toLowerCase();
  let style = badgeNeutral;

  if (normalized.includes('confirm')) style = badgePurple;
  else if (normalized.includes('schedule')) style = badgeBlue;
  else if (normalized.includes('complete') || normalized.includes('paid')) style = badgeGreen;
  else if (normalized.includes('cancel')) style = badgeRed;

  return <span style={{ ...badgeBase, ...style }}>{text}</span>;
}

function RelationshipBadge({ relationship }) {
  const normalized = String(relationship || '').toLowerCase();
  const style = normalized === 'pcp' ? badgeGreen : normalized === 'specialist' ? badgeBlue : badgeNeutral;
  return <span style={{ ...badgeBase, ...style }}>{relationship || 'Unassigned'}</span>;
}

function IdBadge({ children }) {
  return <span style={idBadge}>{children}</span>;
}

function normalizeDateKey(value) {
  if (!value) return '';
  const raw = String(value);
  return raw.includes('T') ? raw.split('T')[0] : raw.split(' ')[0];
}

function fmtDate(value) {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return normalizeDateKey(value) || value;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function fmtDateShort(value) {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return normalizeDateKey(value) || value;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function fmtWeekday(value) {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Not set';
  return parsed.toLocaleDateString('en-US', { weekday: 'long' });
}

function fmtTime(dateValue, timeValue) {
  if (timeValue) return fmtClock(timeValue);

  if (!dateValue) return 'Not set';
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return 'Not set';
  return parsed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function fmtClock(value) {
  if (!value) return 'Not set';
  const [hours = 0, minutes = 0] = String(value).split(':').map(Number);
  const tempDate = new Date();
  tempDate.setHours(hours, minutes, 0, 0);
  return tempDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function fmtDateTime(value) {
  if (!value) return 'Not set';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isInCurrentWeek(dateKey) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const target = new Date(dateKey);
  if (Number.isNaN(target.getTime())) return false;
  return target >= weekStart && target <= weekEnd;
}

const toneStyles = {
  blue: { card: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', strong: '#1d4ed8' },
  green: { card: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)', strong: '#047857' },
  gold: { card: 'linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)', strong: '#b45309' },
  plum: { card: 'linear-gradient(135deg, #f5f3ff 0%, #ffffff 100%)', strong: '#6d28d9' },
  teal: { card: 'linear-gradient(135deg, #ecfeff 0%, #ffffff 100%)', strong: '#0f766e' },
};

const pageShell = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at top left, #dff4ea 0%, #f7faf8 42%, #eef2ff 100%)',
  fontFamily: '"Poppins", sans-serif',
};

const pageInner = {
  maxWidth: '1240px',
  margin: '0 auto',
  padding: '28px 24px 64px',
};

const heroCard = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '28px',
  background: 'linear-gradient(135deg, #123524 0%, #1d5b44 52%, #3d8d73 100%)',
  color: '#ffffff',
  boxShadow: '0 24px 60px rgba(18, 53, 36, 0.22)',
};

const heroAccent = {
  position: 'absolute',
  width: '220px',
  height: '220px',
  borderRadius: '999px',
  background: 'rgba(255, 255, 255, 0.12)',
  top: '-70px',
  right: '-40px',
};

const heroContent = {
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)',
  gap: '20px',
  alignItems: 'end',
  padding: '30px',
};

const eyebrow = {
  margin: 0,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  fontSize: '11px',
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

const heroMetaWrap = {
  display: 'grid',
  gap: '12px',
};

const metaPill = {
  background: 'rgba(255, 255, 255, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: '18px',
  padding: '14px 16px',
  backdropFilter: 'blur(8px)',
};

const metaLabel = {
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  opacity: 0.72,
};

const metaValue = {
  marginTop: '6px',
  fontSize: '15px',
  fontWeight: 600,
};

const tabRow = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
  margin: '24px 0 18px',
};

const tabButton = {
  border: '1px solid rgba(15, 23, 42, 0.08)',
  borderRadius: '999px',
  background: 'rgba(255, 255, 255, 0.82)',
  color: '#4b5563',
  padding: '10px 18px',
  fontSize: '14px',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const activeTabButton = {
  background: '#123524',
  color: '#ffffff',
  boxShadow: '0 10px 24px rgba(18, 53, 36, 0.2)',
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
};

const metricCard = {
  borderRadius: '22px',
  padding: '20px 22px',
  border: '1px solid rgba(148, 163, 184, 0.14)',
  boxShadow: '0 14px 34px rgba(15, 23, 42, 0.07)',
};

const metricValue = {
  fontSize: '32px',
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
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '18px',
};

const threeColumnLayout = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '18px',
};

const surfaceCard = {
  background: 'rgba(255, 255, 255, 0.88)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.9)',
  boxShadow: '0 18px 44px rgba(15, 23, 42, 0.09)',
  padding: '24px',
  backdropFilter: 'blur(10px)',
};

const surfaceHeader = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
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

const subtleTag = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '999px',
  background: '#eef2ff',
  color: '#4338ca',
  fontSize: '12px',
  fontWeight: 700,
};

const searchInput = {
  minWidth: '260px',
  maxWidth: '340px',
  width: '100%',
  padding: '11px 14px',
  borderRadius: '14px',
  border: '1px solid #dbe4ea',
  background: '#f8fafc',
  color: '#0f172a',
  fontSize: '14px',
  fontFamily: 'inherit',
};

const profileMediaRow = {
  display: 'flex',
  gap: '16px',
  alignItems: 'center',
  marginBottom: '18px',
  flexWrap: 'wrap',
};

const doctorPortraitWrap = {
  width: '108px',
  height: '108px',
  borderRadius: '24px',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, #e2f3ea 0%, #d5e8df 100%)',
  border: '1px solid #dbe4ea',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const doctorPortrait = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const doctorPortraitFallback = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#123524',
  fontSize: '28px',
  fontWeight: 700,
};

const profileMediaBody = {
  flex: 1,
  minWidth: '220px',
};

const profileMediaTitle = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#0f172a',
};

const profileMediaText = {
  margin: '6px 0 12px',
  color: '#64748b',
  fontSize: '13px',
  lineHeight: 1.6,
};

const bioTextarea = {
  width: '100%',
  minHeight: '180px',
  resize: 'vertical',
  borderRadius: '16px',
  border: '1px solid #dbe4ea',
  background: '#f8fafc',
  padding: '14px 16px',
  color: '#0f172a',
  fontSize: '14px',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const helperRow = {
  marginTop: '14px',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const helperText = {
  fontSize: '12px',
  color: '#64748b',
};

const primaryButton = {
  border: 'none',
  borderRadius: '14px',
  background: '#123524',
  color: '#ffffff',
  padding: '10px 14px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const uploadButton = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '14px',
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#334155',
  padding: '10px 14px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const secondaryButton = {
  border: '1px solid #cbd5e1',
  borderRadius: '12px',
  background: '#ffffff',
  color: '#334155',
  padding: '8px 12px',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const reviewCard = {
  borderRadius: '18px',
  border: '1px solid #e2e8f0',
  background: '#f8fafc',
  padding: '16px',
};

const unreadReviewCard = {
  borderColor: '#c7d2fe',
  background: '#eef2ff',
};

const reviewHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
};

const reviewHeaderRight = {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
  alignItems: 'center',
};

const reviewTitle = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#0f172a',
};

const reviewMeta = {
  marginTop: '4px',
  fontSize: '12px',
  color: '#64748b',
};

const ratingBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: '999px',
  background: '#fef3c7',
  color: '#92400e',
  fontSize: '12px',
  fontWeight: 700,
};

const unreadBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: '999px',
  background: '#dcfce7',
  color: '#166534',
  fontSize: '12px',
  fontWeight: 700,
};

const seenBadge = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 10px',
  borderRadius: '999px',
  background: '#e2e8f0',
  color: '#475569',
  fontSize: '12px',
  fontWeight: 700,
};

const reviewComment = {
  margin: '14px 0 0',
  color: '#334155',
  lineHeight: 1.6,
  fontSize: '14px',
};

const reviewFooter = {
  marginTop: '14px',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const reviewTimestamp = {
  fontSize: '12px',
  color: '#64748b',
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
  fontWeight: 500,
  color: '#94a3b8',
};

const emptyState = {
  margin: 0,
  padding: '22px 8px',
  textAlign: 'center',
  color: '#94a3b8',
  fontSize: '14px',
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
