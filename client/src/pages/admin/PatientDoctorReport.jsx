import { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import { tableCustomStyles, filterCard, filterRow, filterGroup, filterLabel, filterInput, resetBtn, sectionLabel, statCardsRow, statCard, statCardAccent, statLabel, statLabelLight, statValue, statValueLight, statSub, statSubLight } from './adminStyles'

function PatientDoctorReport() {
    const [response, setResponse] = useState([])
    const [records, setRecords] = useState([])
    const [departments, setDepts] = useState([])
    const [doctors, setDoctors] = useState([])
    const [doctorList, setDoctorList] = useState([])
    const [loading, setLoading] = useState(false)
    const [best, setBest] = useState({
        totalVisits: 0,
        topDoctor: '',
        topDocVisits: 0,
        topPatient: '',
        topPatVisits: 0,
    })
    const [filters, setFilters] = useState({
        DepartmentName: '',
        DoctorLast: '',
        PFirst: '',
        PLast: '',
        min: '',
        max: '',
    })

    async function fetchTableData() {
        setLoading(true)
        try {
            const data = await fetch('/admin/api/pullpatientdoctor', { credentials: 'include' }).then(r => r.json())
            setResponse(data)
            setRecords(data)
        } catch(err) { console.error(err) }
        setLoading(false)
    }

    async function fetchDoctorData() {
        try {
            const rows = await fetch('/admin/api/getdeptdoctors', { credentials: 'include' }).then(r => r.json())
            setDoctors(rows)
            setDoctorList(rows)
        } catch(err) { console.error(err) }
    }

    async function fetchDepartmentData() {
        try {
            const rows = await fetch('/admin/api/getdepartments', { credentials: 'include' }).then(r => r.json())
            setDepts(rows)
        } catch(err) { console.error(err) }
    }

    useEffect(() => {
        fetchTableData()
        fetchDoctorData()
        fetchDepartmentData()
    }, [])

    useEffect(() => { calcStats(records) }, [records])

    function calcStats(data) {
        const docMap = {}
        const patMap = {}
        let total = 0
        data.forEach(row => {
            const docKey = row.DocID
            const patKey = row.PatientID
            docMap[docKey] = { name: `${row.DocFirst} ${row.DocLast}`, visits: (docMap[docKey]?.visits || 0) + Number(row.Visits) }
            patMap[patKey] = { name: `${row.PatFirst} ${row.PatLast}`, visits: (patMap[patKey]?.visits || 0) + Number(row.Visits) }
            total += Number(row.Visits)
        })
        const topDoc = Object.values(docMap).sort((a, b) => b.visits - a.visits)[0]
        const topPat = Object.values(patMap).sort((a, b) => b.visits - a.visits)[0]
        setBest({
            totalVisits: total,
            topDoctor: topDoc?.name || '—',
            topDocVisits: topDoc?.visits || 0,
            topPatient: topPat?.name || '—',
            topPatVisits: topPat?.visits || 0,
        })
    }

    const handleChange = (e) => {
        const newF = { ...filters, [e.target.name]: e.target.value }
        setFilters(newF)
        applyFilters(newF)
    }

    function applyFilters(f) {
        let result = response
        if (f.DepartmentName) {
            result = result.filter(row => row.DepartmentName === f.DepartmentName)
            setDoctorList(doctors.filter(d => d.DepartmentName === f.DepartmentName))
        } else {
            setDoctorList(doctors)
        }
        if (f.DoctorLast) result = result.filter(row => row.DocLast === f.DoctorLast)
        if (f.PFirst)     result = result.filter(row => row.PatFirst.toLowerCase().startsWith(f.PFirst.toLowerCase()))
        if (f.PLast)      result = result.filter(row => row.PatLast.toLowerCase().startsWith(f.PLast.toLowerCase()))
        if (f.min)        result = result.filter(row => row.LastVisit >= f.min)
        if (f.max)        result = result.filter(row => row.LastVisit <= f.max)
        setRecords(result)
    }

    const Reset = () => {
        const blank = { DepartmentName: '', DoctorLast: '', PFirst: '', PLast: '', min: '', max: '' }
        setFilters(blank)
        setRecords(response)
        setDoctorList(doctors)
    }

    const columns = [
        { name: 'Patient',      selector: row => `${row.PatFirst} ${row.PatLast}`, sortable: true },
        { name: 'Doctor',       selector: row => `${row.DocFirst} ${row.DocLast}`, sortable: true },
        { name: 'Department',   selector: row => row.DepartmentName, sortable: true },
        { name: 'Total Visits', selector: row => Number(row.Visits), sortable: true },
        { name: 'Last Visit',   selector: row => row.LastVisit, sortable: true },
    ]

    return (
        <>
            <div style={statCardsRow}>
                <div style={statCardAccent}>
                    <p style={statLabelLight}>Total Visits</p>
                    <p style={statValueLight}>{best.totalVisits.toLocaleString()}</p>
                    <p style={statSubLight}>Across all filtered records</p>
                </div>
                <div style={statCard}>
                    <p style={statLabel}>Most Active Doctor</p>
                    <p style={statValue}>{best.topDoctor}</p>
                    <p style={statSub}>{best.topDocVisits} visit{best.topDocVisits !== 1 ? 's' : ''}</p>
                </div>
                <div style={statCard}>
                    <p style={statLabel}>Most Frequent Patient</p>
                    <p style={statValue}>{best.topPatient}</p>
                    <p style={statSub}>{best.topPatVisits} visit{best.topPatVisits !== 1 ? 's' : ''}</p>
                </div>
            </div>

            <div style={filterCard}>
                <p style={sectionLabel}>Filters</p>
                <div style={filterRow}>
                    <div style={filterGroup}>
                        <label style={filterLabel}>Department</label>
                        <select name="DepartmentName" value={filters.DepartmentName} onChange={handleChange} style={filterInput}>
                            <option value="">Select</option>
                            {departments.map(d => (
                                <option key={d.DepartmentID} value={d.DepartmentName}>{d.DepartmentName}</option>
                            ))}
                        </select>
                    </div>
                    <div style={filterGroup}>
                        <label style={filterLabel}>Doctor</label>
                        <select name="DoctorLast" value={filters.DoctorLast} onChange={handleChange} style={filterInput}>
                            <option value="">Select</option>
                            {doctorList.map(d => (
                                <option key={d.EmployeeID} value={d.LastName}>{d.FirstName} {d.LastName}</option>
                            ))}
                        </select>
                    </div>
                    <div style={filterGroup}>
                        <label style={filterLabel}>Patient First</label>
                        <input type="text" name="PFirst" value={filters.PFirst} onChange={handleChange} style={filterInput} />
                    </div>
                    <div style={filterGroup}>
                        <label style={filterLabel}>Patient Last</label>
                        <input type="text" name="PLast" value={filters.PLast} onChange={handleChange} style={filterInput} />
                    </div>
                </div>
                <br />
                <div style={filterRow}>
                    <div style={filterGroup}>
                        <label style={filterLabel}>Last Visit From</label>
                        <input type="date" name="min" value={filters.min} onChange={handleChange} style={filterInput} />
                    </div>
                    <div style={filterGroup}>
                        <label style={filterLabel}>Last Visit To</label>
                        <input type="date" name="max" value={filters.max} onChange={handleChange} style={filterInput} />
                    </div>
                    <div style={filterGroup}>
                        <label style={filterLabel}>&nbsp;</label>
                        <button onClick={Reset} style={resetBtn}>Reset</button>
                    </div>
                </div>
            </div>

            <div className="report-table">
                <DataTable
                    title="Patient–Doctor Report"
                    columns={columns}
                    data={records}
                    progressPending={loading}
                    customStyles={tableCustomStyles}
                    pagination
                    fixedHeader
                />
            </div>
        </>
    )
}

export default PatientDoctorReport
