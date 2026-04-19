import DataTable from 'react-data-table-component'
import { useState, useEffect } from 'react'
import { tableCustomStyles, filterCard, filterRow, filterGroup, filterLabel, filterInput, sectionLabel } from './adminStyles'
import API from '../../api'

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
    await fetch(`${API}/admin/api/updateEmployee`, {
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

<<<<<<< Updated upstream
function ViewRowForm({ row,onClose,onSave }) {
  const [response,setResponse] = useState([])
  const [records,setRecords] = useState([])
  const [selected,setSelected] = useState([])
  const [departments,setDepts] = useState([])
  const [rep,setRep] = useState({
    DepartmentID: ""
  })
  const [loading, setLoading] = useState(false)
  const [editingRow, setEditingRow] = useState(null)

=======
function ViewRowForm({ row, onClose, onSave }) {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [selected, setSelected] = useState([])
  const [targetDept, setTargetDept] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${API}/admin/api/getemployeesbydept/${row.DepartmentID}`, { credentials: 'include' })
      .then(r => r.json()).then(setEmployees).catch(console.error)
    fetch(`${API}/admin/api/getdepartments`, { credentials: 'include' })
      .then(r => r.json()).then(setDepartments).catch(console.error)
  }, [row.DepartmentID])

  const handleSelect = ({ selectedRows }) => setSelected(selectedRows)

  const handleTransfer = async () => {
    if (!selected.length) { setStatus('Select at least one employee.'); return }
    if (!targetDept) { setStatus('Select a destination department.'); return }
    setLoading(true)
    setStatus('')
    try {
      const res = await fetch(`${API}/admin/api/transferdepartment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ EmployeeIDs: selected.map(e => e.EmployeeID), DepartmentID: targetDept })
      })
      if (!res.ok) throw new Error()
      setStatus(`Transferred ${selected.length} employee(s) successfully.`)
      setSelected([])
      const updated = await fetch(`${API}/admin/api/getemployeesbydept/${row.DepartmentID}`, { credentials: 'include' }).then(r => r.json())
      setEmployees(updated)
      onSave()
    } catch {
      setStatus('Transfer failed. Please try again.')
    }
    setLoading(false)
  }

>>>>>>> Stashed changes
  const overlay = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  }
  const modal = {
<<<<<<< Updated upstream
    background: 'white', padding: '2.5rem', borderRadius: '12px',
    width: '1000px', display: 'flex', flexDirection: 'column', gap: '1.2rem'
  }

  async function fetchTableData() {
    setLoading(true)
    const params = new URLSearchParams(row);
    const data = await fetch(`${API}/admin/api/getdeptEmployees?${params}`, { credentials: 'include' }).then(res => res.json())
    setResponse(data)
    setRecords(data)
    setLoading(false)
  }

  async function fetchDepartmentData() {
        console.log("fethcing patients")
        try {
            const response = await fetch('/admin/api/getdepartments',{credentials:"include"})
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rows = await response.json();
            
            setDepts(rows)
        } catch(err) {
            console.error('Error fetching patients:', err);
        }
    }

  useEffect(() => { 
    fetchTableData()
    fetchDepartmentData() 
  }, [])

  const columns = [
    { name: "ID", selector: row => row.EmployeeID, sortable: true },
    { name: "First",  selector: row => row.FirstName,  sortable: true },
    { name: "Last",   selector: row => row.LastName,   sortable: true },
    { name: "Role",        selector: row => row.Role,       sortable: true },
    { name: "Email",       selector: row => row.Email },
    { name: "Phone",       selector: row => row.PhoneNumber },
    { name: "Department",     selector: row => row.DepartmentName },
  ]

  function handleFilterF(event) {
    setRecords(response.filter(row => row.FirstName.toLowerCase().includes(event.target.value.toLowerCase())))
  }

  function handleFilterL(event) {
    setRecords(response.filter(row => row.LastName.toLowerCase().includes(event.target.value.toLowerCase())))
  }

  function handleSelect(event) {
    //console.log(event.selectedRows)
    setSelected(event.selectedRows)
  }

  function handleChange(event) {
    setRep({DepartmentID: event.target.value})
  }

  async function handleClick(event) {
    if (selected && rep.DepartmentID) {
      selected.forEach(row => fetch('transferdepartment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({"DepartmentID":rep.DepartmentID,"EmployeeID":row.EmployeeID})
        }))
    }
  }

  const cancelBtn = { padding: '10px 24px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: '#1e2b1b' }}>Employees in {row.DepartmentName}</h2>
        <div style={filterCard}>
        <div style={filterRow}>
        <p style={sectionLabel}>Search</p>
        
          <div style={filterGroup}>
            <label style={filterLabel}>First name</label>
            <input type="text" style={filterInput} onChange={handleFilterF} style={filterInput} placeholder="Search..." />
          </div>
          <div style={filterGroup}>
            <label style={filterLabel}>Last name</label>
            <input type="text" style={filterInput} onChange={handleFilterL} style={filterInput} placeholder="Search..." />
          </div>
          <p style={sectionLabel}>Transfer</p>
        <div style={filterGroup}>
            <label style={filterLabel}>Selected IDs</label>
            {selected ? (selected.forEach((row)=>row.EmployeeID+" ")) : ("None")}
        </div>
        <div style={filterGroup}>
          <label style={filterLabel}>Department</label>
          <select name="DepartmentID" onChange={handleChange}>
            <option value="">Select</option>
            {departments.map(d => (
              <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>
              ))}
          </select>
          </div>
          <div style={filterGroup}>
            <button onClick={handleClick}>Transfer</button>
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
          selectableRows="true"
          onSelectedRowsChange={handleSelect}
        />
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" style={cancelBtn} onClick={onClose}>Close</button>
          </div>
=======
    background: 'white', padding: '2rem', borderRadius: '12px',
    width: '700px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto'
  }
  const submitBtn = { padding: '9px 20px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }
  const cancelBtn = { padding: '9px 20px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }
  const selectStyle = { padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', fontFamily: 'Poppins, sans-serif', minWidth: '220px' }

  const empColumns = [
    { name: 'Name', selector: r => `${r.FirstName} ${r.LastName}`, sortable: true },
    { name: 'Role', selector: r => r.Role, sortable: true },
    { name: 'Email', selector: r => r.Email },
    { name: 'Phone', selector: r => r.PhoneNumber },
  ]

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: '#1e2b1b' }}>
            {row.DepartmentName} — Employees
          </h2>
          <button style={cancelBtn} onClick={onClose}>Close</button>
        </div>
        <DataTable
          columns={empColumns}
          data={employees}
          selectableRows
          onSelectedRowsChange={handleSelect}
          customStyles={tableCustomStyles}
          dense
          noDataComponent="No employees in this department."
        />
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <select style={selectStyle} value={targetDept} onChange={e => setTargetDept(e.target.value)}>
            <option value="">Transfer selected to…</option>
            {departments.filter(d => d.DepartmentID !== row.DepartmentID).map(d => (
              <option key={d.DepartmentID} value={d.DepartmentID}>{d.DepartmentName}</option>
            ))}
          </select>
          <button style={submitBtn} onClick={handleTransfer} disabled={loading}>
            {loading ? 'Transferring…' : 'Transfer'}
          </button>
          {status && <span style={{ fontSize: '13px', color: status.includes('success') ? '#15803d' : '#dc2626' }}>{status}</span>}
        </div>
>>>>>>> Stashed changes
      </div>
    </div>
  )
}

