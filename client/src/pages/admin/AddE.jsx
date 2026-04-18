import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStaffAuth } from '../../hooks/useStaffAuth'
import { filterCard, filterGroup, filterLabel, filterInput, primaryBtn, sectionLabel } from './adminStyles'

const AddE = ({ onSuccess }) => {
  useStaffAuth('Admin')
  const navigate = useNavigate()
  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [emp, setEmp] = useState({
    FirstName: '', LastName: '', BirthDate: '', GenderCode: '',
    RaceCode: '', EthnicityCode: '', Role: '', DepartmentID: '',
    Address: '', PhoneNumber: '', Email: '', Password: 'admin123',
    Specialty: '', IsPrimaryCare: '', AssignedDoctorID: ''
  })
  const [check, setCheck] = useState({ Doctor: false, Nurse: false })
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/admin/api/getdepartments').then(r => r.json()).then(setDepartments).catch(console.error)
    fetch('/admin/api/getdoctors').then(r => r.json()).then(setDoctors).catch(console.error)
  }, [])

  const handleChange = (e) => {
    setEmp(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleRoleChange = (e) => {
    const role = e.target.value
    setEmp(prev => ({ ...prev, Role: role }))
    setCheck({ Doctor: role === 'Doctor', Nurse: role === 'Nurse' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      // Step 1: create base employee record
      const empRes = await fetch('/admin/api/addemployee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...emp, Password: 'admin123' })
      })
      const empData = await empRes.json()
      if (!empRes.ok) throw new Error(empData.error || 'Failed to create employee')

      const newId = empData.employeeId

      // Step 2: if Doctor, insert into doctor table
      if (check.Doctor) {
        const drRes = await fetch('/admin/api/adddoctor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ EmployeeID: newId, Specialty: emp.Specialty, IsPrimaryCare: emp.IsPrimaryCare })
        })
        if (!drRes.ok) throw new Error('Employee created but failed to save doctor details')
      }

      // Step 3: if Nurse, insert into nurse table
      if (check.Nurse) {
        const nurseRes = await fetch('/admin/api/addnurse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ EmployeeID: newId, AssignedDoctorID: emp.AssignedDoctorID || null })
        })
        if (!nurseRes.ok) throw new Error('Employee created but failed to save nurse details')
      }

      setOpen(false)
      if (onSuccess) onSuccess()
      else navigate('/admin/employees')
    } catch (err) {
      setError(err.message)
    }
  }

  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }
  const select = { ...filterInput, width: '100%' }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{ ...primaryBtn, marginBottom: '1.5rem' }}>
          + Add new employee
        </button>
      ) : (
        <div style={{ ...filterCard, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>New employee</p>
          </div>

          {error && (
            <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', color: '#991b1b' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Row 1 — Name */}
            <div style={grid2}>
              <div style={filterGroup}>
                <label style={filterLabel}>First name *</label>
                <input style={filterInput} type="text" name="FirstName" onChange={handleChange} maxLength="30" required />
              </div>
              <div style={filterGroup}>
                <label style={filterLabel}>Last name *</label>
                <input style={filterInput} type="text" name="LastName" onChange={handleChange} maxLength="30" required />
              </div>
            </div>

            {/* Row 2 — DOB + Gender */}
            <div style={grid2}>
              <div style={filterGroup}>
                <label style={filterLabel}>Date of birth</label>
                <input style={filterInput} type="date" name="BirthDate" onChange={handleChange} />
              </div>
              <div style={filterGroup}>
                <label style={filterLabel}>Gender</label>
                <select style={select} name="GenderCode" onChange={handleChange}>
                  <option value="">Select gender</option>
                  <option value="1">Male</option>
                  <option value="2">Female</option>
                  <option value="3">Other</option>
                </select>
              </div>
            </div>

            {/* Row 3 — Race + Ethnicity */}
            <div style={grid2}>
              <div style={filterGroup}>
                <label style={filterLabel}>Race</label>
                <select style={select} name="RaceCode" onChange={handleChange}>
                  <option value="">Select race</option>
                  <option value="1">White</option>
                  <option value="3">African</option>
                  <option value="2">Asian</option>
                  <option value="5">Other</option>
                </select>
              </div>
              <div style={filterGroup}>
                <label style={filterLabel}>Ethnicity</label>
                <select style={select} name="EthnicityCode" onChange={handleChange}>
                  <option value="">Select ethnicity</option>
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
            </div>

            {/* Row 4 — Role + Department */}
            <div style={grid2}>
              <div style={filterGroup}>
                <label style={filterLabel}>Role *</label>
                <select style={select} name="Role" onChange={handleRoleChange} required>
                  <option value="">Select role</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div style={filterGroup}>
                <label style={filterLabel}>Department</label>
                <select style={select} name="DepartmentID" onChange={handleChange}>
                  <option value="">Select department</option>
                  {departments.map(d => (
                    <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 5 — Phone + Email */}
            <div style={grid2}>
              <div style={filterGroup}>
                <label style={filterLabel}>Phone number</label>
                <input style={filterInput} type="tel" placeholder="1234567890" name="PhoneNumber" onChange={handleChange} pattern="[0-9]{10}" />
              </div>
              <div style={filterGroup}>
                <label style={filterLabel}>Email *</label>
                <input style={filterInput} type="email" placeholder="example@example.com" name="Email" onChange={handleChange} required />
              </div>
            </div>

            {/* Row 6 — Address + Password */}
            <div style={grid2}>
              <div style={filterGroup}>
                <label style={filterLabel}>Address</label>
                <input style={filterInput} type="text" name="Address" onChange={handleChange} maxLength="100" />
              </div>
              <div style={filterGroup}>
                <label style={filterLabel}>Default password</label>
                <input style={{ ...filterInput, background: '#f8fafc', color: '#475569' }} type="text" value="admin123" readOnly />
              </div>
            </div>

            {/* Conditional — Doctor fields */}
            {check.Doctor && (
              <div style={grid2}>
                <div style={filterGroup}>
                  <label style={filterLabel}>Specialty</label>
                  <input style={filterInput} type="text" placeholder="e.g. Cardiology" name="Specialty" onChange={handleChange} maxLength="20" />
                </div>
                <div style={filterGroup}>
                  <label style={filterLabel}>Primary care physician?</label>
                  <select style={select} name="IsPrimaryCare" onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
              </div>
            )}

            {/* Conditional — Nurse fields */}
            {check.Nurse && (
              <div style={{ ...grid2 }}>
                <div style={filterGroup}>
                  <label style={filterLabel}>Assigned Doctor</label>
                  <select style={select} name="AssignedDoctorID" onChange={handleChange}>
                    <option value="">Select doctor</option>
                    {doctors.map(d => (
                      <option key={d.EmployeeID} value={d.EmployeeID}>
                        Dr. {d.LastName}, {d.FirstName}{d.Specialty ? ` — ${d.Specialty}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="submit" style={primaryBtn}>Create employee</button>
              <button
                type="button"
                onClick={() => { setOpen(false); setError('') }}
                style={{ padding: '9px 20px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default AddE
