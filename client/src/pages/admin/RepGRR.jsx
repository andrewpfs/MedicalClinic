import { useState, useEffect } from 'react'
import DataTable from 'react-data-table-component'
import { useStaffAuth } from '../../hooks/useStaffAuth'
import { tableCustomStyles, filterCard, filterRow, filterGroup, filterLabel, filterInput, primaryBtn, sectionLabel } from './adminStyles'

let columns = [
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
        <div style={filterCard}>
        <p style={sectionLabel}>Filters</p>
        <div style={filterRow}>
            <div style={filterGroup}>
            <label style={filterLabel}>From</label>
            <input type="date" name="min" value={filters.min} onChange={handleChange} style={filterInput} />
            </div>
            <div style={filterGroup}>
            <label style={filterLabel}>To</label>
            <input type="date" name="max" value={filters.max} onChange={handleChange} style={filterInput} />
            </div>
            <button type="button" onClick={handleSubmit} style={primaryBtn}>Generate report</button>
        </div>
        </div>

        <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        pagination
        highlightOnHover
        customStyles={tableCustomStyles}
        />
    </>
    )
}

export default RepGRR;
