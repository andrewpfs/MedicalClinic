import { useNavigate, Link } from 'react-router-dom';

export default function RoleSelect() {
  const navigate = useNavigate();

  return (
    <div style={pageShell}>
      <div style={topBar}>
        <Link to="/" style={{ ...brand, textDecoration: 'none' }}>Medical Clinic</Link>
      </div>

      <div style={pageBody}>
        <div style={heroBlock}>
          <p style={eyebrow}>Clinic Access</p>
          <h1 style={title}>Choose how you’re signing in</h1>
          <p style={subtitle}>
            Patients can manage visits and billing, while clinic staff can move into scheduling, care coordination, and administration.
          </p>
        </div>

        <div style={cardGrid}>
          <button
            type="button"
            onClick={() => navigate('/login')}
            style={{ ...roleCard, ...patientCard }}
          >
            <div style={iconWrap}>Patient</div>
            <div style={cardTitle}>Patient Portal</div>
            <div style={cardText}>View appointments, billing, payments, and profile information.</div>
          </button>

          <button
            type="button"
            onClick={() => navigate('/staff-login')}
            style={{ ...roleCard, ...staffCard }}
          >
            <div style={{ ...iconWrap, ...iconWrapDark }}>Staff</div>
            <div style={{ ...cardTitle, color: '#ffffff' }}>Staff Workspace</div>
            <div style={{ ...cardText, color: 'rgba(223, 244, 234, 0.82)' }}>
              Doctors, nurses, receptionists, employees, and admins sign in here.
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

const pageShell = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at top left, #e2f4ec 0%, #f8fafc 46%, #eef2ff 100%)',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: '"Poppins", sans-serif',
};

const topBar = {
  padding: '24px 32px 0',
};

const brand = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#123524',
};

const pageBody = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '36px 20px 56px',
  maxWidth: '1080px',
  width: '100%',
  margin: '0 auto',
};

const heroBlock = {
  textAlign: 'center',
  marginBottom: '40px',
};

const eyebrow = {
  margin: 0,
  color: '#3d8d73',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
};

const title = {
  margin: '10px 0 12px',
  color: '#0f172a',
  fontSize: 'clamp(34px, 6vw, 52px)',
  lineHeight: 1,
};

const subtitle = {
  margin: '0 auto',
  maxWidth: '720px',
  color: '#64748b',
  fontSize: '16px',
  lineHeight: 1.65,
};

const cardGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '22px',
};

const roleCard = {
  borderRadius: '24px',
  padding: '30px',
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  boxShadow: '0 22px 54px rgba(15, 23, 42, 0.1)',
  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
};

const patientCard = {
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  color: '#0f172a',
};

const staffCard = {
  background: 'linear-gradient(135deg, #123524 0%, #1d5b44 54%, #2f7a61 100%)',
  color: '#ffffff',
};

const iconWrap = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  borderRadius: '999px',
  background: '#ecfdf5',
  color: '#166534',
  fontSize: '12px',
  fontWeight: 700,
  marginBottom: '18px',
};

const iconWrapDark = {
  background: 'rgba(255, 255, 255, 0.14)',
  color: '#dff4ea',
};

const cardTitle = {
  fontSize: '28px',
  fontWeight: 700,
  marginBottom: '10px',
};

const cardText = {
  fontSize: '15px',
  lineHeight: 1.65,
  color: '#64748b',
};
