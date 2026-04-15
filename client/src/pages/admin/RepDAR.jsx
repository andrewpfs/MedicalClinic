import React from 'react'
import {useState} from 'react'
import {createRoot} from 'react'
import {useNavigate} from 'react-router-dom'
import DataTable from 'react-data-table-component'

function RepDAR() {
    const [stuff,setStuff] = useState([])
    const [loading,setLoading] = useState(false)
    const [rep,setRep] = useState({
        DepartmentName: "",
        min: "",
        max: ""
    });

    const handleChange = (e) => {
        setRep(prev=>({...prev,[e.target.name] : e.target.value}));
    };

    const handleClick = async e => {
        e.preventDefault()
        await fetch("/admin/addemp", rep).then(res => {
            setStuff(res.json())
        })
    };
    
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
                title="Report"  
                progressPending={loading}
                fixedHeader/>
        </div>
        </>
    );
};

export default RepDAR;