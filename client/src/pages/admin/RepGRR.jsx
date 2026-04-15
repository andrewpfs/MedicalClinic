import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'

function RepGRR() {
    const [stuff, setStuff] = useState([])
    const [loading, setLoading] = useState(false)
    const [rep, setRep] = useState({
        min: "",
        max: ""
    });

    const columns = [
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
            name: "Revenue",
            selector: (row) => row.Revenue,
            sortable: true
        },
    ];

    const handleChange = (e) => {
        setRep(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleClick = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const params = new URLSearchParams(rep);
            const response = await fetch(`/admin/api/pullgrr?${params}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Revenue report failed");

            const data = await response.json();
            setStuff(data.results || data); 
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className='report-form'>
                <form>
                    <label>Minimum:
                        <input type="date" name="min" onChange={handleChange} required />
                    </label>
                    <label>Maximum:
                        <input type="date" name="max" onChange={handleChange} required />
                    </label>
                    <button onClick={handleClick}>Generate Report</button>
                </form>
            </div>
            <div className="report-table">
                <DataTable
                    title="General Revenue Report"
                    columns={columns}
                    data={stuff}
                    progressPending={loading}
                    fixedHeader />
            </div>
        </>
    );
};

export default RepGRR;
