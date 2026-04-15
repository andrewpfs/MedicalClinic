import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'

function RepGAR() {
    const [stuff, setStuff] = useState([])
    const [loading, setLoading] = useState(false)
    const [rep, setRep] = useState({
        DepartmentName: "",
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
            name: "Total Appointments",
            selector: (row) => row.Appointments,
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
            // 1. Convert your report state into URL parameters
            const params = new URLSearchParams(rep);
            
            // 2. Change method from POST to GET to match the working DAR style
            const response = await fetch(`/admin/api/pullgar?${params}`, { 
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) throw new Error("Report failed to load");
            
            const data = await response.json();
            // 3. Ensure you access .results if your API wraps the array
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
                    title="General Appointment Report"
                    columns={columns}
                    data={stuff}
                    progressPending={loading}
                    fixedHeader />
            </div>
        </>
    );
};

export default RepGAR;
