import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles.css"

function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch("/patient/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ Email: email, Password: password })
      })

      if (res.ok) {
        navigate("/")
      } else {
        const msg = await res.json()
        setError(typeof msg === "string" ? msg : "Login failed.")
      }
    } catch {
      setError("Could not connect to server.")
    }
  }

  return (
    <div className="login-container">
      <div className="card">
        <div className="card-header">
          <h2>Welcome back</h2>
          <p>Sign in to your patient account</p>
        </div>

        {error && <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              className="login-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

        <p className="register-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
