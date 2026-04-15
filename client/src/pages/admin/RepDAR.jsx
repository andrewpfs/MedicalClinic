import React from 'react'
import { useState } from 'react'
//import { useNavigate } from 'react-router-dom'
import DataTable from 'react-data-table-component'

function RepDAR() {
    const [stuff, setStuff] = useState([])
    const [data,setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [rep, setRep] = useState({
        DepartmentName: "",
        min: "",
        max: ""
    });

    const columns = [
        {
            name: "Name",
            selector: (row) => row.FirstName + " " + row.LastName,
            sortable: true
        },
        {
            name: "Department",
            selector: (row) => row.DepartmentName,
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
            const response = await fetch("http://localhost:3001/admin/api/pulldar", rep);
            if (!response.ok) {
                throw new Error("Request failed");
            }
            const resData = await response.json();
            console.log(resData);
            setData(resData.rows || resData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    //console.Errorstuff.Rows

    return (
        <>
            <div className='report-form'>
                <form>
                    <label>Department:
                        <input type="text" name="DepartmentName" placeholder="e.g. General" onChange={handleChange} required />
                    </label>
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
                    title="Department Appointment Report"
                    columns={columns}
                    data={data}
                    progressPending={loading}
                    fixedHeader />
            </div>
        </>
    );
};

export default RepDAR;
