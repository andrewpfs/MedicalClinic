import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import API from '../../api'

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    FName: "", MName: "", LName: "",
    Dob: "", Address: "", PhoneNumber: "",
    Email: "", Password: "",
    GenderCode: "", RaceCode: "", EthnicityCode: "",
    HasInsurance: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch(`${API}/patient/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form)
    })

    if (res.ok) {
      navigate("/login")
    }
  }

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <h1>Register Patient</h1>
        <p className="subtitle">Please fill out this form</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <div className="form-grid">
              <input name="FName" placeholder="First Name" onChange={handleChange} required />
              <input name="MName" placeholder="Middle Name" onChange={handleChange} />
              <input name="LName" placeholder="Last Name" onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Date of Birth</label>
            <input type="date" name="Dob" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input name="Address" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input name="PhoneNumber" placeholder="0000000000" minLength="10" maxLength="10" onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="Email" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input type="password" name="Password" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="GenderCode" onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option value="1">Male</option>
              <option value="2">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label>Race</label>
            <select name="RaceCode" onChange={handleChange}>
              <option value="">Select Race</option>
              <option value="1">White</option>
              <option value="2">African</option>
              <option value="3">Asian</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ethnicity</label>
            <select name="EthnicityCode" onChange={handleChange}>
              <option value="">Select Ethnicity</option>
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
          </div>

          <div className="insurance-group">
            <label className="checkbox-label">
              <input type="checkbox" name="HasInsurance" onChange={handleChange} />
              Has Insurance
            </label>
          </div>

          <button type="submit">Register</button>
        </form>

        <p>Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  )
}

export default Register