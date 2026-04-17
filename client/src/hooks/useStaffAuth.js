import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import API from '../api';
/**
 * Checks the staff session and redirects if not logged in or wrong role.
 * @param {'Admin'|'Doctor'|'Nurse'} requiredRole
 */
export function useStaffAuth(requiredRole) {
  const navigate = useNavigate();
  useEffect(() => {
    fetch(`${API}/api/employee/session`, { credentials: 'include' })
      .then(res => res.json())
      .then(session => {
        if (!session.isLoggedIn) {
          navigate('/staff-login');
          return;
        }
        if (session.role !== requiredRole) {
          if (session.role === 'Doctor') navigate('/doctor');
          else if (session.role === 'Admin') navigate('/admin');
          else navigate('/employee');
        }
      })
      .catch(() => navigate('/staff-login'));
  }, [navigate, requiredRole]);
}
