import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import './Navbar.css';

const NAV_LINKS = [
  { label: 'Overview', to: '/patient/profile' },
  { label: 'Find Care', to: '/patient/booking' },
  { label: 'Visits', to: '/patient/visits' },
  { label: 'Billing', to: '/patient/billing' },
];

function isLinkActive(pathname, to) {
  if (to === '/patient/profile') {
    return pathname === '/patient/profile';
  }

  return pathname === to || pathname.startsWith(`${to}/`);
}

export default function Navbar() {
  const [session, setSession] = useState({ isLoggedIn: false, firstName: '' });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetch('/api/session', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setSession({ isLoggedIn: data.isLoggedIn, firstName: data.firstName || '' }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await fetch('/patient/logout', { credentials: 'include' });
    setSession({ isLoggedIn: false, firstName: '' });
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="navbar-main">
      <div className="navbar-main__inner">
        <Link to={session.isLoggedIn ? '/patient/profile' : '/'} className="navbar-main__logo">
          <span className="navbar-main__logo-mark" aria-hidden="true">MC</span>
          <span className="navbar-main__logo-copy">
            <span className="navbar-main__logo-clinic">Medical Clinic</span>
            <span className="navbar-main__logo-sub">Patient Portal</span>
          </span>
        </Link>

        <nav className="navbar-main__links" aria-label="Patient navigation">
          {NAV_LINKS.map(({ label, to }) => {
            const active = isLinkActive(location.pathname, to);
            return (
              <Link
                key={label}
                to={to}
                className={`navbar-main__link${active ? ' navbar-main__link--active' : ''}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="navbar-main__auth">
          {session.isLoggedIn ? (
            <div className="navbar-main__auth-logged-in">
              <NotificationBell
                iconColor="rgba(255,255,255,0.86)"
                hoverBg="rgba(255,255,255,0.12)"
              />

              <div className="navbar-main__user" ref={dropdownRef}>
                <button
                  className="navbar-main__user-btn"
                  onClick={() => setDropdownOpen((previous) => !previous)}
                  aria-expanded={dropdownOpen}
                >
                  <span className="navbar-main__avatar" aria-hidden="true">
                    {session.firstName ? session.firstName[0].toUpperCase() : 'U'}
                  </span>
                  <span className="navbar-main__user-copy">
                    <span className="navbar-main__user-label">Patient</span>
                    <span className="navbar-main__user-name">{session.firstName || 'My Account'}</span>
                  </span>
                  <ChevronIcon />
                </button>

                {dropdownOpen && (
                  <div className="navbar-main__dropdown">
                    <Link
                      to="/patient/profile"
                      className="navbar-main__dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Portal overview
                    </Link>
                    <Link
                      to="/patient/update-profile"
                      className="navbar-main__dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile settings
                    </Link>
                    <div className="navbar-main__dropdown-divider" />
                    <button
                      className="navbar-main__dropdown-item navbar-main__dropdown-logout"
                      onClick={handleLogout}
                    >
                      Log out
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
