import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import { tableCustomStyles, filterCard, filterRow, filterGroup, filterLabel, filterInput, primaryBtn, resetBtn, sectionLabel, statCardsRow, statCard, statCardAccent, statLabel, statLabelLight, statValue, statValueLight, statSub, statSubLight, pageHeader, pageHeaderTitle, pageHeaderSub } from './adminStyles'

function ReviewsReport() {
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
        fetchDoctorData()
        fetchDepartmentData()
        //getTop()
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
        const deprev = new Array(depNames.length).fill(0)
        const depamount = new Array(depNames.length).fill(0)
        var index = 0
        var total = 0
        var amount = records.length
        records.forEach((row) => {
            index = docIds.indexOf(row.DocID)
            if (index > -1) {
                docrev[index] += Number(row.Rating)
                docamount[index] ++
            }
            index = depNames.indexOf(row.DepartmentName)
            if (index > -1) {
                deprev[index] += Number(row.Rating)
                depamount[index] ++
            }
            total += Number(row.Rating)

        })
        total = total / amount
        console.log(doctors)
        const maxdoc = (Math.max(...docrev) != '-Infinity' && Math.max(...docrev) != '0') ? Math.max(...docrev) : '0'
        index = docrev.indexOf(maxdoc);
        const doc = index > -1 ? doctors[index].FirstName+" "+doctors[index].LastName : "None Found"
        const avgdoc = index > -1 ? maxdoc / docamount[index] : "None"
        
        const maxdep = (Math.max(...deprev) != '-Infinity' && Math.max(...deprev) != '0') ? Math.max(...deprev) : '0'
        index = deprev.indexOf(maxdep);
        const dep = index > -1 ? depNames[index] : "None Found"
        const avgdep = index > -1 ? maxdep / depamount[index] : "None"
        
        setBest(prev => ({ ...prev, avgReview: total }))
        setBest(prev => ({ ...prev, topDoctor: doc }))
        setBest(prev => ({ ...prev, avgDocReview: avgdoc }))
        setBest(prev => ({ ...prev, topDepartment: dep }))
        setBest(prev => ({ ...prev, avgDepReview: avgdep }))
    }

    async function getDoctors() {
        const docs = []
        if (Array.isArray(doctors))doctors.forEach((doc) => {
            if (doc.DepartmentName === rep.DepartmentName) docs.push(doc)
        })

        setDoctorList(docs)
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
        fetchDoctorData()
        fetchDepartmentData()
        resetFilters()
        getTop()
    }

    return (
        <>
            <div style={statCardsRow}>
                <div style={statCardAccent}>
                    <p style={statLabelLight}>Overall Average Rating</p>
                    <p style={statValueLight}>{isNaN(best.avgReview) ? '—' : Number(best.avgReview).toFixed(2)} / 5</p>
                    <p style={statSubLight}>Across all filtered reviews</p>
                </div>
                <div style={statCard}>
                    <p style={statLabel}>Top Rated Doctor</p>
                    <p style={statValue}>{best.topDoctor}</p>
                    <p style={statSub}>{isNaN(best.avgDocReview) ? '—' : Number(best.avgDocReview).toFixed(2)} / 5 avg rating</p>
                </div>
                <div style={statCard}>
                    <p style={statLabel}>Top Rated Department</p>
                    <p style={statValue}>{best.topDepartment}</p>
                    <p style={statSub}>{isNaN(best.avgDepReview) ? '—' : Number(best.avgDepReview).toFixed(2)} / 5 avg rating</p>
                </div>
            </div>
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
                    title="Reviews Report"
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

export default ReviewsReport;
