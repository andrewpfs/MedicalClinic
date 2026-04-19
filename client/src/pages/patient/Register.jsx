import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import API from '../../api'

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
  maxWidth: '580px',
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

const sectionHead = {
  fontSize: '10px', fontWeight: 700, color: '#6b7280',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px',
}
const sectionLine = { flex: 1, height: '1px', background: '#f3f4f6' }

const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }
const grid3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }

const fieldGroup = { display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }
const labelStyle = {
  fontSize: '11px', fontWeight: 600, color: '#374151',
  textTransform: 'uppercase', letterSpacing: '0.06em',
}
const inputStyle = {
  padding: '10px 13px', border: '1.5px solid #e5e7eb', borderRadius: '10px',
  fontSize: '14px', fontFamily: 'Poppins, sans-serif', color: '#111',
  outline: 'none', width: '100%', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
  background: '#fafafa',
}
const selectStyle = { ...inputStyle, background: '#fafafa' }

const submitBtn = {
  width: '100%', padding: '13px', marginTop: '10px',
  background: 'linear-gradient(135deg, #1e3a1a, #3a7a30)',
  color: 'white', border: 'none', borderRadius: '12px',
  fontSize: '15px', fontWeight: 700, cursor: 'pointer',
  fontFamily: 'Poppins, sans-serif', letterSpacing: '0.02em',
  boxShadow: '0 4px 16px rgba(30,58,26,0.35)',
  transition: 'opacity 0.15s',
}

const errorBox = {
  background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
  padding: '10px 14px', fontSize: '13px', color: '#991b1b', marginBottom: '14px',
}

const insuranceBox = {
  display: 'flex', alignItems: 'center', gap: '10px',
  background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '10px',
  padding: '10px 14px', margin: '4px 0 18px', cursor: 'pointer',
}

function SectionHeader({ children }) {
  return (
    <div style={sectionHead}>
      {children}
      <div style={sectionLine} />
    </div>
  )
}

function Field({ label: lbl, children }) {
  return (
    <div style={fieldGroup}>
      <label style={labelStyle}>{lbl}</label>
      {children}
    </div>
  )
}

function Register() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    FName: "", MName: "", LName: "",
    Dob: "", Address: "", PhoneNumber: "",
    Email: "", Password: "",
    GenderCode: "", RaceCode: "", EthnicityCode: "",
    HasInsurance: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const res = await fetch(`${API}/patient/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form)
    })
    if (res.ok) {
      navigate("/login")
    } else {
      const msg = await res.json()
      setError(typeof msg === 'string' ? msg : 'Registration failed. Please try again.')
    }
  }

  return (
    <div style={page}>
      <div style={bgAccent} />
      <div style={bgAccent2} />
      <div style={card}>
        <div style={headerAccent}>Medical Clinic · Patient Portal</div>
        <h1 style={titleStyle}>Create your account</h1>
        <p style={subtitleStyle}>Register below to access your patient portal and manage your care.</p>

        {error && <div style={errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <SectionHeader>Personal info</SectionHeader>
          <div style={grid3}>
            <Field label="First name *">
              <input style={inputStyle} name="FName" placeholder="Jane" onChange={handleChange} required />
            </Field>
            <Field label="Middle">
              <input style={inputStyle} name="MName" placeholder="M." onChange={handleChange} />
            </Field>
            <Field label="Last name *">
              <input style={inputStyle} name="LName" placeholder="Doe" onChange={handleChange} required />
            </Field>
          </div>

          <div style={grid2}>
            <Field label="Date of birth *">
              <input style={inputStyle} type="date" name="Dob" onChange={handleChange} required />
            </Field>
            <Field label="Phone number">
              <input style={inputStyle} name="PhoneNumber" placeholder="0000000000" minLength="10" maxLength="10" onChange={handleChange} />
            </Field>
          </div>

          <Field label="Address *">
            <input style={inputStyle} name="Address" placeholder="123 Main St, City, State" onChange={handleChange} required />
          </Field>

          <SectionHeader>Account credentials</SectionHeader>
          <div style={grid2}>
            <Field label="Email *">
              <input style={inputStyle} type="email" name="Email" placeholder="you@example.com" onChange={handleChange} required />
            </Field>
            <Field label="Password *">
              <input style={inputStyle} type="password" name="Password" placeholder="••••••••" onChange={handleChange} required />
            </Field>
          </div>

          <SectionHeader>Demographics</SectionHeader>
          <div style={grid3}>
            <Field label="Gender">
              <select style={selectStyle} name="GenderCode" onChange={handleChange}>
                <option value="">Select</option>
                <option value="1">Male</option>
                <option value="2">Female</option>
                <option value="3">Other</option>
              </select>
            </Field>
            <Field label="Race">
              <select style={selectStyle} name="RaceCode" onChange={handleChange}>
                <option value="">Select</option>
                <option value="1">White</option>
                <option value="2">Asian</option>
                <option value="3">African</option>
                <option value="5">Other</option>
              </select>
            </Field>
            <Field label="Ethnicity">
              <select style={selectStyle} name="EthnicityCode" onChange={handleChange}>
                <option value="">Select</option>
                <option value="1">Hispanic</option>
                <option value="2">Latin American</option>
                <option value="3">African</option>
                <option value="4">Caribbean</option>
                <option value="5">Indian</option>
                <option value="6">Melanesian</option>
                <option value="7">Chinese</option>
                <option value="8">Japanese</option>
                <option value="9">Korean</option>
                <option value="10">Arabic</option>
                <option value="11">European</option>
                <option value="12">Other</option>
              </select>
            </Field>
          </div>

          <label style={insuranceBox}>
            <input
              type="checkbox"
              name="HasInsurance"
              id="insurance"
              onChange={handleChange}
              style={{ width: '16px', height: '16px', accentColor: '#16a34a', cursor: 'pointer', flexShrink: 0 }}
            />
            <span style={{ fontSize: '14px', color: '#166534', fontWeight: 500 }}>
              I have health insurance
            </span>
          </label>

          <button type="submit" style={submitBtn}>Create account →</button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#9ca3af', marginTop: '1.25rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1e3a1a', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
