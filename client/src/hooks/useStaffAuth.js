import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Checks the staff session and redirects if not logged in or wrong role.
 * @param {string|string[]} requiredRole
 */
export function useStaffAuth(requiredRole) {
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/employee/session', { credentials: 'include' })
      .then(res => res.json())
      .then(session => {
        if (!session.isLoggedIn) {
          navigate('/staff-login');
          return;
        }
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!allowedRoles.includes(session.role)) {
          if (session.role === 'Doctor') navigate('/doctor');
          else if (session.role === 'Admin') navigate('/admin');
          else if (session.role === 'Nurse') navigate('/nurse');
          else if (session.role === 'Receptionist') navigate('/receptionist');
          else navigate('/employee');
        }
      })
      .catch(() => navigate('/staff-login'));
  }, [navigate, requiredRole]);
}
