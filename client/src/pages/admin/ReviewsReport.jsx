import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import { tableCustomStyles, filterCard, filterRow, filterGroup, filterLabel, filterInput, primaryBtn, sectionLabel } from './adminStyles'

function ReviewsReport() {
    const [response, setResponse] = useState([])
    const [records, setRecords] = useState([])
    const [departments, setDepts]   = useState([])
    const [docIds, setDocIds] = useState([])
    const [doctors,setDoctors] = useState([])
    const [doctorList,setDoctorList] = useState([])
    const [loading, setLoading] = useState(false)
    const [filterCheck,setFilterCheck] = useState(true)
    const [best,setBest] = useState({
        avgReview: 0,
        topDoctor: "",
        avgDocReview: 0,
        topDepartment: "",
        avgDepReview: 0

    })
    const [rep,setRep] = useState({
        DepartmentName: "",
        PFirst: "",
        PLast: "",
        DoctorLast: "",
        min: "",
        max: ""
    })


    async function fetchTableData() {
        setLoading(true)
        try {
            const data = await fetch("/admin/api/pullreviews", {credentials : "include"}).then(res => res.json())
            setResponse(data)
            setRecords(data)
        }catch(err){
            console.error(err)
        }
        setLoading(false)
    }

    async function fetchOtherData() {
        try {
            const response = await fetch('/admin/api/getdeptdoctors')

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const rows = await response.json();
            const ids = [];
            
            if (Array.isArray(rows)) {
                rows.forEach((row) => {
                    ids.push(row.EmployeeID);
                });
            }
            
            setDocIds(ids)
            setDoctors(rows)
            setDoctorList(rows)
        } catch(err) {
            console.error('Error fetching doctors:', err);
            return [];
        }
    }

    useEffect(() => { 
        fetchTableData() 
        fetchDoctorData()
        getDepartments()
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
            name: "Rating",
            selector: (row) => row.Rating,
            sortable: true
        },
        {
            name: "Date Created",
            selector: (row) => row.Date,
            sortable: true
        },
    ];

    const getTop = () => {
        //setBest(prev => ({ ...prev, [totalRevenue]: 0 }))
        const docrev = new Array(docIds.length).fill(0)
        const docamount = new Array(docIds.length).fill(0)
        const deps = fetchDepartmentNames()
        const deprev = new Array(deps.length).fill(0)
        const depamount = new Array(deps.length).fill(0)
        var index = 0
        var total = 0
        var amount = records.length
        records.forEach((row) => {
            index = docIds.indexOf(row.DocID)
            if (index > -1) {
                docrev[index] += row.Rating
                docamount[index] ++
            }
            index = deps.indexOf(row.DepartmentName)
            if (index > -1) {
                deprev[index] += row.Rating
                depamount[index] ++
            }
            total += row.Amount

        })
        total = total / amount
        const maxdoc = Math.max(...docrev)
        index = docrev.indexOf(maxdoc);
        const doc = index > -1 ? doctorList[index].DocFirst+" "+doctorList[index].DocFirst : "None Found"
        const avgdoc = index > -1 ? maxdoc / docamount[index] : "None"
        
        const maxdep = Math.max(...deprev)
        index = deprev.indexOf(maxdep);
        const dep = index > -1 ? deps[index] : "None Found"
        const avgdep = index > -1 ? maxdep / depamount[index] : "None"
        
        setBest(prev => ({ ...prev, avgReview: total }))
        setBest(prev => ({ ...prev, topDoctor: doc }))
        setBest(prev => ({ ...prev, avgDocReview: avgdoc }))
        setBest(prev => ({ ...prev, topDepartment: dep }))
        setBest(prev => ({ ...prev, avgDepReview: avgdep }))
    }

    const fetchDoctorIDs = async () => {
        try {
            const response = await fetch(`/admin/api/getdepdoctors?DepartmentName=${encodeURIComponent(rep.DepartmentName)}`);
            
            // Add error handling for HTTP responses
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rows = await response.json();
            const ids = [];
            
            if (Array.isArray(rows)) {
                rows.forEach((row) => {
                    ids.push(row.EmployeeID);
                });
            }
            
            return ids;
        } catch(err) {
            console.error('Error fetching doctor IDs:', err);
            return [];
        }
    };

    const fetchDoctorNames = async () => {
        try { 
            const response = await fetch('/admin/api/getdepdoctors', {DepartmentName: rep.DepartmentName})
            const rows = await response.json()
            const ids = []
            if (Array.isArray(rows)) rows.forEach((row) => {
                ids.push(row.FirstName+" "+row.LastName)
            })
            return ids
        }catch(err) {
            console.error(err)
        }
    }

    const fetchDepartmentNames = async () => {
        try { 
            const rows = await fetch('/admin/api/getdepartments')
            const ids = []
            if (Array.isArray(rows)) rows.forEach((row) => {
                ids.push(row.DepartmentName)
            })
            return ids
        }catch(err) {
            console.error(err)
        }
    }

    const getDepartments = async () => {
        await fetch('/admin/api/getdepartments', { credentials: 'include' })
            .then(r => r.json())
            .then(d => setDepts(Array.isArray(d) ? d : []))
            .catch(console.error);
    }

    async function getDoctors() {
        const arr = []
        const docs = []
        await fetch('/admin/api/getdepdoctors', {DepartmentName: rep.DepartmentName})
            .then(r => r.json())
            .then(d => arr.concat(Array.isArray(d) ? d : []))
            .catch(console.error);
        arr.forEach((row) => {
            if (dep.length > 0) {
                if (row.DepartmentName == rep.DepartmentName) docs.push(row)
            }else docs.push(row)
        })

        setDoctors(docs)
    }

    const handleChange = (e) => {
        console.log(e.target.value)
        setRep(prev => ({ ...prev, [e.target.name]: e.target.value }));
        console.log(rep)
        handleFilters()
        console.log(rep)
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
        setRecords(response)
        if (rep.DepartmentName.length > 0) {
            setRecords(records.filter(row => row.DepartmentName === (rep.DepartmentName)))
            getDoctors()
        }
        if (rep.DoctorLast.length > 0) {
            setRecords(records.filter(row => row.DocLast === (rep.DoctorLast)))
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
            DoctorLast: "",
            min: "",
            max: ""
        })
    }

    const Reset = () => { 
        fetchTableData() 
        getDepartments()
        getDoctors("")
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
                    <label style={filterLabel}>Doctor</label>
                    <select name="DoctorLast" value={rep.DoctorLast} onChange={handleChange} style={filterInput}>
                    <option value = "">Select</option>
                    {doctors.map(d => (
                        <option key={d.EmployeeID} value={d.LastName}>{d.FirstName} {d.LastName}</option>
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

export default ReviewsReport;
