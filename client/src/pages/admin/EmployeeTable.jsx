import DataTable from 'react-data-table-component'
import {useState,useEffect} from 'react'
 
function EditRowForm({ row, onClose, onSave }) {
    const [editted,setEditted] = useState({
        FirstName: row.FirstName || "",
        LastName: row.LastName || "",
        Email: row.Email || "",
        PhoneNumber: row.PhoneNumber || "",
        Address: row.Address || ""
    })
 
    const handleChange = (e) => {
        setEditted(prev=>({...prev,[e.target.name]:e.target.value}));
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
        position:'fixed',top:0,left:0,width:'100%',height:'100%',
        background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',
        justifyContent:'center',zIndex:1000
    }
    const modal = {
        background:'white',padding:'2.5rem',borderRadius:'12px',
        width:'550px',boxShadow:'0 10px 40px rgba(0,0,0,0.3)',
        display:'flex',flexDirection:'column',gap:'1.2rem'
    }
    const fieldStyle = {
        display:'flex',flexDirection:'column',gap:'4px'
    }
    const labelStyle = {
        fontSize:'13px',fontWeight:'600',color:'#555',textTransform:'uppercase',letterSpacing:'0.5px'
    }
    const inputStyle = {
        padding:'10px 12px',border:'1px solid #ddd',borderRadius:'6px',
        fontSize:'15px',outline:'none',width:'100%',boxSizing:'border-box'
    }
    const rowStyle = {
        display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'
    }
    const submitBtn = {
        padding:'10px 24px',background:'#2563eb',color:'white',border:'none',
        borderRadius:'6px',fontSize:'15px',cursor:'pointer',fontWeight:'600'
    }
    const cancelBtn = {
        padding:'10px 24px',background:'#f1f1f1',color:'#333',border:'none',
        borderRadius:'6px',fontSize:'15px',cursor:'pointer',fontWeight:'600'
    }
 
    return (
        <div style={overlay}>
            <div style={modal}>
                <h2 style={{margin:0,fontSize:'22px',color:'#111'}}>Edit Employee</h2>
                <form style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                    <div style={rowStyle}>
                        <div style={fieldStyle}>
                            <span style={labelStyle}>First Name</span>
                            <input style={inputStyle} type="text" name="FirstName" onChange={handleChange} maxLength="30" defaultValue={row.FirstName} required/>
                        </div>
                        <div style={fieldStyle}>
                            <span style={labelStyle}>Last Name</span>
                            <input style={inputStyle} type="text" name="LastName" onChange={handleChange} maxLength="30" defaultValue={row.LastName} required/>
                        </div>
                    </div>
                    <div style={fieldStyle}>
                        <span style={labelStyle}>Address</span>
                        <input style={inputStyle} type="text" name="Address" onChange={handleChange} maxLength="100" defaultValue={row.Address} required/>
                    </div>
                    <div style={rowStyle}>
                        <div style={fieldStyle}>
                            <span style={labelStyle}>Phone Number</span>
                            <input style={inputStyle} type="tel" placeholder="1234567890" name="PhoneNumber" onChange={handleChange} pattern="[0-9]{10}" defaultValue={row.PhoneNumber} required/>
                        </div>
                        <div style={fieldStyle}>
                            <span style={labelStyle}>Email</span>
                            <input style={inputStyle} type="email" placeholder="example@example.com" name="Email" onChange={handleChange} defaultValue={row.Email} required/>
                        </div>
                    </div>
                    <div style={{display:'flex',gap:'0.75rem',justifyContent:'flex-end',marginTop:'0.5rem'}}>
                        <button type="button" style={cancelBtn} onClick={onClose}>Cancel</button>
                        <button style={submitBtn} onClick={handleClick}>Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
 
function EmployeeTable() {
    const [response,setResponse] = useState([])
    const [records,setRecords] = useState([])
    const [loading,setLoading] = useState(false)
    const [editingRow,setEditingRow] = useState(null)
 
    async function fetchTableData() {
        setLoading(true)
        const data = await fetch("/admin/api/getEmployees").then(res => res.json())
        setResponse(data)
        setRecords(data)
        setLoading(false)
    };
 
    useEffect(() => {
        fetchTableData()
    }, []);
 
    const columns = [
        {
            name: "Employee ID",
            selector: (row) => row.EmployeeID,
            sortable: true
        },
        {
            name: "First Name",
            selector: (row) => row.FirstName,
            sortable: true
        },
        {
            name: "Last Name",
            selector: (row) => row.LastName,
            sortable: true
        },
        {
            name: "Role",
            selector: (row) => row.Role,
            sortable: true
        },
        {
            name: "Email",
            selector: (row) => row.Email,
        },
        {
            name: "Phone Number",
            selector: (row) => row.PhoneNumber,
        },
        {
            name: "Address",
            selector: (row) => row.Address,
        },
        {
            name: "Edit",
            button: true,
            cell: (row) => (
                <button onClick={() => setEditingRow(row)}>Edit</button>
            )
        },
 
    ];
 
 
 
    function handleFilterF(event) {
        const newData = response.filter(row => {
            return row.FirstName.toLowerCase().includes(event.target.value.toLowerCase())
        })
        setRecords(newData)
    };
 
    function handleFilterL(event) {
        const newData = response.filter(row => {
            return row.LastName.toLowerCase().includes(event.target.value.toLowerCase())
        })
        setRecords(newData)
    };
 
    return (
        <div className="report-table">
            <div>
                <label>First Name:
                    <input type="text" onChange={handleFilterF}/>
                </label>
                <label>Last Name:
                    <input type="text" onChange={handleFilterL}/>
                </label>
            </div>
            <DataTable
                title="Report"
                columns={columns}
                data={records}
                progressPending={loading}
                fixedHeader/>
            {editingRow && (
                <EditRowForm
                    row={editingRow}
                    onClose={() => setEditingRow(null)}
                    onSave={() => { setEditingRow(null); fetchTableData() }}
                />
            )}
        </div>
    );
};
 
export default EmployeeTable;