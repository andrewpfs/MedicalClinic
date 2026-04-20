import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

import API from '../api';
const SERVICES = [
  { icon: <CardiologyIcon />,   title: "Cardiology",                    to: "/patient/booking" },
  { icon: <OrthopedicsIcon />,  title: "Orthopedics & Sports Medicine", to: "/patient/booking" },
  { icon: <PediatricsIcon />,   title: "Pediatrics",                    to: "/patient/booking" },
  { icon: <PrimaryCareIcon />,  title: "Primary Care",                  to: "/patient/booking" },
  { icon: <OptometryIcon />,  title: "Optometry",                   to: "/patient/booking" },
];

export default function Home() {
  const [session, setSession] = useState({ isLoggedIn: false, firstName: "" });

  useEffect(() => {
    fetch(`${API}/api/session`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setSession({ isLoggedIn: d.isLoggedIn, firstName: d.firstName || "" }))
      .catch(() => {});
  }, []);

  return (
    <div className="home">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-hero__overlay" />
        <img
          className="home-hero__bg"
          src="https://www.frontsigns.com/wp-content/uploads/2021/07/comfortable-seating-in-medical-clinic-reception.jpg"
          alt="Clinic reception"
        />
        <div className="home-hero__content">
          <p className="home-hero__eyebrow">Your health, our priority</p>
          <h1 className="home-hero__heading">
            {session.isLoggedIn
              ? `Welcome back, ${session.firstName}.`
              : "Quality Care,\nClose to Home."}
          </h1>
          <p className="home-hero__sub">
            Book appointments, manage your visits, and stay on top of your
            health — all from one place.
          </p>
          <div className="home-hero__actions">
            <Link to="/patient/booking" className="home-hero__btn-primary">
              Book an Appointment
            </Link>
            {!session.isLoggedIn && (
              <Link to="/select-role" className="home-hero__btn-ghost">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── About ─────────────────────────────────────────────── */}
      <section className="home-about">
        <div className="home-about__inner">
          <div className="home-about__text">
            <p className="home-section__eyebrow">Who we are</p>
            <h2 className="home-section__heading">A clinic built around you</h2>
            <p className="home-about__body">
              Medical Clinic is a modern, patient-first healthcare practice
              dedicated to providing accessible, high-quality care to our
              community. Our team of board-certified physicians and specialists
              work together to deliver personalized treatment plans — because no
              two patients are the same.
            </p>
            <p className="home-about__body">
              From routine checkups to specialized care, we're here for every
              step of your health journey. Our online portal lets you book
              appointments, review visit history, and manage billing without
              ever picking up the phone.
            </p>
            <Link to="/register" className="home-about__link">
              Become a patient →
            </Link>
          </div>

          <div className="home-about__hours">
            <h4 className="home-about__hours-heading">
              <ClockIcon /> Clinic Hours
            </h4>
            <table className="home-about__hours-table">
              <tbody>
                {[
                  { day: "Monday – Friday", hours: "8:00 AM – 6:00 PM" },
                  { day: "Saturday",        hours: "9:00 AM – 5:00 PM" },
                  { day: "Sunday",          hours: "Closed"             },
                ].map(({ day, hours }) => (
                  <tr key={day}>
                    <td className="home-about__hours-day">{day}</td>
                    <td className={`home-about__hours-time${hours === "Closed" ? " closed" : ""}`}>
                      {hours}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="home-about__hours-note">
              Walk-ins welcome.
            </p>
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────── */}
      <section className="home-services">
        <div className="home-services__inner">
          <h2 className="home-services__heading">Specialty Services</h2>
          <p className="home-services__sub">
            Our primary care team is committed to supporting all of your health
            and wellness goals — connecting you to the right specialists when
            the need arises.
          </p>
          <div className="home-services__grid">
            {SERVICES.map((s) => (
              <div key={s.title} className="home-service-item">
                <div className="home-service-item__icon">{s.icon}</div>
                <h3 className="home-service-item__title">{s.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      {!session.isLoggedIn && (
        <section className="home-cta">
          <div className="home-cta__inner">
            <h2 className="home-cta__heading">New patient? Get started today.</h2>
            <p className="home-cta__sub">
              Create an account to book appointments and manage your care online.
            </p>
            <Link to="/register" className="home-cta__btn">
              Create an Account
            </Link>
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="home-footer">
        <span>© 2026 Medical Clinic. All rights reserved.</span>
      </footer>
    </div>
  );
}

/* ── Utility icons ───────────────────────────────────────────── */

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, verticalAlign: "middle", marginRight: 6 }}>
      <circle cx="10" cy="10" r="8" />
      <polyline points="10,5 10,10 13,13" />
    </svg>
  );
}

/* ── Service SVG icons ───────────────────────────────────────── */

function CardiologyIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="#3d5a4e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 40s-16-10-16-22a10 10 0 0 1 16-8 10 10 0 0 1 16 8c0 12-16 22-16 22z" />
      <polyline points="14,24 18,20 21,26 24,18 27,28 30,22 34,24" />
    </svg>
  );
}



function OrthopedicsIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="#3d5a4e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="24" y1="6" x2="24" y2="42" />
      <line x1="14" y1="16" x2="34" y2="16" />
      <line x1="14" y1="32" x2="34" y2="32" />
      <circle cx="24" cy="24" r="5" />
    </svg>
  );
}

function PediatricsIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="#3d5a4e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="12" r="6" />
      <path d="M14 42v-10a10 10 0 0 1 20 0v10" />
      <line x1="24" y1="32" x2="24" y2="42" />
      <line x1="14" y1="36" x2="34" y2="36" />
    </svg>
  );
}

function PrimaryCareIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="#3d5a4e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="20" r="8" />
      <path d="M24 28c-8 0-14 4-14 9v3h28v-3c0-5-6-9-14-9z" />
      <path d="M20 20 q4-8 8 0" />
      <circle cx="29" cy="35" r="5" fill="white" />
      <line x1="29" y1="32" x2="29" y2="38" />
      <line x1="26" y1="35" x2="32" y2="35" />
    </svg>
  );
}

function OptometryIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="#3d5a4e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* left arm */}
      <line x1="4" y1="22" x2="10" y2="22" />
      {/* left lens */}
      <circle cx="16" cy="22" r="6" />
      {/* bridge */}
      <path d="M22 22 Q24 20 26 22" />
      {/* right lens */}
      <circle cx="32" cy="22" r="6" />
      {/* right arm */}
      <line x1="38" y1="22" x2="44" y2="22" />
    </svg>
  );
}
