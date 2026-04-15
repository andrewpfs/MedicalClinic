import { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'

const columns = [
    { name: 'ID',         selector: r => r.TransactionID, sortable: true, width: '70px' },
    { name: 'Patient',    selector: r => `${r.FName} ${r.LName}`, sortable: true },
    { name: 'Doctor',     selector: r => `Dr. ${r.DoctorFirst} ${r.DoctorLast}`, sortable: true },
    { name: 'Department', selector: r => r.DepartmentName || '—', sortable: true },
    { name: 'Appt Date',  selector: r => r.AppointmentDate ? new Date(r.AppointmentDate).toLocaleDateString() : '—', sortable: true },
    { name: 'Amount',     selector: r => r.Amount != null ? `$${parseFloat(r.Amount).toFixed(2)}` : '—', sortable: true },
    { name: 'Status',     selector: r => r.Status || '—', sortable: true },
];

function RepAllTrans() {
    const [data, setData]           = useState([]);
    const [departments, setDepts]   = useState([]);
    const [loading, setLoading]     = useState(false);
    const [filters, setFilters]     = useState({ DepartmentName: '', min: '', max: '' });

    useEffect(() => {
        fetch('/admin/api/getdepartments', { credentials: 'include' })
            .then(r => r.json())
            .then(d => setDepts(Array.isArray(d) ? d : []))
            .catch(console.error);
        runReport({ DepartmentName: '', min: '', max: '' });
    }, []);

    const runReport = async (f) => {
        setLoading(true);
        try {
            const params = new URLSearchParams(f);
            const res = await fetch(`/admin/api/transactions?${params}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed');
            setData(await res.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleChange = e => setFilters(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleSubmit = e => { e.preventDefault(); runReport(filters); };

    return (
        <>
            <div className="report-form">
                <form onSubmit={handleSubmit}>
                    <label>Department:
                        <select name="DepartmentName" value={filters.DepartmentName} onChange={handleChange}>
                            <option value="">All Departments</option>
                            {departments.map(d => (
                                <option key={d.DepartmentID} value={d.DepartmentName}>{d.DepartmentName}</option>
                            ))}
                        </select>
                    </label>
                    <label>From: <input type="date" name="min" value={filters.min} onChange={handleChange} /></label>
                    <label>To: <input type="date" name="max" value={filters.max} onChange={handleChange} /></label>
                    <button type="submit">Generate Report</button>
                </form>
            </div>
            <div className="report-table">
                <DataTable
                    title="All Transactions"
                    columns={columns}
                    data={data}
                    progressPending={loading}
                    pagination
                    fixedHeader
                />
            </div>
        </>
    );
}

export default RepAllTrans;
