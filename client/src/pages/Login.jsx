import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import API from '../api'

const page = {
  minHeight: '100vh',
  background: 'linear-gradient(160deg, #0f1a0e 0%, #1e3a1a 40%, #2d5228 70%, #1a3016 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1rem',
  fontFamily: 'Poppins, sans-serif',
  position: 'relative',
  overflow: 'hidden',
}

const bgAccent = {
  position: 'absolute', top: '-120px', right: '-120px',
  width: '420px', height: '420px', borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(80,160,60,0.12) 0%, transparent 70%)',
  pointerEvents: 'none',
}

const bgAccent2 = {
  position: 'absolute', bottom: '-100px', left: '-80px',
  width: '320px', height: '320px', borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(60,120,40,0.10) 0%, transparent 70%)',
  pointerEvents: 'none',
}

const card = {
  background: 'rgba(255,255,255,0.97)',
  backdropFilter: 'blur(12px)',
  borderRadius: '24px',
  padding: '2.75rem 2.5rem',
  width: '100%',
  maxWidth: '440px',
  boxShadow: '0 32px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)',
  position: 'relative',
  zIndex: 1,
}

const headerAccent = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #1e3a1a, #3a7a30)',
  borderRadius: '10px',
  padding: '6px 14px',
  fontSize: '11px',
  fontWeight: 700,
  color: '#c8e6b0',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '14px',
}

const titleStyle = {
  fontSize: '26px', fontWeight: 700, color: '#111827',
  margin: '0 0 6px', letterSpacing: '-0.02em',
}

const subtitleStyle = { fontSize: '14px', color: '#9ca3af', margin: '0 0 1.75rem', lineHeight: 1.5 }

const fieldGroup = { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }

const labelStyle = {
  fontSize: '11px', fontWeight: 600, color: '#374151',
  textTransform: 'uppercase', letterSpacing: '0.06em',
}

const inputStyle = {
  padding: '10px 13px', border: '1.5px solid #e5e7eb', borderRadius: '10px',
  fontSize: '14px', fontFamily: 'Poppins, sans-serif', color: '#111',
  outline: 'none', width: '100%', boxSizing: 'border-box',
  background: '#fafafa',
}

const submitBtn = {
  width: '100%', padding: '13px', marginTop: '10px',
  background: 'linear-gradient(135deg, #1e3a1a, #3a7a30)',
  color: 'white', border: 'none', borderRadius: '12px',
  fontSize: '15px', fontWeight: 700, cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif', letterSpacing: '0.02em',
  boxShadow: '0 4px 16px rgba(30,58,26,0.35)',
}

const errorBox = {
  background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
  padding: '10px 14px', fontSize: '13px', color: '#991b1b', marginBottom: '14px',
}

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch(`${API}/patient/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ Email: email, Password: password })
      })
      if (res.ok) {
        navigate("/patient/profile")
      } else {
        const msg = await res.json()
        setError(typeof msg === "string" ? msg : "Login failed.")
      }
    } catch {
      setError("Could not connect to server.")
    }
  }

  return (
    <div style={page}>
      <div style={bgAccent} />
      <div style={bgAccent2} />

      <div style={card}>
        <div style={headerAccent}>Medical Clinic · Patient Portal</div>
        <h2 style={titleStyle}>Welcome back</h2>
        <p style={subtitleStyle}>Sign in to your patient account to manage your care.</p>

        {error && <div style={errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={fieldGroup}>
            <label style={labelStyle}>Email Address *</label>
            <input
              style={inputStyle}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div style={fieldGroup}>
            <label style={labelStyle}>Password *</label>
            <input
              style={inputStyle}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" style={submitBtn}>Sign In →</button>
        </form>

        <button
          type="button"
          onClick={() => navigate('/select-role')}
          style={{ display: 'block', margin: '14px auto 0', background: 'none', border: 'none', fontSize: '13px', color: '#6b7280', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
        >
          ← Back to role selection
        </button>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '14px', color: '#6b7280' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#2d6a22', fontWeight: 600, textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
