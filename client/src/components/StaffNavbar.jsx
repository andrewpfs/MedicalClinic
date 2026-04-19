import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import StaffNotificationBell from "./StaffNotificationBell";


import API from '../api';
export default function StaffNavbar() {
  const [session, setSession] = useState({ isLoggedIn: false, firstName: "", role: "" });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/employee/session`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.isLoggedIn) {
          const firstName = data.name ? data.name.split(" ")[0] : "";
          setSession({ isLoggedIn: true, firstName, role: data.role || "" });
        }
      })
      .catch(() => {});
  }, []);

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
    await fetch(`${API}/api/employee/logout`, { credentials: "include" });
    setSession({ isLoggedIn: false, firstName: "", role: "" });
    setDropdownOpen(false);
    navigate("/staff-login");
  };

  const homeLink =
    session.role === "Doctor" ? "/doctor" :
    session.role === "Nurse"  ? "/nurse"  :
    session.role === "Receptionist" ? "/receptionist" :
    session.role === "Admin"  ? "/admin"  : "/employee";

  const displayName = session.role === "Doctor"
    ? `Dr. ${session.firstName}`
    : session.firstName || "Staff";

  const roleLabel =
    session.role === "Receptionist" ? "Reception Desk" :
    session.role === "Employee" ? "Clinic Staff" :
    session.role || "Staff";

  return (
    <header className="navbar-main">
      <div className="navbar-main__inner">

        {/* Logo */}
        <Link to={homeLink} className="navbar-main__logo">
          <span className="navbar-main__logo-mark" aria-hidden="true">MC</span>
          <span className="navbar-main__logo-copy">
            <span className="navbar-main__logo-clinic">Medical Clinic</span>
            <span className="navbar-main__logo-sub">Staff Portal</span>
          </span>
        </Link>

        {/* Auth section */}
        <div className="navbar-main__auth">
          {session.isLoggedIn ? (
            <div className="navbar-main__auth-logged-in">
              {session.role === 'Doctor' && <StaffNotificationBell />}
              <div className="navbar-main__user" ref={dropdownRef}>
                <button
                  className="navbar-main__user-btn"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  aria-expanded={dropdownOpen}
                >
                  <span className="navbar-main__avatar" aria-hidden="true">
                    {session.firstName ? session.firstName[0].toUpperCase() : "S"}
                  </span>
                  <span className="navbar-main__user-copy">
                    <span className="navbar-main__user-label">{roleLabel}</span>
                    <span className="navbar-main__user-name">{displayName}</span>
                  </span>
                  <ChevronIcon />
                </button>

                {dropdownOpen && (
                  <div className="navbar-main__dropdown">
                    <div style={{
                      padding: "10px 14px 6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>
                      {roleLabel}
                    </div>
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
              <Link to="/staff-login" className="navbar-main__btn-solid">
                Staff Login
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
