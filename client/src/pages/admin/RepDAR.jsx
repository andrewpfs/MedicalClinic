import { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import { useStaffAuth } from '../../hooks/useStaffAuth'

const columns = [
    { name: 'Doctor',     selector: r => `${r.FirstName} ${r.LastName}`, sortable: true },
    { name: 'Department', selector: r => r.DepartmentName, sortable: true },
    { name: 'Appointments', selector: r => r.Appointments, sortable: true },
];

function RepDAR() {
    useStaffAuth('Admin');
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
            const res = await fetch(`/admin/api/pulldar?${params}`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed');
            const json = await res.json();
            setData(json.results || json);
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
                    title="Department Appointment Report"
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

export default RepDAR;