function DepartmentTable({ refreshKey = 0 }) {
  const [response, setResponse] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewRow, setViewRow] = useState(null)
  const [editingRow, setEditingRow] = useState(null)

  async function fetchTableData() {
    setLoading(true)
    const data = await fetch(`${API}/admin/api/getdepartmentinfo`, { credentials: 'include' }).then(res => res.json())
    setResponse(data)
    setRecords(data)
    setLoading(false)
  }


  useEffect(() => { fetchTableData() }, [refreshKey])

  const columns = [
    { name: "Department ID", selector: row => row.DepartmentID, sortable: true },
    { name: "Department",  selector: row => row.DepartmentName,  sortable: true },
    { name: "Office",   selector: row => row.OfficeName,   sortable: true },
    { name: "Location",        selector: row => row.Street+", "+row.City+", "+row.State+" "+row.ZipCode,       sortable: true },
    { name: "Phone Number",       selector: row => row.PhoneNumber },
    { name: "# of Employees",       selector: row => row.Employees || "0" },
    {
      name: 'View Employees', button: true,
      cell: row => (
        <button
          onClick={() => setViewRow(row)}
          style={{ fontSize: '12px', padding: '5px 12px', background: '#1e2b1b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'Poppins, sans-serif' }}
        >
          Employees
        </button>
      )
    },
  ]

  function handleFilterD(event) {
    setRecords(response.filter(row => row.DepartmentName.toLowerCase().includes(event.target.value.toLowerCase())))
  }

  function handleFilterO(event) {
    setRecords(response.filter(row => row.OfficeName.toLowerCase().includes(event.target.value.toLowerCase())))
  }

  return (
    <div>
      <div style={filterCard}>
        <p style={sectionLabel}>Search</p>
        <div style={filterRow}>
          <div style={filterGroup}>
            <label style={filterLabel}>Department</label>
            <input type="text" onChange={handleFilterD} style={filterInput} placeholder="Search..." />
          </div>
          <div style={filterGroup}>
            <label style={filterLabel}>Office</label>
            <input type="text" onChange={handleFilterO} style={filterInput} placeholder="Search..." />
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
      {viewRow && (
        <ViewRowForm
          row={viewRow}
          onClose={() => setViewRow(null)}
          onSave={() => fetchTableData()}
        />
      )}
    </div>
  )
}

export default DepartmentTable