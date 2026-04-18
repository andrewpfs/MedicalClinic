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
            selector: (row) => row.Date != null ? String(row.Date).slice(0, 10) : "Not Posted",
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
        const newRep = { ...rep, [e.target.name]: e.target.value }
        setRep(newRep)
        applyFilters(newRep)
    };

    function applyFilters(f) {
        let result = response
        if (f.DepartmentName) {
            result = result.filter(row => row.DepartmentName === f.DepartmentName)
            const docs = doctors.filter(doc => doc.DepartmentName === f.DepartmentName)
            setDoctorList(docs)
        } else {
            setDoctorList(doctors)
        }
        if (f.DoctorLast)     result = result.filter(row => row.DocLast === f.DoctorLast)
        if (f.min)            result = result.filter(row => String(row.Date).slice(0, 10) >= f.min)
        if (f.max)            result = result.filter(row => String(row.Date).slice(0, 10) <= f.max)
        if (f.PFirst)         result = result.filter(row => row.PatFirst.toLowerCase().startsWith(f.PFirst.toLowerCase()))
        if (f.PLast)          result = result.filter(row => row.PatLast.toLowerCase().startsWith(f.PLast.toLowerCase()))
        if (f.status)         result = result.filter(row => row.Status === f.status)
        if (f.insure)         result = result.filter(row => String(row.Insurance) === String(f.insure))
        setRecords(result)
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

    const Reset = () => {
        fetchTableData()
        fetchDepartmentData()
        fetchDoctorData()
        const blank = { DepartmentName: "", PFirst: "", PLast: "", DoctorLast: "", min: "", max: "", status: "", insure: "" }
        setRep(blank)
        setRecords(response)
        setDoctorList(doctors)
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
                    <select name="DepartmentName" value={rep.DepartmentName} onChange={handleChange} style={filterInput}>
                    <option value="">Select</option>
                    {departments.map(d => (
                        <option key={d.DepartmentID} value={d.DepartmentName}>{d.DepartmentName}</option>
                    ))}
                    </select>
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Doctor</label>
                    <select name="DoctorLast" value={rep.DoctorLast} onChange={handleChange} style={filterInput}>
                    <option value="">Select</option>
                    {doctorList.map(d => (
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
                    <div style={filterGroup}>
                    <label style={filterLabel}>Insurance</label>
                    <select name="insure" value={rep.insure} onChange={handleChange} style={filterInput}>
                        <option value="">Select</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select>
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>Status</label>
                    <select name="status" value={rep.status} onChange={handleChange} style={filterInput}>
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
                    <input type="date" name="min" value={rep.min} onChange={handleChange} style={filterInput} />
                    </div>
                    <div style={filterGroup}>
                    <label style={filterLabel}>To</label>
                    <input type="date" name="max" value={rep.max} onChange={handleChange} style={filterInput} />
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
