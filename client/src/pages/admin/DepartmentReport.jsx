import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'
import { tableCustomStyles, filterCard, filterRow, filterGroup, filterLabel, filterInput, primaryBtn, resetBtn, sectionLabel, statCardsRow, statCard, statCardAccent, statLabel, statLabelLight, statValue, statValueLight, statSub, statSubLight, pageHeader, pageHeaderTitle, pageHeaderSub } from './adminStyles'

function DepartmentReport() {
    const [response, setResponse] = useState([])
    const [revenue, setRevenue] = useState([])
    const [reviews, setReviews] = useState([])
    const [records, setRecords] = useState([])
    const [revenueRecords, setRevenueRecords] = useState([])
    const [reviewRecords, setReviewRecords] = useState([])
    const [departments, setDepts]   = useState([])
    const [depIds, setDepIds] = useState([])
    const [doctorList,setDoctorList] = useState([])
    const [loading, setLoading] = useState(false)
    const [filterCheck,setFilterCheck] = useState(true)
    const [best,setBest] = useState({
        topRevenue: "",
        topDepartmentRevenue: "",
        RevenuePerc: "",
        topReviews: "",
        topDepartmentReviews: "",

    })
    const [rep,setRep] = useState({
        min: "",
        max: "",
        status: "",
        insure: "",
        showReviewRevenue: "Both"
    })


    async function fetchRevenueData() {
        setLoading(true)
        try {
            const data = await fetch("/admin/api/pullrevenue", {credentials : "include"}).then(res => res.json())
            setRevenue(data)
            setRevenueRecords(data)
        }catch(err){
            console.error(err)
        }
        setLoading(false)
    }

    async function fetchReviewData() {
        setLoading(true)
        try {
            const data = await fetch("/admin/api/pullreviews", {credentials : "include"}).then(res => res.json())
            setReviews(data)
            setReviewRecords(data)
        }catch(err){
            console.error(err)
        }
        setLoading(false)
    } 

    async function fetchTableData() {
        //console.log("fethcing patients")
        try {
            const response = await fetch('/admin/api/getdepartmentinfo',{credentials:"include"})
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const rows = await response.json();
            let deps = [];
            let ids = [];
            
            if (Array.isArray(rows)) {
                rows.forEach((row) => {
                    deps.push({
                        DepartmentID: row.DepartmentID,
                        DepartmentName: row.DepartmentName,
                        OfficeName: row.OfficeName,
                        Employees: row.Employees,
                        Revenue: "",
                        Reviews: "",
                        Percent: ""
                    });
                    ids.push(row.DepartmentID)
                });
            }
            setResponse(rows)
            setRecords(deps)
            setDepIds(ids)
        } catch(err) {
            console.error('Error fetching patients:', err);
        }
    }

    function getRevenueDepartment() {
        let departs = []
        let total = 0
        const deprev = new Array(depIds.length).fill(0)
        if (Array.isArray(revenueRecords)) revenueRecords.forEach(row => {
            total += Number(row.Amount)
            if (Array.isArray(response)) response.forEach(dep => {
                if (dep.DepartmentID === row.DepartmentID) deprev[depIds.indexOf(dep.DepartmentID)] += Number(row.Amount)
            })
        })
        for (let i = 0; i < depIds.length; i++) {
            departs.push({
                DepartmentID: records[i].DepartmentID,
                DepartmentName: records[i].DepartmentName,
                OfficeName: records[i].OfficeName,
                Employees: records[i].Employees,
                Revenue: deprev[i],
                Reviews: records[i].Reviews,
                Percent: deprev[i] / total * 100
            })
        }

        setRecords(departs)
    }

    function getReviewDepartment() {
        let departs = []
        const deprev = new Array(depIds.length).fill(0)
        const depamount = new Array(depIds.length).fill(0)
        if (Array.isArray(revenueRecords)) revenueRecords.forEach(row => {
            if (Array.isArray(response)) response.forEach(dep => {
                if (dep.DepartmentID === row.DepartmentID) {
                    deprev[depIds.indexOf(dep.DepartmentID)] += Number(row.Rating)
                    depamount[depIds.indexOf(dep.DepartmentID)] ++
                }
            })
        })
        for (let i = 0; i < depIds.length; i++) {
            const review = depamount[i] > 0 ? String(deprev[i] / depamount[i]) : "None Found"
            departs.push({
                DepartmentID: records[i].DepartmentID,
                DepartmentName: records[i].DepartmentName,
                OfficeName: records[i].OfficeName,
                Employees: records[i].Employees,
                Revenue: records[i].Revenue,
                Reviews: review,
                Percent: records[i].Percent
            })
        }

        setRecords(departs)
    }

    useEffect(() => { 
        fetchTableData() 
        fetchRevenueData()
        fetchReviewData()
        getTop()
    }, [])

    useEffect(() => {
        getRevenueDepartment()
        getReviewDepartment()
        getTop()
    },[revenueRecords])

    useEffect(() => {
        getTop()
    },[rep])

    const columnsDep = [
        {
            name: "Department",
            selector: (row) => row.DepartmentName,
            sortable: true
        },
        {
            name: "Office",
            selector: (row) => row.OfficeName,
            sortable: true
        },
        {
            name: "# of Employees",
            selector: (row) => row.Employees,
            sortable: true
        },
        {
            name: "Revenue",
            selector: (row) => row.Revenue,
            sortable: true
        },
        {
            name: "Percent of Revenue",
            selector: (row) => row.Percent,
            sortable: true
        },
        {
            name: "Reviews",
            selector: (row) => row.Reviews,
            sortable: true
        }
    ];

    const columnsReview = [
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
            selector: (row) => String(row.Date).slice(0, 10),
            sortable: true
        },
    ];

    const columnsRevenue = [
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
        /*const deprevenue = new Array(depNames.length).fill(0)
        const depreviews = new Array(depNames.length).fill(0)
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
        setBest(prev => ({ ...prev, topDepRevenue: maxdep }))*/
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

    return (
        <>
            <div style={statCardsRow}>
                <div style={statCardAccent}>
                    <p style={statLabelLight}>{best.topDepartmentRevenue} made</p>
                    <p style={statValueLight}>${Number(best.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p style={statSubLight}>Of All Revenue</p>
                </div>
                <div style={statCard}>
                    <p style={statLabel}>Top Revenue</p>
                    <p style={statValue}>{best.topDepartmentRevenue}</p>
                    <p style={statSub}>${Number(best.topRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} in revenue</p>
                </div>
                <div style={statCard}>
                    <p style={statLabel}>Top Reviews</p>
                    <p style={statValue}>{best.topDepartmentReviews}</p>
                    <p style={statSub}>{isNaN(best.topReviews) ? '—' : Number(best.topReviews).toFixed(2)} / 5 avg rating</p>
                </div>
            </div>
            <div style={filterCard}>
                <p style={sectionLabel}>Filters</p>
                <div style={filterRow}>
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
                </div>
                </div>
            <div className="report-table">
                <DataTable
                    title="Department Report"
                    columns={columnsDep}
                    data={records}
                    progressPending={loading}
                    customStyles={tableCustomStyles}
                    pagination
                    fixedHeader />
            </div>
            <div className="report-table">
                <DataTable
                    title="Transactions"
                    columns={columnsRevenue}
                    data={revenueRecords}
                    progressPending={loading}
                    customStyles={tableCustomStyles}
                    pagination
                    fixedHeader />
            </div>
            <div className="report-table">
                <DataTable
                    title="Reviews"
                    columns={columnsReview}
                    data={reviewRecords}
                    progressPending={loading}
                    customStyles={tableCustomStyles}
                    pagination
                    fixedHeader />
            </div>
        </>
    );
};

export default DepartmentReport;
