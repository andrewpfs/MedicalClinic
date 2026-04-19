import { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import API from '../../api'
import {
    tableCustomStyles,
    filterCard,
    filterRow,
    filterGroup,
    filterLabel,
    filterInput,
    resetBtn,
    sectionLabel,
    statCardsRow,
    statCard,
    statCardAccent,
    statLabel,
    statLabelLight,
    statValue,
    statValueLight,
    statSub,
    statSubLight,
} from './adminStyles'

const blankFilters = {
    DepartmentName: '',
    PFirst: '',
    PLast: '',
    DoctorLast: '',
    min: '',
    max: '',
}

function ReviewsReport() {
    const [response, setResponse] = useState([])
    const [records, setRecords] = useState([])
    const [departments, setDepts] = useState([])
    const [doctors, setDoctors] = useState([])
    const [doctorList, setDoctorList] = useState([])
    const [loading, setLoading] = useState(false)
    const [best, setBest] = useState({
        avgReview: 0,
        topDoctor: 'None Found',
        avgDocReview: 0,
        topDepartment: 'None Found',
        avgDepReview: 0,
    })
    const [rep, setRep] = useState(blankFilters)

    useEffect(() => {
        let cancelled = false

        async function loadReportData() {
            setLoading(true)
            try {
                const [reviewsRes, departmentsRes, doctorsRes] = await Promise.all([
                    fetch(`${API}/admin/api/pullreviews`, { credentials: 'include' }),
                    fetch(`${API}/admin/api/getdepartments`, { credentials: 'include' }),
                    fetch(`${API}/admin/api/getdeptdoctors`, { credentials: 'include' }),
                ])

                if (!reviewsRes.ok || !departmentsRes.ok || !doctorsRes.ok) {
                    throw new Error('Failed to load reviews report data')
                }

                const [reviewRows, departmentRows, doctorRows] = await Promise.all([
                    reviewsRes.json(),
                    departmentsRes.json(),
                    doctorsRes.json(),
                ])

                if (cancelled) return

                const safeReviewRows = Array.isArray(reviewRows) ? reviewRows : []
                const safeDepartmentRows = Array.isArray(departmentRows) ? departmentRows : []
                const safeDoctorRows = Array.isArray(doctorRows) ? doctorRows : []

                setResponse(safeReviewRows)
                setRecords(safeReviewRows)
                setDepts(safeDepartmentRows)
                setDoctors(safeDoctorRows)
                setDoctorList(safeDoctorRows)
            } catch (err) {
                console.error('Error loading reviews report:', err)
                if (!cancelled) {
                    setResponse([])
                    setRecords([])
                    setDepts([])
                    setDoctors([])
                    setDoctorList([])
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        loadReportData()

        return () => {
            cancelled = true
        }
    }, [])

    useEffect(() => {
        const ratingsByDoctor = new Map(
            doctors.map(doc => [
                String(doc.EmployeeID),
                { name: `${doc.FirstName} ${doc.LastName}`, total: 0, count: 0 },
            ])
        )
        const ratingsByDepartment = new Map(
            departments.map(dep => [
                dep.DepartmentName,
                { name: dep.DepartmentName, total: 0, count: 0 },
            ])
        )

        let totalRating = 0

        records.forEach(row => {
            const rating = Number(row.Rating) || 0
            totalRating += rating

            const doctor = ratingsByDoctor.get(String(row.DocID))
            if (doctor) {
                doctor.total += rating
                doctor.count += 1
            }

            const department = ratingsByDepartment.get(row.DepartmentName)
            if (department) {
                department.total += rating
                department.count += 1
            }
        })

        const topDoctor = [...ratingsByDoctor.values()]
            .filter(doc => doc.count > 0)
            .sort((a, b) => (b.total / b.count) - (a.total / a.count))[0]
        const topDepartment = [...ratingsByDepartment.values()]
            .filter(dep => dep.count > 0)
            .sort((a, b) => (b.total / b.count) - (a.total / a.count))[0]

        setBest({
            avgReview: records.length ? totalRating / records.length : 0,
            topDoctor: topDoctor ? topDoctor.name : 'None Found',
            avgDocReview: topDoctor ? topDoctor.total / topDoctor.count : 0,
            topDepartment: topDepartment ? topDepartment.name : 'None Found',
            avgDepReview: topDepartment ? topDepartment.total / topDepartment.count : 0,
        })
    }, [records, doctors, departments])

    const columns = [
        { name: 'ID', selector: row => row.Id, sortable: true },
        { name: 'Patient', selector: row => `${row.PatFirst} ${row.PatLast}`, sortable: true },
        { name: 'Doctor', selector: row => `${row.DocFirst} ${row.DocLast}`, sortable: true },
        { name: 'Department', selector: row => row.DepartmentName, sortable: true },
        { name: 'Rating', selector: row => row.Rating, sortable: true },
        { name: 'Date Created', selector: row => row.Date != null ? String(row.Date).slice(0, 10) : 'Not Posted', sortable: true },
    ]

    const applyFilters = (filters) => {
        let result = response

        if (filters.DepartmentName) {
            result = result.filter(row => row.DepartmentName === filters.DepartmentName)
            setDoctorList(doctors.filter(doc => doc.DepartmentName === filters.DepartmentName))
        } else {
            setDoctorList(doctors)
        }

        if (filters.DoctorLast) result = result.filter(row => row.DocLast === filters.DoctorLast)
        if (filters.min) result = result.filter(row => String(row.Date).slice(0, 10) >= filters.min)
        if (filters.max) result = result.filter(row => String(row.Date).slice(0, 10) <= filters.max)
        if (filters.PFirst) result = result.filter(row => row.PatFirst.toLowerCase().startsWith(filters.PFirst.toLowerCase()))
        if (filters.PLast) result = result.filter(row => row.PatLast.toLowerCase().startsWith(filters.PLast.toLowerCase()))

        setRecords(result)
    }

    const handleChange = (e) => {
        const nextFilters = { ...rep, [e.target.name]: e.target.value }
        if (e.target.name === 'DepartmentName') nextFilters.DoctorLast = ''
        setRep(nextFilters)
        applyFilters(nextFilters)
    }

    const reset = () => {
        setRep(blankFilters)
        setRecords(response)
        setDoctorList(doctors)
    }

    return (
        <>
            <div style={statCardsRow}>
                <div style={statCardAccent}>
                    <p style={statLabelLight}>Overall Average Rating</p>
                    <p style={statValueLight}>{Number(best.avgReview).toFixed(2)} / 5</p>
                    <p style={statSubLight}>Across all filtered reviews</p>
                </div>
                <div style={statCard}>
                    <p style={statLabel}>Top Rated Doctor</p>
                    <p style={statValue}>{best.topDoctor}</p>
                    <p style={statSub}>{Number(best.avgDocReview).toFixed(2)} / 5 avg rating</p>
                </div>
                <div style={statCard}>
                    <p style={statLabel}>Top Rated Department</p>
                    <p style={statValue}>{best.topDepartment}</p>
                    <p style={statSub}>{Number(best.avgDepReview).toFixed(2)} / 5 avg rating</p>
                </div>
            </div>

            <div style={filterCard}>
                <p style={sectionLabel}>Filters</p>
                <div style={filterRow}>
                    <div style={filterGroup}>
                        <label style={filterLabel}>Department</label>
                        <select name="DepartmentName" value={rep.DepartmentName} onChange={handleChange} style={filterInput}>
                            <option value="">All Departments</option>
                            {departments.map(d => (
                                <option key={d.DepartmentID} value={d.DepartmentName}>{d.DepartmentName}</option>
                            ))}
                        </select>
                    </div>
                    <div style={filterGroup}>
                        <label style={filterLabel}>Doctor</label>
                        <select name="DoctorLast" value={rep.DoctorLast} onChange={handleChange} style={filterInput}>
                            <option value="">All Doctors</option>
                            {doctorList.map(d => (
                                <option key={d.EmployeeID} value={d.LastName}>{d.FirstName} {d.LastName}</option>
                            ))}
                        </select>
                    </div>
                    <div style={filterGroup}>
                        <label style={filterLabel}>Patient First</label>
                        <input type="text" name="PFirst" value={rep.PFirst} onChange={handleChange} style={filterInput} />
                    </div>
                    <div style={filterGroup}>
                        <label style={filterLabel}>Patient Last</label>
                        <input type="text" name="PLast" value={rep.PLast} onChange={handleChange} style={filterInput} />
                    </div>
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
                        <button type="button" onClick={reset} style={resetBtn}>Reset</button>
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
                    fixedHeader
                />
            </div>
        </>
    )
}

export default ReviewsReport
