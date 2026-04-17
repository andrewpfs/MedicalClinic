import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import "./Navbar.css";

import API from '../api';
const NAV_LINKS = [
  { label: "Find a Doctor", to: "/patient/booking" },
  { label: "My Visits", to: "/patient/visits" },
  { label: "Billing", to: "/patient/billing" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const [session, setSession] = useState({ isLoggedIn: false, firstName: "" });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/session`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setSession({ isLoggedIn: data.isLoggedIn, firstName: data.firstName || "" }))
      .catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    await fetch(`${API}/patient/logout`, { credentials: "include" });
    setSession({ isLoggedIn: false, firstName: "" });
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <header className="navbar-main">
      <div className="navbar-main__inner">

        {/* Logo */}
        <Link to="/" className="navbar-main__logo">
          <span className="navbar-main__logo-icon" aria-hidden="true"><img src = "https://www.svgrepo.com/show/423810/medical-clinic-care.svg" /></span>
          <span className="navbar-main__logo-text">
            <span className="navbar-main__logo-clinic">Medical Clinic</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="navbar-main__links" aria-label="Main navigation">
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className="navbar-main__link">
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth section */}
        <div className="navbar-main__auth">
          {session.isLoggedIn ? (
            <div className="navbar-main__auth-logged-in">
              <NotificationBell
                iconColor="rgba(255,255,255,0.8)"
                hoverBg="rgba(255,255,255,0.12)"
              />

              <div className="navbar-main__user" ref={dropdownRef}>
                <button
                  className="navbar-main__user-btn"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                >
                  <span className="navbar-main__avatar" aria-hidden="true">
                    {session.firstName ? session.firstName[0].toUpperCase() : "U"}
                  </span>
                  <span className="navbar-main__user-name">
                    {session.firstName || "My Account"}
                  </span>
                  <ChevronIcon />
                </button>

                {dropdownOpen && (
                  <div className="navbar-main__dropdown">
                    <Link
                      to="/patient/update-profile"
                      className="navbar-main__dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                    <div className="navbar-main__dropdown-divider" />
                    <button
                      className="navbar-main__dropdown-item navbar-main__dropdown-logout"
                      onClick={handleLogout}
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="navbar-main__guest">
              <Link to="/select-role" className="navbar-main__btn-ghost">
                Log In
              </Link>
              <Link to="/register" className="navbar-main__btn-solid">
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
