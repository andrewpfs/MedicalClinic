import { useNavigate } from "react-router-dom"

function RoleSelect() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navbar */}
      <div className="navbar">
        <div className="logo">Medical Center</div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: '900px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h1 style={{ fontSize: '42px', fontWeight: '300', margin: '0 0 12px 0', color: '#1e2b1b' }}>
              Welcome
            </h1>
            <p style={{ fontSize: '16px', color: '#888', margin: 0 }}>
              Select your role to continue
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            
            {/* Patient */}
            <button
              onClick={() => navigate("/login")}
              style={{
                background: 'white',
                border: '1px solid #e0d8cc',
                borderRadius: '16px',
                padding: '40px 24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                color: '#1e2b1b',
                width: '100%',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div style={{ fontSize: '48px' }}>🏥</div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '600', marginBottom: '6px' }}>Patient</div>
                <div style={{ fontSize: '14px', color: '#888', fontWeight: '400' }}>Access your medical records, appointments & billing</div>
              </div>
            </button>

            {/* Staff */}
            <button
              onClick={() => navigate("/staff-login")}
              style={{
                background: '#1e2b1b',
                border: '1px solid #1e2b1b',
                borderRadius: '16px',
                padding: '40px 24px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                color: 'white',
                width: '100%',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div style={{ fontSize: '48px' }}>👨‍⚕️</div>
              <div>
                <div style={{ fontSize: '22px', fontWeight: '600', marginBottom: '6px' }}>Staff</div>
                <div style={{ fontSize: '14px', color: '#aac4a0', fontWeight: '400' }}>Doctors, employees & administrators</div>
              </div>
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleSelect
