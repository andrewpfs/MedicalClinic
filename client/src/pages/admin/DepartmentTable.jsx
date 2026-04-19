import DataTable from 'react-data-table-component'
import { useState, useEffect } from 'react'
import { tableCustomStyles, filterCard, filterRow, filterGroup, filterLabel, filterInput, sectionLabel } from './adminStyles'
import API from '../../api'

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

  const overlay = {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000
  }
  const modal = {
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
    const data = await fetch(`${API}/admin/api/getdepartments`, { credentials: 'include' }).then(res => res.json())
    setResponse(data)
    setRecords(data)
    setLoading(false)
  }

  useEffect(() => { fetchTableData() }, [refreshKey])

  const columns = [
    { name: "Department ID", selector: row => row.DepartmentID, sortable: true },
    { name: "Department",    selector: row => row.DepartmentName, sortable: true },
    { name: "# of Employees", selector: row => row.Employees || "0" },
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

  return (
    <div>
      <div style={filterCard}>
        <p style={sectionLabel}>Search</p>
        <div style={filterRow}>
          <div style={filterGroup}>
            <label style={filterLabel}>Department</label>
            <input type="text" onChange={handleFilterD} style={filterInput} placeholder="Search..." />
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
