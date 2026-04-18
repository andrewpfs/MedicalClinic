import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import { tableCustomStyles, filterCard, filterRow, filterGroup, filterLabel, filterInput, primaryBtn, sectionLabel } from './adminStyles'

function InvoiceReport() {
    const [response, setResponse] = useState([])
    const [records, setRecords] = useState([])
    const [departments, setDepts]   = useState([])
    const [depNames, setDepNames] = useState([])
    const [patIds, setPatIds] = useState([])
    const [patients,setPatients] = useState([])
    const [loading, setLoading] = useState(false)
    const [filterCheck,setFilterCheck] = useState(true)
    const [best,setBest] = useState({
        totalInvoice: 0,
        topPatient: "",
        topPatInvoice: 0,
        topDepartment: "",
        topDepInvoice: 0
    })
    const [rep,setRep] = useState({
        DepartmentName: "",
        PFirst: "",
        PLast: "",
        min: "",
        max: ""
    })


    async function fetchTableData() {
        setLoading(true)
        try {
            const data = await fetch("/admin/api/pullinvoice").then(res => res.json())
            setResponse(data)
            setRecords(data)
        }catch(err){
            console.error(err)
        }
        setLoading(false)
    }

    async function fetchPatientData() {
        //console.log("fethcing patients")
        try {
            const response = await fetch('/admin/api/getpatients')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rows = await response.json();
            let ids = [];
            
            if (Array.isArray(rows)) {
                rows.forEach((row) => {
                    ids.push(row.PatientID);
                });
            }
            setPatIds(ids)
            setPatients(rows)
        } catch(err) {
            console.error('Error fetching patients:', err);
        }
    }

    async function fetchDepartmentData() {
        //console.log("fethcing patients")
        try {
            const response = await fetch('/admin/api/getdepartments',{credentials:"include"})
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rows = await response.json();
            let ids = [];
            
            if (Array.isArray(rows)) {
                rows.forEach((row) => {
                    ids.push(row.DepartmentName);
                });
            }
            setDepNames(ids)
            setDepts(rows)
        } catch(err) {
            console.error('Error fetching patients:', err);
        }
    }

    useEffect(() => {
        fetchTableData() 
        fetchPatientData()
        fetchDepartmentData()
    }, [])

    useEffect(() => {
        getTop()
    }, [departments]);

    useEffect(() => {
        getTop()
    }, [records]);

    const columns = [
        {
            name: "ID",
            selector: (row) => row.Id,
            sortable: true
        },
        {
            name: "Patient",
            selector: (row) => row.PatFirst + " " + row.PatLast,
            sortable: true
        },
        {
            name: "Department",
            selector: (row) => row.DepartmentName,
            sortable: true
        },
        {
            name: "Due Date",
            selector: (row) => row.Date,
            sortable: true
        },
        {
            name: "Original Amount",
            selector: (row) => row.Amount,
            sortable: true
        },
        {
            name: "Late Fees",
            selector: (row) => row.Late,
            sortable: true
        },
        {
            name: "Total Due",
            selector: (row) => Number(row.Amount) + Number(row.Late),
            sortable: true
        }
    ];

    const getTop = async () => {
        //setBest(prev => ({ ...prev, [totalRevenue]: 0 }))
        const patinv = new Array(patIds.length).fill(0)
        const depinv = await new Array(depNames.length).fill(0)
        console.log("Cleared if not empty:",depinv)
        var index = 0
        var total = 0
        records.forEach((row) => {
            index = patIds.indexOf(row.PatID)
            if (index > -1) {
                patinv[index] += Number(row.Amount) + Number(row.Late)
            }
            index = depNames.indexOf(row.DepartmentName)
            if (index > -1) {
                depinv[index] += Number(row.Amount) + Number(row.Late)
            }
            total += Number(row.Amount) + Number(row.Late)

        })
        console.log("Cleared if not empty:",depinv)
        //console.log(patIds)
        const maxpat = (Math.max(...patinv) != '-Infinity' && Math.max(...patinv) != '0') ? Math.max(...patinv) : '0'
        index = patinv.indexOf(maxpat);
        const pat = index > -1 ? patients[index].FName+" "+patients[index].LName : "None Found"
        
        //console.log(depinv)
        const maxdep = (Math.max(...depinv) != '-Infinity' && Math.max(...depinv) != '0') ? Math.max(...depinv) : '0'
        index = depinv.indexOf(maxdep);
        const dep = index > -1 ? depNames[index] : "None Found"
        
        setBest(prev => ({ ...prev, totalInvoice: total }))
        setBest(prev => ({ ...prev, topPatient: pat }))
        setBest(prev => ({ ...prev, topPatInvoice: maxpat }))
        setBest(prev => ({ ...prev, topDepartment: dep }))
        setBest(prev => ({ ...prev, topDepInvoice: maxdep }))
    }

    const handleChange = (e) => {
        console.log(e.target.value)
        setRep(prev => ({ ...prev, [e.target.name]: e.target.value }));
        console.log(rep)
        handleFilters()
    };

    function handleFilterFirst(event) {
        setRecords(response.filter(row => row.PatFirst.toLowerCase().includes(event.target.value.toLowerCase())))
    }

    function handleFilterLast(event) {
        setRecords(response.filter(row => row.PatLast.toLowerCase().includes(event.target.value.toLowerCase())))
    }

    function handleFilterDep(event) {
        setRep(p => ({ ...p, [e.target.name]: e.target.value }))
        if (event.target.value.length > 0) {
            setRecords(response.filter(row => row.DepartmentName === (event.target.value)))
        }else {
            setRecords(response)
        }
    }

    function handleFilterMin(event) {
        setRep(p => ({ ...p, [e.target.name]: e.target.value }))
        if (event.target.value.length > 0) {
            setRecords(response.filter(row => row.Date >= event.target.value))
        }else {
            setRecords(response)
        }
    }

    function handleFilterMax(event) {
        setRep(p => ({ ...p, [e.target.name]: e.target.value }))
        if (event.target.value.length > 0) {
            setRecords(response.filter(row => row.Date <= event.target.value))
        }else {
            setRecords(response)
        }
    }

    function handleFilters(event) {
        setRecords(response)
        if (rep.DepartmentName.length > 0) {
            setRecords(records.filter(row => row.DepartmentName === (rep.DepartmentName)))
        }
        if (rep.min.length > 0) {
            setRecords(records.filter(row => row.Date >= rep.min.length))
        }
        if (rep.max.length > 0) {
            setRecords(records.filter(row => row.Date <= rep.max))
        }
        if (rep.PFirst.length > 0) {
            setRecords(records.filter(row => row.PatFirst.toLowerCase().includes(rep.PFirst.toLowerCase())))
        }
        if (rep.PLast.length > 0) {
            setRecords(records.filter(row => row.PatLast.toLowerCase().includes(rep.PLast.toLowerCase())))
        }
        getTop()
    }

    const handleClick = async e => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await fetch("/admin/api/pullrevenue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(rep)
            })
            const data = await response.json()
            setStuff(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    };

    const resetFilters = () => {
        setRep({
            DepartmentName: "",
            PFirst: "",
            PLast: "",
            min: "",
            max: ""
        })
    }

    const Reset = () => { 
        fetchTableData() 
        fetchDepartmentData()
        resetFilters()
        getTop()
    }

    return (
        <>
            <div style={filterCard}>
                <p style={sectionLabel}>Filters</p>
                <div style={filterRow}>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Department</label>
                    <select name="DepartmentName" value={rep.DepartmentName} onChange={handleChange} style={filterInput}>
                    <option value = "">Select</option>
                    {departments.map(d => (
                        <option key={d.DepartmentID} value={d.DepartmentName}>{d.DepartmentName}</option>
                    ))}
                    </select>
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Patient's First</label>
                    <input type="text" name="PFirst" value={rep.PFirst} onChange={handleChange} style={filterInput} />
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Patient's Last</label>
                    <input type="text" name="PLast" value={rep.PLast} onChange={handleChange} style={filterInput} />
                    </div>
                </div>
                <br />
                <div style={filterRow}>
                    <div style={filterGroup}>
                    <label style={filterLabel}>From</label>
                    <input type="date" name="min" value={rep.min} onChange={handleChange} style={filterInput} />
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>To</label>
                    <input type="date" name="max" value={rep.max} onChange={handleChange} style={filterInput} />
                    </div>
                    <div style={filterGroup}>
                        <button onClick={Reset}>Reset</button>
                    </div>
                </div>
            </div>
            <div style={filterCard}>
                <p style={sectionLabel}>Summary</p>
                <div style={filterGroup}>
                    <label style={filterLabel}>Total Invoice</label>
                    ${best.totalInvoice}
                </div>
                <div style={filterGroup}>
                    <label style={filterLabel}>Patient with the largest invoice</label>
                    {best.topPatient}: ${best.topPatInvoice}
                </div>
                <div style={filterGroup}>
                    <label style={filterLabel}>Department with the largest invoice</label>
                    {best.topDepartment}: ${best.topDepInvoice}
                </div>
            </div>
            <div className="report-table">
                <DataTable
                    title="General Revenue Report"
                    columns={columns}
                    data={records}
                    progressPending={loading}
                    fixedHeader />
            </div>
        </>
    );
};

export default InvoiceReport;