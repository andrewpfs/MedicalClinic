import React from 'react'
import {useState} from 'react'
import {createRoot} from 'react'
import {useNavigate} from 'react-router-dom'

function RepGRR() {
    const navigate = useNavigate();

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
        try {
            await fetch("/admin/addemp", rep) //Need to figure out how to connect and make post request
            navigate("/admin/home") //IDK PLEASE SEND HELP
        }catch(err){
            console.error(err)
        }
    };
    
    return (
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

    );
};

export default RepGRR;