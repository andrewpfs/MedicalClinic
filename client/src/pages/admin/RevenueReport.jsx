import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import { tableCustomStyles, filterCard, filterRow, filterGroup, filterLabel, filterInput, primaryBtn, sectionLabel } from './adminStyles'

function RevenueReport() {
    const [response, setResponse] = useState([])
    const [records, setRecords] = useState([])
    const [departments, setDepts]   = useState([])
    const [doctors,setDoctors] = useState([])
    const [loading, setLoading] = useState(false)
    const [best,setBest] = useState({
        totalRevenue: 0,
        topDoctor: "",
        topDocRevenue: 0,
        topDepartment: "",
        topDepRevenue: 0

    })
    const [rep,setRep] = useState({
        DepartmentName: "",
        PFirst: "",
        PLast: "",
        DoctorLast: "",
        min: "",
        max: "",
    })


    async function fetchTableData() {
        setLoading(true)
        try {
            const data = await fetch("/admin/api/pullrevenue", {credentials : "include"}).then(res => res.json())
            setResponse(data)
            setRecords(data)
        }catch(err){
            console.error(err)
        }
        setLoading(false)
    }

    useEffect(() => { 
        fetchTableData() 
        getDepartments()
        getDoctors("")
        getTop()
    }, [])

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
            name: "Doctor",
            selector: (row) => row.DocFirst + " " + row.DocLast,
            sortable: true
        },
        {
            name: "Department",
            selector: (row) => row.DepartmentName,
            sortable: true
        },
        {
            name: "Amount",
            selector: (row) => row.Amount,
            sortable: true
        },
        {
            name: "Transaction Date",
            selector: (row) => row.Date,
            sortable: true
        },
    ];

    const getTop = () => {
        //setBest(prev => ({ ...prev, [totalRevenue]: 0 }))
        const ids = fetchDoctorIDs()
        const docs = fetchDoctorNames()
        const docrev = new Array(docs.length).fill(0)
        const deps = fetchDepartmentNames()
        const deprev = new Array(deps.length).fill(0)
        var index = 0
        var total = 0
        records.forEach((row) => {
            index = ids.indexOf(row.DocID)
            docrev[index] += row.Amount
            index = deps.indexOf(row.DepartmentName)
            deprev[index] += row.Amount
            total += row.Amount

        })
        const maxdoc = Math.max(...docrev)
        index = docrev.indexOf(maxdoc);
        const doc = index > -1 ? docs[index] : "None Found"
        const maxdep = Math.max(...deprev)
        index = deprev.indexOf(maxdep);
        const dep = index > -1 ? deps[index] : "None Found"
        setBest(prev => ({ ...prev, [best.totalRevenue]: total }))
        setBest(prev => ({ ...prev, [best.topDoctor]: doc }))
        setBest(prev => ({ ...prev, [best.topDocRevenue]: maxdoc }))
        setBest(prev => ({ ...prev, [best.topDepartment]: dep }))
        setBest(prev => ({ ...prev, [best.topDepRevenue]: maxdep }))
    }

    const fetchDoctorIDs = async => {
        try { 
            const rows = fetch('/admin/api/getdepdoctors', {DepartmentName: rep.DepartmentName})
            const ids = []
            if (Array.isArray(rows)) rows.forEach((row) => {
                ids.push(row.EmployeeID)
            })
            return ids
        }catch(err) {
            console.error(err)
        }
    }
    const fetchDoctorNames = async => {
        try { 
            const rows = fetch('/admin/api/getdepdoctors', {DepartmentName: rep.DepartmentName})
            const ids = []
            if (Array.isArray(rows)) rows.forEach((row) => {
                ids.push(row.FirstName+" "+row.LastName)
            })
            return ids
        }catch(err) {
            console.error(err)
        }
    }

    const fetchDepartmentNames = async => {
        try { 
            const rows = fetch('/admin/api/getdepartments')
            const ids = []
            if (Array.isArray(rows)) rows.forEach((row) => {
                ids.push(row.DepartmentName)
            })
            return ids
        }catch(err) {
            console.error(err)
        }
    }

    const getDepartments = async => {
        fetch('/admin/api/getdepartments', { credentials: 'include' })
            .then(r => r.json())
            .then(d => setDepts(Array.isArray(d) ? d : []))
            .catch(console.error);
    }

    async function getDoctors() {
        const arr = []
        const docs = []
        fetch('/admin/api/getdepdoctors', {DepartmentName: rep.DepartmentName})
            .then(r => r.json())
            .then(d => arr.concat(Array.isArray(d) ? d : []))
            .catch(console.error);
        arr.forEach((row) => {
            if (dep.length > 0) {
                if (row.DepartmentName == dep) docs.push(row)
            }else docs.push(row)
        })

        setDoctors(docs)
    }

    const handleChange = (e) => {
        setRep(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
            getDoctors(event.target.value)
        }else {
            setRecords(response)
        }
    }

    function handleFilterDoc(event) {
        setRep(p => ({ ...p, [e.target.name]: e.target.value }))
        if (event.target.value.length > 0) {
            setRecords(response.filter(row => row.DocLast === (event.target.value)))
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
        var check = true
        if (rep.DepartmentName.length > 0) {
            check ? setRecords(response.filter(row => row.DepartmentName === (rep.DepartmentName))) : setRecords(records.filter(row => row.DepartmentName === (event.target.value)))
            check = false
            getDoctors()
        }
        if (rep.DoctorLast.length > 0) {
            check ? setRecords(response.filter(row => row.DocLast === (rep.DoctorLast))) : setRecords(records.filter(row => row.DocLast === (rep.DoctorLast)))
            check = false
        }
        if (rep.min.length > 0) {
            check ? setRecords(response.filter(row => row.Date >= rep.min.length)) : setRecords(records.filter(row => row.Date >= rep.min.length))
            check = false
        }
        if (rep.max.length > 0) {
            check ? setRecords(response.filter(row => row.Date <= rep.max)) : setRecords(records.filter(row => row.Date <= rep.max))
            check = false
        }
        if (rep.PFirst.length > 0) {
            check ? setRecords(response.filter(row => row.PatFirst.toLowerCase().includes(rep.PFirst.toLowerCase()))) : setRecords(records.filter(row => row.PatFirst.toLowerCase().includes(rep.PFirst.toLowerCase())))
            check = false
        }
        if (rep.PLast.length > 0) {
            check ? setRecords(response.filter(row => row.PatLast.toLowerCase().includes(rep.PLast.toLowerCase()))) : setRecords(records.filter(row => row.PatLast.toLowerCase().includes(rep.PLast.toLowerCase())))
            check = false
        }
        if (check) setRecords(response)
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

    return (
        <>
            <div style={filterCard}>
                <p style={sectionLabel}>Filters</p>
                <div style={filterRow}>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Department</label>
                    <select name="DepartmentName" onChange={handleChange,handleFilters} style={filterInput}>
                    <option value = "">Select</option>
                    {departments.map(d => (
                        <option key={d.DepartmentID} value={d.DepartmentName}>{d.DepartmentName}</option>
                    ))}
                    </select>
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Doctor</label>
                    <select name="DoctorLast" onChange={handleChange,handleFilters} style={filterInput}>
                    <option value = "">Select</option>
                    {doctors.map(d => (
                        <option key={d.EmployeeID} value={d.LastName}>{d.FirstName} {d.LastName}</option>
                    ))}
                    </select>
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Patient's First</label>
                    <input type="text" name="PFirst" onChange={handleChange,handleFilters} style={filterInput} />
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Patient's Last</label>
                    <input type="text" name="PLast" onChange={handleChange,handleFilters} style={filterInput} />
                    </div>
                </div>
                <br />
                <div style={filterRow}>
                    <div style={filterGroup}>
                    <label style={filterLabel}>From</label>
                    <input type="date" name="min" onChange={handleChange,handleFilters} style={filterInput} />
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>To</label>
                    <input type="date" name="max" onChange={handleChange,handleFilters} style={filterInput} />
                    </div>
                </div>
                </div>
            <div style={filterCard}>
                <p style={sectionLabel}>Summary</p>
                <div style={filterGroup}>
                    <label style={filterLabel}>Total Revenue</label>
                    {best.totalRevenue}
                </div>
                <div style={filterGroup}>
                    <label style={filterLabel}>Top Doctor</label>
                    {best.topDoctor}: {best.topDocRevenue}
                </div>
                <div style={filterGroup}>
                    <label style={filterLabel}>Top Department</label>
                    {best.topDepartment}: {best.topDepRevenue}
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

export default RevenueReport;
