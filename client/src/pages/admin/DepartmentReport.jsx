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
    PFirst: '',
    PLast: '',
    min: '',
    max: '',
    status: '',
    insure: '',
}

const currency = (value) => `$${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
})}`

const percent = (value) => `${Number(value || 0).toFixed(1)}%`
const rating = (value) => value == null ? 'No reviews' : `${Number(value).toFixed(2)} / 5`

function DepartmentReport() {
    const [departments, setDepartments] = useState([])
    const [revenue, setRevenue] = useState([])
    const [reviews, setReviews] = useState([])
    const [records, setRecords] = useState([])
    const [revenueRecords, setRevenueRecords] = useState([])
    const [reviewRecords, setReviewRecords] = useState([])
    const [loading, setLoading] = useState(false)
    const [best, setBest] = useState({
        totalRevenue: 0,
        topRevenue: 0,
        topDepartmentRevenue: 'None Found',
        topReviews: null,
        topDepartmentReviews: 'None Found',
    })
    const [rep, setRep] = useState(blankFilters)

    useEffect(() => {
        let cancelled = false

        async function loadReportData() {
            setLoading(true)
            try {
                const [departmentRes, revenueRes, reviewRes] = await Promise.all([
                    fetch(`${API}/admin/api/getdepartmentinfo`, { credentials: 'include' }),
                    fetch(`${API}/admin/api/pullrevenue`, { credentials: 'include' }),
                    fetch(`${API}/admin/api/pullreviews`, { credentials: 'include' }),
                ])

                if (!departmentRes.ok || !revenueRes.ok || !reviewRes.ok) {
                    throw new Error('Failed to load department report data')
                }

                const [departmentRows, revenueRows, reviewRows] = await Promise.all([
                    departmentRes.json(),
                    revenueRes.json(),
                    reviewRes.json(),
                ])

                if (cancelled) return

                const safeDepartments = Array.isArray(departmentRows) ? departmentRows : []
                const safeRevenue = Array.isArray(revenueRows) ? revenueRows : []
                const safeReviews = Array.isArray(reviewRows) ? reviewRows : []

                setDepartments(safeDepartments)
                setRevenue(safeRevenue)
                setReviews(safeReviews)
                setRevenueRecords(safeRevenue)
                setReviewRecords(safeReviews)
            } catch (err) {
                console.error('Error loading department report:', err)
                if (!cancelled) {
                    setDepartments([])
                    setRevenue([])
                    setReviews([])
                    setRevenueRecords([])
                    setReviewRecords([])
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
        const summary = new Map(
            departments.map(dep => [
                String(dep.DepartmentID),
                {
                    DepartmentID: dep.DepartmentID,
                    DepartmentName: dep.DepartmentName,
                    Employees: dep.Employees,
                    Revenue: 0,
                    Percent: 0,
                    Reviews: null,
                    reviewTotal: 0,
                    reviewCount: 0,
                },
            ])
        )

        let totalRevenue = 0

        revenueRecords.forEach(row => {
            const amount = Number(row.Amount) || 0
            const department = summary.get(String(row.DepartmentID))
            totalRevenue += amount
            if (department) department.Revenue += amount
        })

        reviewRecords.forEach(row => {
            const ratingValue = Number(row.Rating)
            const department = summary.get(String(row.DepartmentID))
            if (department && !Number.isNaN(ratingValue)) {
                department.reviewTotal += ratingValue
                department.reviewCount += 1
            }
        })

        const nextRecords = [...summary.values()].map(dep => ({
            ...dep,
            Percent: totalRevenue > 0 ? (dep.Revenue / totalRevenue) * 100 : 0,
            Reviews: dep.reviewCount > 0 ? dep.reviewTotal / dep.reviewCount : null,
        }))

        const topRevenue = [...nextRecords].sort((a, b) => b.Revenue - a.Revenue)[0]
        const topReviews = [...nextRecords]
            .filter(dep => dep.Reviews != null)
            .sort((a, b) => b.Reviews - a.Reviews)[0]

        setRecords(nextRecords)
        setBest({
            totalRevenue,
            topRevenue: topRevenue?.Revenue || 0,
            topDepartmentRevenue: topRevenue && topRevenue.Revenue > 0 ? topRevenue.DepartmentName : 'None Found',
            topReviews: topReviews?.Reviews ?? null,
            topDepartmentReviews: topReviews ? topReviews.DepartmentName : 'None Found',
        })
    }, [departments, revenueRecords, reviewRecords])

    const columnsDep = [
        { name: 'Department', selector: row => row.DepartmentName, sortable: true, grow: 2 },
        { name: '# of Employees', selector: row => row.Employees, sortable: true },
        { name: 'Revenue', selector: row => currency(row.Revenue), sortable: true },
        { name: 'Percent of Revenue', selector: row => percent(row.Percent), sortable: true },
        { name: 'Avg Reviews', selector: row => rating(row.Reviews), sortable: true },
    ]

    const columnsReview = [
        { name: 'ID', selector: row => row.Id, sortable: true },
        { name: 'Patient', selector: row => `${row.PatFirst} ${row.PatLast}`, sortable: true, grow: 2 },
        { name: 'Doctor', selector: row => `${row.DocFirst} ${row.DocLast}`, sortable: true, grow: 2 },
        { name: 'Department', selector: row => row.DepartmentName, sortable: true, grow: 2 },
        { name: 'Rating', selector: row => row.Rating, sortable: true },
        { name: 'Date Created', selector: row => row.Date != null ? String(row.Date).slice(0, 10) : 'Not Posted', sortable: true },
    ]

    const columnsRevenue = [
        { name: 'ID', selector: row => row.Id, sortable: true },
        { name: 'Patient', selector: row => `${row.PatFirst} ${row.PatLast}`, sortable: true, grow: 2 },
        { name: 'Doctor', selector: row => `${row.DocFirst} ${row.DocLast}`, sortable: true, grow: 2 },
        { name: 'Department', selector: row => row.DepartmentName, sortable: true, grow: 2 },
        { name: 'Amount', selector: row => currency(row.Amount), sortable: true },
        { name: 'Transaction Date', selector: row => row.Date != null ? String(row.Date).slice(0, 10) : 'Not Posted', sortable: true },
        { name: 'Insurance', selector: row => row.Insurance == 1 ? 'Yes' : 'No', sortable: true },
        { name: 'Status', selector: row => row.Status, sortable: true },
    ]

    const filterRevenueRows = (filters) => {
        let result = revenue
        if (filters.min) result = result.filter(row => String(row.Date).slice(0, 10) >= filters.min)
        if (filters.max) result = result.filter(row => String(row.Date).slice(0, 10) <= filters.max)
        if (filters.PFirst) result = result.filter(row => row.PatFirst.toLowerCase().startsWith(filters.PFirst.toLowerCase()))
        if (filters.PLast) result = result.filter(row => row.PatLast.toLowerCase().startsWith(filters.PLast.toLowerCase()))
        if (filters.status) result = result.filter(row => row.Status === filters.status)
        if (filters.insure) result = result.filter(row => String(row.Insurance) === String(filters.insure))
        return result
    }

    const filterReviewRows = (filters) => {
        let result = reviews
        if (filters.min) result = result.filter(row => String(row.Date).slice(0, 10) >= filters.min)
        if (filters.max) result = result.filter(row => String(row.Date).slice(0, 10) <= filters.max)
        if (filters.PFirst) result = result.filter(row => row.PatFirst.toLowerCase().startsWith(filters.PFirst.toLowerCase()))
        if (filters.PLast) result = result.filter(row => row.PatLast.toLowerCase().startsWith(filters.PLast.toLowerCase()))
        return result
    }

    const applyFilters = (filters) => {
        setRevenueRecords(filterRevenueRows(filters))
        setReviewRecords(filterReviewRows(filters))
    }

    const handleChange = (e) => {
        const newRep = { ...rep, [e.target.name]: e.target.value }
        setRep(newRep)
        applyFilters(newRep)
    }

    const reset = () => {
        setRep(blankFilters)
        setRevenueRecords(revenue)
        setReviewRecords(reviews)
    }

    return (
        <>
            <div style={statCardsRow}>
                <div style={statCardAccent}>
                    <p style={statLabelLight}>Total Revenue</p>
                    <p style={statValueLight}>{currency(best.totalRevenue)}</p>
                    <p style={statSubLight}>Across filtered transactions</p>
                </div>
                <div style={statCard}>
                    <p style={statLabel}>Top Revenue Department</p>
                    <p style={statValue}>{best.topDepartmentRevenue}</p>
                    <p style={statSub}>{currency(best.topRevenue)} in revenue</p>
                </div>
                <div style={statCard}>
                    <p style={statLabel}>Top Reviewed Department</p>
                    <p style={statValue}>{best.topDepartmentReviews}</p>
                    <p style={statSub}>{rating(best.topReviews)} average rating</p>
                </div>
            </div>

            <div style={filterCard}>
                <p style={sectionLabel}>Filters</p>
                <div style={filterRow}>
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
                    title="Department Report"
                    columns={columnsDep}
                    data={records}
                    progressPending={loading}
                    customStyles={tableCustomStyles}
                    pagination
                    fixedHeader
                />
            </div>
            <div className="report-table">
                <DataTable
                    title="Transactions"
                    columns={columnsRevenue}
                    data={revenueRecords}
                    progressPending={loading}
                    customStyles={tableCustomStyles}
                    pagination
                    fixedHeader
                />
            </div>
            <div className="report-table">
                <DataTable
                    title="Reviews"
                    columns={columnsReview}
                    data={reviewRecords}
                    progressPending={loading}
                    customStyles={tableCustomStyles}
                    pagination
                    fixedHeader
                />
            </div>
        </>
    )
}

export default DepartmentReport
