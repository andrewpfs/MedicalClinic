/**
 * Seeds a standard Mon–Fri 8 AM – 5 PM schedule for all employees.
 * Run once: node backend/sql/seed_schedule.js
 * Skips any date/employee pair that already has a shift.
 */
const db = require('../db');

const WEEKS_AHEAD = 4;
const START_TIME  = '08:00:00';
const END_TIME    = '17:00:00';
const OFFICE_ID   = 1;

function getMondayOfWeek(weeksFromNow) {
  const d = new Date();
  const day = d.getDay(); // 0 Sun … 6 Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff + weeksFromNow * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISO(date) {
  return date.toISOString().split('T')[0];
}

async function run() {
  const [employees] = await db.query(
    `SELECT EmployeeID FROM employee WHERE Role IN ('Doctor','Nurse','Receptionist')`
  );

  if (!employees.length) {
    console.log('No employees found.');
    process.exit(0);
  }

  const dates = [];
  for (let w = 0; w < WEEKS_AHEAD; w++) {
    const monday = getMondayOfWeek(w);
    for (let d = 0; d < 5; d++) { // Mon–Fri
      const day = new Date(monday);
      day.setDate(monday.getDate() + d);
      dates.push(toISO(day));
    }
  }

  let inserted = 0;
  let skipped  = 0;

  for (const { EmployeeID } of employees) {
    for (const date of dates) {
      const [[existing]] = await db.query(
        'SELECT ShiftID FROM employee_shift WHERE EmployeeID = ? AND ShiftDate = ? LIMIT 1',
        [EmployeeID, date]
      );
      if (existing) { skipped++; continue; }

      await db.query(
        'INSERT INTO employee_shift (EmployeeID, OfficeID, ShiftDate, StartTime, EndTime) VALUES (?, ?, ?, ?, ?)',
        [EmployeeID, OFFICE_ID, date, START_TIME, END_TIME]
      );
      inserted++;
    }
  }

  console.log(`Done. Inserted: ${inserted}, Skipped (already existed): ${skipped}`);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
