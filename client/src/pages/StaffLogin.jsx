import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from '../api'

function StaffLogin() {
  const [employeeId, setEmployeeId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch(`${API}/api/employee/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ employeeId, password })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        if (data.role === "Doctor") {
          navigate("/doctor")
        } else if (data.role === "Admin") {
          navigate("/admin")
        } else {
          navigate("/employee")
        }
      } else {
        setError(data.error || "Login failed.")
      }
    } catch {
      setError("Could not connect to server.")
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8', display: 'flex', flexDirection: 'column' }}>
      <div className="navbar">
        <div className="logo">Medical Center</div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="card-header">
            <h2>Staff Login</h2>
            <p>Sign in with your Employee ID and password</p>
          </div>

          {error && <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="employeeId">Employee ID</label>
              <input
                type="number"
                id="employeeId"
                className="login-input"
                placeholder="e.g. 1"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                className="login-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-submit">Sign In</button>
          </form>

          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <button
              onClick={() => navigate("/select-role")}
              style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '14px' }}
            >
              ← Back to role selection
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffLogin
