import Navbar from "../components/Navbar";
import "./About.css";

export default function About() {
  return (
    <div className="about">
      <Navbar />

      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="about-hero">
        <p className="about-hero__eyebrow">About us</p>
        <h1 className="about-hero__heading">Caring for our community<br />since 2005</h1>
        <p className="about-hero__sub">
          This clinic was founded with a single mission — make high-quality
          healthcare accessible, personal, and easy to navigate for everyone in
          our community.
        </p>
      </section>

      {/* ── Mission ────────────────────────────────────────────── */}
      <section className="about-mission">
        <div className="about-mission__inner">
          <div className="about-mission__text">
            <p className="about-label">Our mission</p>
            <h2 className="about-heading">We treat the whole person, not just the condition</h2>
            <p className="about-body">
              Too many clinics treat visits as transactions. We think differently.
              Our team takes the time to understand your full picture — your history,
              your lifestyle, your goals — and builds care plans around you as an
              individual.
            </p>
            <p className="about-body">
              From the moment you walk in to the follow-up after your visit, we're
              focused on making your healthcare experience feel supported, clear,
              and human.
            </p>
          </div>
          <div className="about-mission__stats">
            {[
              { value: "5",   label: "Years serving the community" },
              { value: "50",   label: "Board-certified physicians"  },
              { value: "100+",  label: "Patients treated"            },
            ].map(s => (
              <div key={s.label} className="about-stat">
                <span className="about-stat__value">{s.value}</span>
                <span className="about-stat__label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

  
      <section className="about-location">
        <div className="about-location__inner">
          <p className="about-label">Find us</p>
          <h2 className="about-heading">Visit our clinic</h2>
          <div className="about-location__grid">
            <div>

              <h4 className="about-location__sub" style={{ marginTop: "28px" }}>Phone</h4>
              <p className="about-body">(123)-456-7890 </p>
              <h4 className="about-location__sub" style={{ marginTop: "28px" }}>Email</h4>
              <p className="about-body">contact@medicalclinic.com</p>
            </div>
            <div>
              <h4 className="about-location__sub">Hours</h4>
              <table className="about-hours-table">
                <tbody>
                  {[
                    { day: "Monday – Friday", hours: "8:00 AM – 6:00 PM" },
                    { day: "Saturday",        hours: "9:00 AM – 5:00 PM" },
                    { day: "Sunday",          hours: "Closed"             },
                  ].map(({ day, hours }) => (
                    <tr key={day}>
                      <td className="about-hours-table__day">{day}</td>
                      <td className={`about-hours-table__time${hours === "Closed" ? " closed" : ""}`}>{hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <footer className="about-footer">
        <span>© 2025 Medical Clinic. All rights reserved.</span>
      </footer>
    </div>
  );
}
