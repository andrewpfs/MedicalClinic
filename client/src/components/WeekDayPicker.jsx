import { useState } from 'react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getWeekDates(offset = 0) {
  const d = new Date();
  const dow = d.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + diff + offset * 7);
  d.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(d);
    dd.setDate(d.getDate() + i);
    return dd.toISOString().split('T')[0];
  });
}

function fmtShort(yyyy_mm_dd) {
  const [, m, d] = yyyy_mm_dd.split('-');
  return `${MONTHS[parseInt(m) - 1]} ${parseInt(d)}`;
}

function fmtLong(yyyy_mm_dd) {
  const [y, m, d] = yyyy_mm_dd.split('-');
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/**
 * WeekDayPicker
 *
 * Props:
 *   shifts      – array of shift objects (ShiftDate, StartTime, EndTime, OfficeID, EmployeeID)
 *   employeeId  – whose shifts to show / schedule for
 *   onSave      – async ({ shiftDate, startTime, endTime, officeId }) => void
 */
export default function WeekDayPicker({ shifts = [], employeeId, onSave }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [active, setActive]         = useState(null); // selected date for new shift
  const [form, setForm]             = useState({ startTime: '', endTime: '' });
  const [saving, setSaving]         = useState(false);

  const weekDates = getWeekDates(weekOffset);
  const today     = new Date().toISOString().split('T')[0];
  const weekStart = weekDates[0];
  const weekEnd   = weekDates[6];

  const shiftMap = {};
  for (const s of shifts) {
    if (String(s.EmployeeID) === String(employeeId)) {
      shiftMap[s.ShiftDate] = s;
    }
  }

  const selectDay = (date) => {
    if (shiftMap[date]) return; // already scheduled, read-only
    setActive(prev => prev === date ? null : date);
    setForm({ startTime: '', endTime: '' });
  };

  const handleSave = async () => {
    if (!form.startTime || !form.endTime || !active) return;
    setSaving(true);
    try {
      await onSave({ shiftDate: active, ...form, officeId: '1' });
      setActive(null);
      setForm({ startTime: '', endTime: '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* ── Week navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => { setWeekOffset(o => o - 1); setActive(null); }} style={navBtn}>← Prev</button>
        <span style={{ fontWeight: 600, fontSize: '14px', color: '#374151', minWidth: '160px', textAlign: 'center' }}>
          {fmtShort(weekStart)} – {fmtShort(weekEnd)}
        </span>
        <button onClick={() => { setWeekOffset(o => o + 1); setActive(null); }} style={navBtn}>Next →</button>
        {weekOffset !== 0 && (
          <button onClick={() => { setWeekOffset(0); setActive(null); }} style={{ ...navBtn, color: '#1e2b1b', borderColor: '#1e2b1b', fontWeight: 600 }}>
            This week
          </button>
        )}
      </div>

      {/* ── Day cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        {weekDates.map((date, i) => {
          const shift    = shiftMap[date];
          const isToday  = date === today;
          const isActive = active === date;
          const isPast   = date < today && !isToday;

          let borderColor = '#e5e7eb';
          let bg          = 'white';
          if (shift)    { borderColor = '#bbf7d0'; bg = '#f0fdf4'; }
          if (isActive) { borderColor = '#1e2b1b'; bg = '#f9fafb'; }
          if (isToday && !shift && !isActive) borderColor = '#a3b8a0';

          return (
            <div
              key={date}
              onClick={() => selectDay(date)}
              style={{
                borderRadius: '10px',
                border: `1.5px solid ${borderColor}`,
                background: bg,
                padding: '12px 10px',
                cursor: shift ? 'default' : 'pointer',
                opacity: isPast && !shift ? 0.5 : 1,
                transition: 'border-color 0.12s, background 0.12s',
                minHeight: '90px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 700, color: isToday ? '#1e2b1b' : '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                {DAY_LABELS[i]}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                {fmtShort(date).split(' ')[1]}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>
                {fmtShort(date).split(' ')[0]}
              </div>

              {shift ? (
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#16a34a' }}>
                    {shift.StartTime} – {shift.EndTime}
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 'auto', fontSize: '11px', color: isActive ? '#1e2b1b' : '#d1d5db', fontWeight: isActive ? 600 : 400 }}>
                  {isActive ? 'Setting…' : '+ Add shift'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Inline form ── */}
      {active && (
        <div style={{
          marginTop: '16px',
          padding: '18px 20px',
          background: '#f9fafb',
          borderRadius: '10px',
          border: '1.5px solid #e5e7eb',
        }}>
          <p style={{ margin: '0 0 14px', fontWeight: 600, fontSize: '14px', color: '#111827' }}>
            Add shift for {fmtLong(active)}
          </p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
            <div>
              <label style={lbl}>Start time</label>
              <input style={fi} type="time" value={form.startTime}
                onChange={e => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>End time</label>
              <input style={fi} type="time" value={form.endTime}
                onChange={e => setForm({ ...form, endTime: e.target.value })} />
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !form.startTime || !form.endTime}
              style={{
                padding: '9px 20px', borderRadius: '8px', border: 'none',
                background: form.startTime && form.endTime ? '#1e2b1b' : '#e5e7eb',
                color: form.startTime && form.endTime ? 'white' : '#9ca3af',
                fontWeight: 600, fontSize: '13px', cursor: form.startTime && form.endTime ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
              }}
            >
              {saving ? 'Saving…' : 'Save Shift'}
            </button>
            <button
              onClick={() => setActive(null)}
              style={{ padding: '9px 16px', borderRadius: '8px', border: '1.5px solid #e5e7eb', background: 'white', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', color: '#6b7280' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const navBtn = {
  padding: '7px 14px', borderRadius: '7px', border: '1.5px solid #e5e7eb',
  background: 'white', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', color: '#374151',
};
const lbl = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '5px' };
const fi  = { padding: '8px 11px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', background: 'white', width: '130px', boxSizing: 'border-box' };
