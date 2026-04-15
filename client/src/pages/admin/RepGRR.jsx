import { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import { useStaffAuth } from '../../hooks/useStaffAuth'

const columns = [
    { name: 'Department', selector: r => r.DepartmentName, sortable: true },
    { name: 'Office',     selector: r => r.OfficeName, sortable: true },
    { name: 'Revenue',    selector: r => r.Revenue != null ? `$${parseFloat(r.Revenue).toFixed(2)}` : '—', sortable: true },
];

function RepGRR() {
    useStaffAuth('Admin');
    const [data, setData]       = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ min: '', max: '' });

    useEffect(() => { runReport({ min: '', max: '' }); }, []);

    const runReport = async (f) => {
        setLoading(true);
        try {
            const params = new URLSearchParams(f);
            const res = await fetch(`/admin/api/pullgrr?${params}`, { credentials: 'include' });
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
                    <label>From: <input type="date" name="min" value={filters.min} onChange={handleChange} /></label>
                    <label>To: <input type="date" name="max" value={filters.max} onChange={handleChange} /></label>
                    <button type="submit">Generate Report</button>
                </form>
            </div>
            <div className="report-table">
                <DataTable
                    title="General Revenue Report"
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

export default RepGRR;
