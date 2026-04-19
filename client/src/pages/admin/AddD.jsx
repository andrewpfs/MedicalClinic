import React from 'react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStaffAuth } from '../../hooks/useStaffAuth'
import { filterCard, filterGroup, filterLabel, filterInput, primaryBtn, sectionLabel } from './adminStyles'
import API from '../../api'

const AddD = ({ onSuccess }) => {
  useStaffAuth('Admin')
  const navigate = useNavigate()
  const [offices, setOffices] = useState([])
  const [departments,setDepts] = useState([])
  const [check,setCheck] = useState(true)
  const [emp, setEmp] = useState({
    DepartmentName: '', OfficeID: ''
  })
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API}/admin/api/getoffices`).then(r => r.json()).then(setOffices).catch(console.error)
    fetch(`${API}/admin/api/getdepartments`).then(r => r.json()).then(setDepts).catch(console.error)
  }, [])

  const handleChange = (e) => {
    setEmp(prev => ({ ...prev, [e.target.name]: e.target.value }))
    console.log(emp)
  }

  const handleRoleChange = (e) => {
    const role = e.target.value
    setEmp(prev => ({ ...prev, Role: role }))
    setCheck({ Doctor: role === 'Doctor', Nurse: role === 'Nurse' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    departments.forEach((row) => {
      if (row.DepartmentName === emp.DepartmentName && row.OfficeID === emp.OfficeID) setCheckEmail(false)}) 
    if (check) {
      try {
        // Step 1: create department record
        console.log(emp)
        const empRes = await fetch(`${API}/admin/api/adddepartment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emp)
        })
        const empData = await empRes.json()
        if (!empRes.ok) throw new Error(empData.error || 'Failed to create department')

        setOpen(false)
        if (onSuccess) onSuccess()
        else navigate('/admin/departments')
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const grid2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }
  const select = { ...filterInput, width: '100%' }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {!open ? (
        <button onClick={() => setOpen(true)} style={{ ...primaryBtn, marginBottom: '1.5rem' }}>
          + Add new department
        </button>
      ) : (
        <div style={{ ...filterCard, marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <p style={sectionLabel}>New department</p>
          </div>

          {error && (
            <div style={{ marginBottom: '12px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', color: '#991b1b' }}>
              {error}{!check && ", That Department already exists in that Office"}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Row 1 — Name */}
            <div style={grid2}>
              <div style={filterGroup}>
                <label style={filterLabel}>Department Name *</label>
                <input style={filterInput} type="text" name="DepartmentName" onChange={handleChange} maxLength="30" required />
              </div>
              <div style={filterGroup}>
                <label style={filterLabel}>Office *</label>
                <select style={select} name="OfficeID" onChange={handleChange}>
                  <option value="">Select office</option>
                  {offices.map(d => (
                    <option key={d.OfficeID} value={d.OfficeID}>{d.OfficeName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="submit" style={primaryBtn}>Create department</button>
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

export default AddD
