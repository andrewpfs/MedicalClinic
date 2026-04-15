import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStaffAuth } from '../../hooks/useStaffAuth'
import { filterCard, filterRow, filterGroup, filterLabel, filterInput, primaryBtn, sectionLabel } from './adminStyles'

const AddE = () => {
  useStaffAuth('Admin')
  const navigate = useNavigate()
  const [department, setDepartment] = useState([])
  const [emp, setEmp] = useState({
    FirstName: '', LastName: '', BirthDate: '', GenderCode: '',
    RaceCode: '', EthnicityCode: '', Role: '', Department: '',
    Address: '', PhoneNumber: '', Email: '', Password: '',
    Specialty: '', IsPrimaryCare: '', AssignedDoctorID: ''
  })
  const [check, setCheck] = useState({ Doctor: false, Nurse: false })
  const [open, setOpen] = useState(false)

  async function getDepart() {
    try {
      const deps = await fetch('/admin/api/getdepartments').then(res => res.json())
      setDepartment(deps)
    } catch (err) { console.error(err) }
  }

  useEffect(() => { getDepart() }, [])

  const handleChange = (e) => {
    setEmp(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleClick = async e => {
    e.preventDefault()
    try {
      const response = await fetch('/api/addemployee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp)
      })
      if (response.ok) {
        setOpen(false)
        navigate('/admin/employees')
      }
    } catch (err) { console.error('Add employee error:', err) }
  }

  const handleDisplay = (e) => {
    setEmp(prev => ({ ...prev, Role: e.target.value }))
    if (e.target.value === 'Doctor') setCheck({ Doctor: true, Nurse: false })
    else if (e.target.value === 'Nurse') setCheck({ Doctor: false, Nurse: true })
    else setCheck({ Doctor: false, Nurse: false })
  }

  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }
  const select = { ...filterInput, width: '100%' }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          style={{ ...primaryBtn, marginBottom: '1.5rem' }}
        >
          + Add new employee
        </button>
      ) : (
        <div style={{ ...filterCard, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>New employee</p>
          </div>

          <form onSubmit={handleClick}>
            {/* Row 1 — Name */}
            <div style={{ ...grid2, marginBottom: '12px' }}>
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
            <div style={{ ...grid2, marginBottom: '12px' }}>
              <div style={filterGroup}>
                <label style={filterLabel}>Date of birth *</label>
                <input style={filterInput} type="date" name="BirthDate" onChange={handleChange} required />
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
            <div style={{ ...grid2, marginBottom: '12px' }}>
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
            <div style={{ ...grid2, marginBottom: '12px' }}>
              <div style={filterGroup}>
                <label style={filterLabel}>Role *</label>
                <select style={select} name="Role" onChange={handleDisplay} required>
                  <option value="">Select role</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div style={filterGroup}>
                <label style={filterLabel}>Department *</label>
                <select style={select} name="DepartmentName" onChange={handleChange}>
                  {department.map(d => (
                    <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 5 — Phone + Email */}
            <div style={{ ...grid2, marginBottom: '12px' }}>
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
            <div style={{ ...grid2, marginBottom: '12px' }}>
              <div style={filterGroup}>
                <label style={filterLabel}>Address</label>
                <input style={filterInput} type="text" name="Address" onChange={handleChange} maxLength="100" />
              </div>
              <div style={filterGroup}>
                <label style={filterLabel}>Password *</label>
                <input style={filterInput} type="password" placeholder="Password" name="Password" onChange={handleChange} required />
              </div>
            </div>

            {/* Conditional — Doctor fields */}
            {check.Doctor && (
              <div style={{ ...grid2, marginBottom: '12px' }}>
                <div style={filterGroup}>
                  <label style={filterLabel}>Specialty</label>
                  <input style={filterInput} type="text" placeholder="Specialty" name="Specialty" onChange={handleChange} maxLength="20" />
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
              <div style={{ marginBottom: '12px' }}>
                <div style={filterGroup}>
                  <label style={filterLabel}>Assigned doctor ID</label>
                  <input style={{ ...filterInput, maxWidth: '50%' }} type="text" placeholder="0000" name="AssignedDoctorID" onChange={handleChange} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="submit" style={primaryBtn}>Create employee</button>
              <button
                type="button"
                onClick={() => setOpen(false)}
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