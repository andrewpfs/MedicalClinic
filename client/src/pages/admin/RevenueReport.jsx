import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import { tableCustomStyles, filterCard, filterRow, filterGroup, filterLabel, filterInput, primaryBtn, resetBtn, sectionLabel, statCardsRow, statCard, statCardAccent, statLabel, statLabelLight, statValue, statValueLight, statSub, statSubLight, pageHeader, pageHeaderTitle, pageHeaderSub } from './adminStyles'

function RevenueReport() {
    const [response, setResponse] = useState([])
    const [records, setRecords] = useState([])
    const [departments, setDepts]   = useState([])
    const [depNames,setDepNames] = useState([])
    const [docIds, setDocIds] = useState([])
    const [doctors,setDoctors] = useState([])
    const [doctorList,setDoctorList] = useState([])
    const [loading, setLoading] = useState(false)
    const [filterCheck,setFilterCheck] = useState(true)
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
        status: "",
        insure: ""
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

    async function fetchDoctorData() {
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
        fetchDepartmentData()
        fetchDoctorData()
        getTop()
    }, [])

    useEffect(() => {
        getTop()
    },[doctors])

    useEffect(() => {
        getTop()
    },[records])

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
        {
            name: "Insurance",
            selector: (row) => row.Insurance == 1 ? 'Yes' : 'No',
            sortable: true
        },
        {
            name: "Status",
            selector: (row) => row.Status,
            sortable: true
        }
    ];

    const getTop = () => {
        //setBest(prev => ({ ...prev, [totalRevenue]: 0 }))
        const docrev = new Array(docIds.length).fill(0)
        const deprev = new Array(depNames.length).fill(0)
        var index = 0
        var total = 0
        records.forEach((row) => {
            index = docIds.indexOf(row.DocID)
            docrev[index] += Number(row.Amount)
            index = depNames.indexOf(row.DepartmentName)
            deprev[index] += Number(row.Amount)
            total += Number(row.Amount)
        })
        const maxdoc = (Math.max(...docrev) != '-Infinity' && Math.max(...docrev) != '0') ? Math.max(...docrev) : '0'
        index = docrev.indexOf(maxdoc);
        const doc = index > -1 ? doctors[index].FirstName+" "+doctors[index].LastName : "None Found"
        const maxdep = (Math.max(...deprev) != '-Infinity' && Math.max(...deprev) != '0') ? Math.max(...deprev) : '0'
        index = deprev.indexOf(maxdep);
        const dep = index > -1 ? depNames[index] : "None Found"
        setBest(prev => ({ ...prev, totalRevenue: total }))
        setBest(prev => ({ ...prev, topDoctor: doc }))
        setBest(prev => ({ ...prev, topDocRevenue: maxdoc }))
        setBest(prev => ({ ...prev, topDepartment: dep }))
        setBest(prev => ({ ...prev, topDepRevenue: maxdep }))
    }

    async function getDoctors() {
        const docs = []
        if (Array.isArray(doctors))doctors.forEach((doc) => {
            if (doc.DepartmentName === rep.DepartmentName) docs.push(doc)
        })

        setDoctorList(docs)
    }

    const handleChange = (e) => {
        setRep(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
        if (rep.status.length > 0) {
            setRecords(records.filter(row => row.Status == (rep.status)))
        }
        if (rep.insure.length > 0) {
            setRecords(records.filter(row => row.Insurance == (rep.insure)))
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
        setRep({ DepartmentName: "", PFirst: "", PLast: "", DoctorLast: "", min: "", max: "", status: "", insure: "" })
        setRecords(response)
        setDoctorList(doctors)
    }

    const Reset = () => {
        fetchTableData()
        fetchDepartmentData()
        fetchDoctorData()
        resetFilters()
    }

    return (
        <>
            <div style={statCardsRow}>
                <div style={statCardAccent}>
                    <p style={statLabelLight}>Total Revenue</p>
                    <p style={statValueLight}>${Number(best.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p style={statSubLight}>Across all filtered records</p>
                </div>
                <div style={statCard}>
                    <p style={statLabel}>Top Doctor</p>
                    <p style={statValue}>{best.topDoctor}</p>
                    <p style={statSub}>${Number(best.topDocRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in revenue</p>
                </div>
                <div style={statCard}>
                    <p style={statLabel}>Top Department</p>
                    <p style={statValue}>{best.topDepartment}</p>
                    <p style={statSub}>${Number(best.topDepRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in revenue</p>
                </div>
            </div>
            <div style={filterCard}>
                <p style={sectionLabel}>Filters</p>
                <div style={filterRow}>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Department</label>
                    <select name="DepartmentName" onChange={handleChange} style={filterInput}>
                    <option value = "">Select</option>
                    {departments.map(d => (
                        <option key={d.DepartmentID} value={d.DepartmentName}>{d.DepartmentName}</option>
                    ))}
                    </select>
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Doctor</label>
                    <select name="DoctorLast" onChange={handleChange} style={filterInput}>
                    <option value = "">Select</option>
                    {doctorList.map(d => (
                        <option key={d.EmployeeID} value={d.LastName}>{d.FirstName} {d.LastName}</option>
                    ))}
                    </select>
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Patient's First</label>
                    <input type="text" name="PFirst" onChange={handleChange} style={filterInput} />
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Patient's Last</label>
                    <input type="text" name="PLast" onChange={handleChange} style={filterInput} />
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Insurance</label>
                    <select name="insure" onChange={handleChange} style={filterInput}>
                        <option value="">Select</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select>
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Status</label>
                    <select name="status" onChange={handleChange} style={filterInput}>
                        <option value="">Select</option>
                        <option value="Posted">Posted</option>
                        <option value="Pending">Pending</option>
                        <option value="Void">Void</option>
                    </select>
                    </div>
                </div>
                <br />
                <div style={filterRow}>
                    <div style={filterGroup}>
                    <label style={filterLabel}>From</label>
                    <input type="date" name="min" onChange={handleChange} style={filterInput} />
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>To</label>
                    <input type="date" name="max" onChange={handleChange} style={filterInput} />
                    </div>
                    <div style={filterGroup}>
                        <label style={filterLabel}>&nbsp;</label>
                        <button onClick={Reset} style={resetBtn}>Reset</button>
                    </div>
                </div>
                </div>
            <div className="report-table">
                <DataTable
                    title="Revenue Report"
                    columns={columns}
                    data={records}
                    progressPending={loading}
                    customStyles={tableCustomStyles}
                    pagination
                    fixedHeader />
            </div>
        </>
    );
};

export default RevenueReport;
