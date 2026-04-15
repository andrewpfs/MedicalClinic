import DataTable from 'react-data-table-component'
import { useState, useEffect } from 'react'
import { tableCustomStyles, filterCard, filterRow, filterGroup, filterLabel, filterInput, sectionLabel } from './adminStyles'

function EditRowForm({ row, onClose, onSave }) {
  const [editted, setEditted] = useState({
    FirstName: row.FirstName || "",
    LastName: row.LastName || "",
    Email: row.Email || "",
    PhoneNumber: row.PhoneNumber || "",
    Address: row.Address || ""
  })

  const handleChange = (e) => {
    setEditted(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleClick = async e => {
    e.preventDefault()
    await fetch('/admin/api/updateEmployee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...editted, EmployeeID: row.EmployeeID })
    })
    onSave()
  }

  const overlay = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  }
  const modal = {
    background: 'white', padding: '2.5rem', borderRadius: '12px',
    width: '550px', display: 'flex', flexDirection: 'column', gap: '1.2rem'
  }
  const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '4px' }
  const labelStyle = { fontSize: '11px', fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }
  const inputStyle = { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box', fontFamily: 'Poppins, sans-serif' }
  const rowStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }
  const submitBtn = { padding: '10px 24px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }
  const cancelBtn = { padding: '10px 24px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: '#1e2b1b' }}>Edit employee</h2>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={rowStyle}>
            <div style={fieldStyle}>
              <span style={labelStyle}>First name</span>
              <input style={inputStyle} type="text" name="FirstName" onChange={handleChange} maxLength="30" defaultValue={row.FirstName} required />
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Last name</span>
              <input style={inputStyle} type="text" name="LastName" onChange={handleChange} maxLength="30" defaultValue={row.LastName} required />
            </div>
          </div>
          <div style={fieldStyle}>
            <span style={labelStyle}>Address</span>
            <input style={inputStyle} type="text" name="Address" onChange={handleChange} maxLength="100" defaultValue={row.Address} required />
          </div>
          <div style={rowStyle}>
            <div style={fieldStyle}>
              <span style={labelStyle}>Phone number</span>
              <input style={inputStyle} type="tel" placeholder="1234567890" name="PhoneNumber" onChange={handleChange} pattern="[0-9]{10}" defaultValue={row.PhoneNumber} required />
            </div>
            <div style={fieldStyle}>
              <span style={labelStyle}>Email</span>
              <input style={inputStyle} type="email" placeholder="example@example.com" name="Email" onChange={handleChange} defaultValue={row.Email} required />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" style={cancelBtn} onClick={onClose}>Cancel</button>
            <button style={submitBtn} onClick={handleClick}>Save changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EmployeeTable() {
  const [response, setResponse] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingRow, setEditingRow] = useState(null)

  async function fetchTableData() {
    setLoading(true)
    const data = await fetch("/admin/api/getEmployees", { credentials: 'include' }).then(res => res.json())
    setResponse(data)
    setRecords(data)
    setLoading(false)
  }

  useEffect(() => { fetchTableData() }, [])

  const columns = [
    { name: "Employee ID", selector: row => row.EmployeeID, sortable: true },
    { name: "First Name",  selector: row => row.FirstName,  sortable: true },
    { name: "Last Name",   selector: row => row.LastName,   sortable: true },
    { name: "Role",        selector: row => row.Role,       sortable: true },
    { name: "Email",       selector: row => row.Email },
    { name: "Phone",       selector: row => row.PhoneNumber },
    { name: "Address",     selector: row => row.Address },
    {
      name: 'Edit', button: true,
      cell: row => (
        <button
          onClick={() => setEditingRow(row)}
          style={{ fontSize: '12px', padding: '5px 12px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
        >
          Edit
        </button>
      )
    },
  ]

  function handleFilterF(event) {
    setRecords(response.filter(row => row.FirstName.toLowerCase().includes(event.target.value.toLowerCase())))
  }

  function handleFilterL(event) {
    setRecords(response.filter(row => row.LastName.toLowerCase().includes(event.target.value.toLowerCase())))
  }

  return (
    <div>
      <div style={filterCard}>
        <p style={sectionLabel}>Search</p>
        <div style={filterRow}>
          <div style={filterGroup}>
            <label style={filterLabel}>First name</label>
            <input type="text" onChange={handleFilterF} style={filterInput} placeholder="Search..." />
          </div>
          <div style={filterGroup}>
            <label style={filterLabel}>Last name</label>
            <input type="text" onChange={handleFilterL} style={filterInput} placeholder="Search..." />
          </div>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={records}
        progressPending={loading}
        pagination
        highlightOnHover
        customStyles={tableCustomStyles}
      />
      {editingRow && (
        <EditRowForm
          row={editingRow}
          onClose={() => setEditingRow(null)}
          onSave={() => { setEditingRow(null); fetchTableData() }}
        />
      )}
    </div>
  )
}

export default EmployeeTable