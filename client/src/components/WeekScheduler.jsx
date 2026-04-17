import { useState, useEffect } from 'react';

// 30-min slots from 7:00 to 20:00 (27 slots total)
const SLOTS = [];
for (let h = 7; h <= 19; h++) {
  SLOTS.push(`${String(h).padStart(2, '0')}:00`);
  SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}
SLOTS.push('20:00');

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function addMins(t, m) {
  const [h, min] = t.split(':').map(Number);
  const tot = h * 60 + min + m;
  return `${String(Math.floor(tot / 60)).padStart(2, '0')}:${String(tot % 60).padStart(2, '0')}`;
}

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

function fmtHour(hhmm) {
  const h = parseInt(hhmm);
  return h === 0 ? '12am' : h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`;
}

/**
 * WeekScheduler — When2Meet-style weekly availability grid.
 *
 * Props:
 *   existingShifts   – array of shift objects from DB (ShiftDate, StartTime, EndTime, EmployeeID)
 *   focusEmployeeId  – whose shifts to highlight for editing (null = show team heatmap only)
 *   showTeamView     – whether to render the "Team View" toggle
 *   onSave           – async (slots: {shiftDate, startTime, endTime, officeId}[]) => void
 */
export default function WeekScheduler({ existingShifts = [], focusEmployeeId, showTeamView = false, onSave }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [draft, setDraft] = useState(new Set());
  const [dragging, setDragging] = useState(false);
  const [paintMode, setPaintMode] = useState('add');
  const [view, setView] = useState('mine');
  const [officeId, setOfficeId] = useState('1');
  const [saving, setSaving] = useState(false);

  const weekDates = getWeekDates(weekOffset);
  const today = new Date().toISOString().split('T')[0];

  // Build set of existing slots for the focused employee in this week
  const existingSet = new Set();
  for (const sh of existingShifts) {
    if (focusEmployeeId && String(sh.EmployeeID) !== String(focusEmployeeId)) continue;
    if (!weekDates.includes(sh.ShiftDate)) continue;
    let c = sh.StartTime.slice(0, 5);
    const end = sh.EndTime.slice(0, 5);
    while (c < end && SLOTS.includes(c)) {
      existingSet.add(`${sh.ShiftDate}_${c}`);
      c = addMins(c, 30);
    }
  }

  // Build team heatmap
  const teamMap = {};
  for (const sh of existingShifts) {
    if (!weekDates.includes(sh.ShiftDate)) continue;
    let c = sh.StartTime.slice(0, 5);
    const end = sh.EndTime.slice(0, 5);
    while (c < end && SLOTS.includes(c)) {
      const k = `${sh.ShiftDate}_${c}`;
      teamMap[k] = (teamMap[k] || 0) + 1;
      c = addMins(c, 30);
    }
  }
  const maxTeam = Math.max(...Object.values(teamMap), 1);

  // Clear draft when navigating weeks or switching focus employee
  useEffect(() => { setDraft(new Set()); }, [weekOffset, focusEmployeeId]);

  const startDrag = (date, time) => {
    if (view !== 'mine') return;
    const k = `${date}_${time}`;
    if (existingSet.has(k)) return;
    const willAdd = !draft.has(k);
    setPaintMode(willAdd ? 'add' : 'remove');
    setDragging(true);
    setDraft(prev => {
      const next = new Set(prev);
      willAdd ? next.add(k) : next.delete(k);
      return next;
    });
  };

  const enterCell = (date, time) => {
    if (!dragging || view !== 'mine') return;
    const k = `${date}_${time}`;
    if (existingSet.has(k)) return;
    setDraft(prev => {
      const next = new Set(prev);
      paintMode === 'add' ? next.add(k) : next.delete(k);
      return next;
    });
  };

  useEffect(() => {
    const up = () => setDragging(false);
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, []);

  const handleSave = async () => {
    if (!draft.size || saving) return;
    setSaving(true);

    // Group by date, sort times, merge contiguous 30-min blocks into single shifts
    const byDate = {};
    for (const k of draft) {
      const [date, time] = k.split('_');
      (byDate[date] = byDate[date] || []).push(time);
    }
    const shifts = [];
    for (const [date, times] of Object.entries(byDate)) {
      times.sort();
      let start = null, prev = null;
      for (const t of times) {
        if (!start) { start = t; prev = t; continue; }
        if (t === addMins(prev, 30)) { prev = t; }
        else {
          shifts.push({ shiftDate: date, startTime: start, endTime: addMins(prev, 30), officeId });
          start = t; prev = t;
        }
      }
      if (start) shifts.push({ shiftDate: date, startTime: start, endTime: addMins(prev, 30), officeId });
    }

    await onSave(shifts);
    setDraft(new Set());
    setSaving(false);
  };

  return (
    <div style={{ fontFamily: 'inherit' }}>

      {/* ── Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '10px', flexWrap: 'wrap' }}>
        {/* Week nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <WkBtn onClick={() => setWeekOffset(o => o - 1)}>‹ Prev</WkBtn>
          <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '190px', textAlign: 'center', color: '#374151' }}>
            {weekDates[0]} – {weekDates[6]}
          </span>
          <WkBtn onClick={() => setWeekOffset(o => o + 1)}>Next ›</WkBtn>
          {weekOffset !== 0 && <WkBtn onClick={() => setWeekOffset(0)} green>Today</WkBtn>}
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {showTeamView && (
            <div style={{ display: 'flex', borderRadius: '8px', border: '1.5px solid #e5e7eb', overflow: 'hidden' }}>
              <SegBtn active={view === 'mine'} onClick={() => setView('mine')}>My Schedule</SegBtn>
              <SegBtn active={view === 'team'} onClick={() => setView('team')}>Team View</SegBtn>
            </div>
          )}
          {view === 'mine' && (
            <>
              <input
                value={officeId}
                onChange={e => setOfficeId(e.target.value)}
                placeholder="Office ID"
                style={{ width: '82px', padding: '7px 10px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit' }}
              />
              <button
                onClick={handleSave}
                disabled={saving || !draft.size}
                style={{
                  padding: '8px 18px', borderRadius: '8px', border: 'none', fontSize: '13px',
                  fontWeight: 600, fontFamily: 'inherit',
                  background: draft.size ? '#1e2b1b' : '#e5e7eb',
                  color: draft.size ? 'white' : '#9ca3af',
                  cursor: draft.size ? 'pointer' : 'not-allowed',
                }}
              >
                {saving ? 'Saving…' : draft.size ? `Save (${draft.size} slots)` : 'Save Schedule'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Legend ── */}
      {view === 'mine' ? (
        <div style={{ display: 'flex', gap: '14px', marginBottom: '10px', fontSize: '12px', color: '#6b7280', flexWrap: 'wrap', alignItems: 'center' }}>
          <Dot color="#86efac" label="Existing shift" />
          <Dot color="#4ade80" label="New selection" />
          <span style={{ color: '#9ca3af' }}>Click or drag to mark time slots, then save.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', fontSize: '12px', color: '#6b7280' }}>
          <span>Fewer available</span>
          {[0.12, 0.3, 0.5, 0.7, 0.9].map(o => (
            <div key={o} style={{ width: '18px', height: '18px', borderRadius: '4px', background: `rgba(30,43,27,${o})`, border: '1px solid rgba(0,0,0,0.06)' }} />
          ))}
          <span>More available</span>
        </div>
      )}

      {/* ── Grid ── */}
      <div style={{ overflowX: 'auto', userSelect: 'none', WebkitUserSelect: 'none' }}>

        {/* Day headers */}
        <div style={{ display: 'flex', minWidth: '540px', marginBottom: '3px' }}>
          <div style={{ width: '46px', flexShrink: 0 }} />
          {DAY_LABELS.map((d, i) => {
            const date = weekDates[i];
            const isToday = date === today;
            return (
              <div key={d} style={{
                flex: 1, textAlign: 'center', paddingBottom: '6px',
                borderBottom: `2px solid ${isToday ? '#1e2b1b' : '#e5e7eb'}`,
                marginRight: '2px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: isToday ? '#1e2b1b' : '#374151' }}>{d}</div>
                <div style={{ fontSize: '11px', color: isToday ? '#1e2b1b' : '#9ca3af' }}>{date.slice(5).replace('-', '/')}</div>
              </div>
            );
          })}
        </div>

        {/* Slot rows */}
        <div style={{ minWidth: '540px' }}>
          {SLOTS.map(time => {
            const isHour = time.endsWith(':00');
            return (
              <div key={time} style={{ display: 'flex', height: '22px' }}>
                {/* Time label */}
                <div style={{
                  width: '46px', flexShrink: 0,
                  textAlign: 'right', paddingRight: '6px',
                  fontSize: '10px', color: '#9ca3af', lineHeight: '22px',
                  visibility: isHour ? 'visible' : 'hidden',
                }}>
                  {isHour && fmtHour(time)}
                </div>

                {/* Day cells */}
                {weekDates.map(date => {
                  const k = `${date}_${time}`;
                  const isExisting = existingSet.has(k);
                  const isDraft = draft.has(k);
                  const teamCount = teamMap[k] || 0;

                  let bg = 'transparent';
                  if (view === 'mine') {
                    if (isExisting) bg = '#86efac';
                    else if (isDraft) bg = '#4ade80';
                  } else if (teamCount > 0) {
                    bg = `rgba(30,43,27,${0.1 + (teamCount / maxTeam) * 0.82})`;
                  }

                  return (
                    <div
                      key={k}
                      style={{
                        flex: 1, marginRight: '2px', background: bg,
                        borderBottom: isHour ? '1px solid #e5e7eb' : '1px solid #f3f4f6',
                        cursor: view === 'mine' && !isExisting ? 'pointer' : 'default',
                        transition: 'background 0.04s',
                      }}
                      onMouseDown={() => startDrag(date, time)}
                      onMouseEnter={() => enterCell(date, time)}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WkBtn({ onClick, children, green }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px', borderRadius: '7px', cursor: 'pointer', fontSize: '13px',
      fontFamily: 'inherit', background: 'white',
      border: `1.5px solid ${green ? '#1e2b1b' : '#e5e7eb'}`,
      color: green ? '#1e2b1b' : '#374151',
      fontWeight: green ? 600 : 400,
    }}>{children}</button>
  );
}

function SegBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px', border: 'none', fontSize: '13px', fontWeight: 500,
      fontFamily: 'inherit', cursor: 'pointer',
      background: active ? '#1e2b1b' : 'white',
      color: active ? 'white' : '#374151',
    }}>{children}</button>
  );
}

function Dot({ color, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      <span style={{ display: 'inline-block', width: '13px', height: '13px', borderRadius: '3px', background: color, border: '1px solid rgba(0,0,0,0.1)' }} />
      {label}
    </span>
  );
}
