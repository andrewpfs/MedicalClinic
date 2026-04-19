/**
 * Seeds 16 patients (4 per doctor, 4 doctors from distinct departments)
 * with appointments. Run from the backend/ directory:
 *   node sql/seed_patients.js
 */

const bcrypt = require('bcryptjs');
const db = require('../db');

const PATIENTS = [
  { FName: 'Emma',      LName: 'Johnson'   },
  { FName: 'Liam',      LName: 'Garcia'    },
  { FName: 'Olivia',    LName: 'Martinez'  },
  { FName: 'Noah',      LName: 'Williams'  },
  { FName: 'Ava',       LName: 'Brown'     },
  { FName: 'Isabella',  LName: 'Jones'     },
  { FName: 'Sophia',    LName: 'Davis'     },
  { FName: 'Mason',     LName: 'Miller'    },
  { FName: 'Mia',       LName: 'Wilson'    },
  { FName: 'Ethan',     LName: 'Moore'     },
  { FName: 'Luna',      LName: 'Taylor'    },
  { FName: 'Aiden',     LName: 'Anderson'  },
  { FName: 'Charlotte', LName: 'Thomas'    },
  { FName: 'Lucas',     LName: 'Jackson'   },
  { FName: 'Harper',    LName: 'White'     },
  { FName: 'Elijah',    LName: 'Harris'    },
];

// Spread appointments across the past 60 days
const DATES = [
  '2026-02-18', '2026-02-25',
  '2026-03-04', '2026-03-11',
  '2026-03-18', '2026-03-25',
  '2026-04-01', '2026-04-08',
  '2026-04-10', '2026-04-11',
  '2026-04-12', '2026-04-13',
  '2026-04-14', '2026-04-15',
  '2026-04-16', '2026-04-17',
];

async function run() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Pick one doctor per department (up to 4 departments)
    const [doctors] = await db.query(`
      SELECT e.EmployeeID AS DoctorID, e.FirstName, e.LastName,
             d.DepartmentID, d.DepartmentName,
             MIN(o.OfficeID) AS OfficeID
      FROM doctor doc
      JOIN employee e ON doc.EmployeeID = e.EmployeeID
      JOIN department d ON e.DepartmentID = d.DepartmentID
      JOIN office o ON d.OfficeID = o.OfficeID
      GROUP BY e.EmployeeID, e.FirstName, e.LastName, d.DepartmentID, d.DepartmentName
      ORDER BY d.DepartmentID
      LIMIT 4
    `);

    if (doctors.length < 4) {
      console.error(`Only found ${doctors.length} department(s) with doctors. Need 4.`);
      process.exit(1);
    }

    console.log('Assigning patients to doctors:');
    doctors.forEach((d, i) => {
      console.log(`  Group ${i + 1}: Dr. ${d.FirstName} ${d.LastName} (${d.DepartmentName})`);
    });

    for (let i = 0; i < PATIENTS.length; i++) {
      const p = PATIENTS[i];
      const doctor = doctors[Math.floor(i / 4)]; // groups of 4
      const email = `${p.FName}@gmail.com`;

      // Skip if patient email already exists
      const [existing] = await db.query('SELECT PatientID FROM patient WHERE Email = ?', [email]);
      let patientId;
      if (existing.length) {
        patientId = existing[0].PatientID;
        console.log(`Patient ${email} already exists (ID ${patientId}), skipping insert.`);
      } else {
        const [result] = await db.query(
          `INSERT INTO patient (FName, LName, Email, Password, HasInsurance)
           VALUES (?, ?, ?, ?, ?)`,
          [p.FName, p.LName, email, hashedPassword, i % 2]
        );
        patientId = result.insertId;
        console.log(`Created patient ${p.FName} ${p.LName} (ID ${patientId})`);
      }

      // Insert appointment
      await db.query(
        `INSERT INTO appointment (PatientID, DoctorID, AppointmentDate, StatusCode, OfficeID, ReasonForVisit)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [patientId, doctor.DoctorID, DATES[i], 1, doctor.OfficeID, 'Routine checkup']
      );
      console.log(`  -> Appointment on ${DATES[i]} with Dr. ${doctor.LastName}`);
    }

    console.log('\nDone! 16 patients and appointments seeded.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
