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
    status: '',
    insure: '',
}

function RevenueReport() {
    const [response, setResponse] = useState([])
    const [records, setRecords] = useState([])
    const [departments, setDepts] = useState([])
    const [doctors, setDoctors] = useState([])
    const [doctorList, setDoctorList] = useState([])
    const [loading, setLoading] = useState(false)
    const [best, setBest] = useState({
        totalRevenue: 0,
        topDoctor: 'None Found',
        topDocRevenue: 0,
        topDepartment: 'None Found',
        topDepRevenue: 0,
    })
    const [rep, setRep] = useState(blankFilters)

    useEffect(() => {
        let cancelled = false

        async function loadReportData() {
            setLoading(true)
            try {
                const [revenueRes, departmentsRes, doctorsRes] = await Promise.all([
                    fetch(`${API}/admin/api/pullrevenue`, { credentials: 'include' }),
                    fetch(`${API}/admin/api/getdepartments`, { credentials: 'include' }),
                    fetch(`${API}/admin/api/getdeptdoctors`, { credentials: 'include' }),
                ])

                if (!revenueRes.ok || !departmentsRes.ok || !doctorsRes.ok) {
                    throw new Error('Failed to load revenue report data')
                }

                const [revenueRows, departmentRows, doctorRows] = await Promise.all([
                    revenueRes.json(),
                    departmentsRes.json(),
                    doctorsRes.json(),
                ])

                if (cancelled) return

                const safeRevenueRows = Array.isArray(revenueRows) ? revenueRows : []
                const safeDepartmentRows = Array.isArray(departmentRows) ? departmentRows : []
                const safeDoctorRows = Array.isArray(doctorRows) ? doctorRows : []

                setResponse(safeRevenueRows)
                setRecords(safeRevenueRows)
                setDepts(safeDepartmentRows)
                setDoctors(safeDoctorRows)
                setDoctorList(safeDoctorRows)
            } catch (err) {
                console.error('Error loading revenue report:', err)
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
        const revenueByDoctor = new Map(
            doctors.map(doc => [
                String(doc.EmployeeID),
                { name: `${doc.FirstName} ${doc.LastName}`, total: 0 },
            ])
        )
        const revenueByDepartment = new Map(
            departments.map(dep => [
                dep.DepartmentName,
                { name: dep.DepartmentName, total: 0 },
            ])
        )

        let totalRevenue = 0

        records.forEach(row => {
            const amount = Number(row.Amount) || 0
            totalRevenue += amount

            const doctor = revenueByDoctor.get(String(row.DocID))
            if (doctor) doctor.total += amount

            const department = revenueByDepartment.get(row.DepartmentName)
            if (department) department.total += amount
        })

        const topDoctor = [...revenueByDoctor.values()].sort((a, b) => b.total - a.total)[0]
        const topDepartment = [...revenueByDepartment.values()].sort((a, b) => b.total - a.total)[0]

        setBest({
            totalRevenue,
            topDoctor: topDoctor && topDoctor.total > 0 ? topDoctor.name : 'None Found',
            topDocRevenue: topDoctor?.total || 0,
            topDepartment: topDepartment && topDepartment.total > 0 ? topDepartment.name : 'None Found',
            topDepRevenue: topDepartment?.total || 0,
        })
    }, [records, doctors, departments])

    const columns = [
        { name: 'ID', selector: row => row.Id, sortable: true },
        { name: 'Patient', selector: row => `${row.PatFirst} ${row.PatLast}`, sortable: true },
        { name: 'Doctor', selector: row => `${row.DocFirst} ${row.DocLast}`, sortable: true },
        { name: 'Department', selector: row => row.DepartmentName, sortable: true },
        { name: 'Amount', selector: row => row.Amount, sortable: true },
        { name: 'Transaction Date', selector: row => row.Date != null ? String(row.Date).slice(0, 10) : 'Not Posted', sortable: true },
        { name: 'Insurance', selector: row => row.Insurance == 1 ? 'Yes' : 'No', sortable: true },
        { name: 'Status', selector: row => row.Status, sortable: true },
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
        if (filters.status) result = result.filter(row => row.Status === filters.status)
        if (filters.insure) result = result.filter(row => String(row.Insurance) === String(filters.insure))

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
                        <label style={filterLabel}>Insurance</label>
                        <select name="insure" value={rep.insure} onChange={handleChange} style={filterInput}>
                            <option value="">All</option>
                            <option value="1">Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>
                    <div style={filterGroup}>
                        <label style={filterLabel}>Status</label>
                        <select name="status" value={rep.status} onChange={handleChange} style={filterInput}>
                            <option value="">All</option>
                            <option value="Posted">Posted</option>
                            <option value="Pending">Pending</option>
                            <option value="Void">Void</option>
                        </select>
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
                    title="Revenue Report"
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

export default RevenueReport
