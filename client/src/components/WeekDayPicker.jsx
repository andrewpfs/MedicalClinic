import { useMemo, useState } from 'react';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getWeekDates(offset = 0) {
  const start = new Date();
  const dayOfWeek = start.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  start.setDate(start.getDate() + diff + offset * 7);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return current.toISOString().split('T')[0];
  });
}

function fmtShort(dateKey) {
  const [, month, day] = dateKey.split('-');
  return `${MONTHS[Number(month) - 1]} ${Number(day)}`;
}

function fmtLong(dateKey) {
  const [year, month, day] = dateKey.split('-');
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function WeekDayPicker({ shifts = [], employeeId, onSave, onDelete }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeDate, setActiveDate] = useState(null);
  const [form, setForm] = useState({ startTime: '', endTime: '' });
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const today = new Date().toISOString().split('T')[0];
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const shiftMap = useMemo(() => {
    const map = {};
    for (const shift of shifts) {
      if (String(shift.EmployeeID) === String(employeeId)) {
        const key = shift.ShiftDate instanceof Date
          ? shift.ShiftDate.toISOString().split('T')[0]
          : String(shift.ShiftDate).split('T')[0];
        if (!map[key]) map[key] = shift; // keep first, duplicates visible in the list below
      }
    }
    return map;
  }, [employeeId, shifts]);

  const activeShift = activeDate ? shiftMap[activeDate] : null;

  const handleSelectDate = (dateKey) => {
    setActiveDate((current) => (current === dateKey ? null : dateKey));
    setForm({ startTime: '', endTime: '' });
  };

  const canSave = form.startTime && form.endTime;

  const handleSave = async () => {
    if (!activeDate || !canSave) return;
    setSaving(true);
    try {
      await onSave({ shiftDate: activeDate, startTime: form.startTime, endTime: form.endTime });
      setActiveDate(null);
      setForm({ startTime: '', endTime: '' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeShift || !onDelete) return;
    setRemoving(true);
    try {
      await onDelete(activeShift);
      setActiveDate(null);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div>
      <div style={navRow}>
        <button type="button" onClick={() => { setWeekOffset((value) => value - 1); setActiveDate(null); }} style={navButton}>
          ← Prev
        </button>
        <span style={navLabel}>
          {fmtShort(weekStart)} – {fmtShort(weekEnd)}
        </span>
        <button type="button" onClick={() => { setWeekOffset((value) => value + 1); setActiveDate(null); }} style={navButton}>
          Next →
        </button>
        {weekOffset !== 0 && (
          <button
            type="button"
            onClick={() => { setWeekOffset(0); setActiveDate(null); }}
            style={{ ...navButton, color: '#1e2b1b', borderColor: '#1e2b1b', fontWeight: 700 }}
          >
            This week
          </button>
        )}
      </div>

      <div style={dayGrid}>
        {weekDates.map((dateKey, index) => {
          const shift = shiftMap[dateKey];
          const isToday = dateKey === today;
          const isActive = activeDate === dateKey;
          const isPast = dateKey < today && !isToday;

          let borderColor = '#e5e7eb';
          let background = '#ffffff';

          if (shift) {
            borderColor = '#bbf7d0';
            background = '#f0fdf4';
          }

          if (isActive) {
            borderColor = '#1e2b1b';
            background = '#f8fafc';
          }

          if (isToday && !isActive && !shift) {
            borderColor = '#94a3b8';
          }

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => handleSelectDate(dateKey)}
              style={{
                ...dayCard,
                border: `1.5px solid ${borderColor}`,
                background,
                opacity: isPast && !shift ? 0.55 : 1,
              }}
            >
              <div style={{ ...dayLabel, color: isToday ? '#1e2b1b' : '#9ca3af' }}>{DAY_LABELS[index]}</div>
              <div style={dayNumber}>{fmtShort(dateKey).split(' ')[1]}</div>
              <div style={dayMonth}>{fmtShort(dateKey).split(' ')[0]}</div>

              {shift ? (
                <div style={shiftPreview}>
                  <div style={shiftTime}>{shift.StartTime} – {shift.EndTime}</div>
                  {String(shift.StartTime).startsWith('08:00') && String(shift.EndTime).startsWith('17:00') && (
                    <div style={{ fontSize: '10px', color: '#0f766e', marginTop: '2px' }}>lunch 12–1 pm</div>
                  )}
                  <div style={shiftActionText}>{isActive ? 'Viewing shift' : 'View details'}</div>
                </div>
              ) : (
                <div style={{ ...shiftActionText, color: isActive ? '#1e2b1b' : '#cbd5e1', fontWeight: isActive ? 700 : 500 }}>
                  {isActive ? 'Set hours below' : '+ Add shift'}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {activeDate && (
        <div style={detailPanel}>
          {activeShift ? (
            <>
              <p style={panelTitle}>Shift scheduled for {fmtLong(activeDate)}</p>
              <p style={panelText}>
                {activeShift.StartTime} to {activeShift.EndTime}.
                {onDelete ? ' Remove it here and add a new shift if you need different hours.' : ''}
              </p>
              <div style={panelActions}>
                {onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={removing}
                    style={{
                      ...dangerButton,
                      opacity: removing ? 0.75 : 1,
                      cursor: removing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {removing ? 'Removing...' : 'Remove Shift'}
                  </button>
                )}
                <button type="button" onClick={() => setActiveDate(null)} style={ghostButton}>
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              <p style={panelTitle}>Add shift for {fmtLong(activeDate)}</p>
              <div style={{ marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => setForm({ startTime: '08:00', endTime: '17:00' })}
                  style={standardBtn}
                >
                  ⏰ Standard Hours (8 AM – 5 PM)
                </button>
                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '10px' }}>incl. 1 hr lunch at noon</span>
              </div>
              <div style={panelForm}>
                <div>
                  <label style={fieldLabel}>Start time</label>
                  <input
                    style={fieldInput}
                    type="time"
                    value={form.startTime}
                    onChange={(event) => setForm({ ...form, startTime: event.target.value })}
                  />
                </div>
                <div>
                  <label style={fieldLabel}>End time</label>
                  <input
                    style={fieldInput}
                    type="time"
                    value={form.endTime}
                    onChange={(event) => setForm({ ...form, endTime: event.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !canSave}
                  style={{
                    ...primaryButton,
                    background: canSave ? '#1e2b1b' : '#e5e7eb',
                    color: canSave ? '#ffffff' : '#94a3b8',
                    cursor: canSave && !saving ? 'pointer' : 'not-allowed',
                  }}
                >
                  {saving ? 'Saving...' : 'Save Shift'}
                </button>
                <button type="button" onClick={() => setActiveDate(null)} style={ghostButton}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const navRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  flexWrap: 'wrap',
  marginBottom: '20px',
};

const navButton = {
  padding: '8px 14px',
  borderRadius: '8px',
  border: '1.5px solid #e5e7eb',
  background: '#ffffff',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: 'inherit',
  color: '#374151',
};

const navLabel = {
  fontWeight: 700,
  fontSize: '14px',
  color: '#374151',
  minWidth: '170px',
  textAlign: 'center',
};

const dayGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: '8px',
};

const dayCard = {
  borderRadius: '12px',
  padding: '12px 10px',
  minHeight: '108px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '4px',
  textAlign: 'left',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const dayLabel = {
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
};

const dayNumber = {
  fontSize: '16px',
  fontWeight: 700,
  color: '#111827',
};

const dayMonth = {
  fontSize: '11px',
  color: '#9ca3af',
};

const shiftPreview = {
  marginTop: 'auto',
};

const shiftTime = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#15803d',
};

const shiftActionText = {
  marginTop: '4px',
  fontSize: '11px',
  color: '#6b7280',
};

const detailPanel = {
  marginTop: '16px',
  padding: '18px 20px',
  background: '#f8fafc',
  borderRadius: '12px',
  border: '1.5px solid #e5e7eb',
};

const panelTitle = {
  margin: '0 0 8px',
  fontWeight: 700,
  fontSize: '14px',
  color: '#111827',
};

const panelText = {
  margin: '0 0 14px',
  fontSize: '13px',
  color: '#6b7280',
  lineHeight: 1.5,
};

const panelForm = {
  display: 'flex',
  alignItems: 'flex-end',
  gap: '12px',
  flexWrap: 'wrap',
};

const panelActions = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
};

const fieldLabel = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '5px',
};

const fieldInput = {
  padding: '8px 11px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: 'inherit',
  background: '#ffffff',
  width: '130px',
  boxSizing: 'border-box',
};

const primaryButton = {
  padding: '9px 20px',
  borderRadius: '8px',
  border: 'none',
  fontWeight: 700,
  fontSize: '13px',
  fontFamily: 'inherit',
};

const ghostButton = {
  padding: '9px 16px',
  borderRadius: '8px',
  border: '1.5px solid #e5e7eb',
  background: '#ffffff',
  fontSize: '13px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  color: '#6b7280',
};

const dangerButton = {
  padding: '9px 20px',
  borderRadius: '8px',
  border: 'none',
  background: '#b91c1c',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '13px',
  fontFamily: 'inherit',
};

const standardBtn = {
  padding: '7px 14px',
  borderRadius: '8px',
  border: '1.5px solid #0f766e',
  background: '#f0fdfa',
  color: '#0f766e',
  fontWeight: 600,
  fontSize: '12px',
  fontFamily: 'inherit',
  cursor: 'pointer',
};
