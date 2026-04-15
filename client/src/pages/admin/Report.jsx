import {useState} from 'react'
import RepDAR from './RepDAR'
import RepGAR from './RepGAR'
import RepGRR from './RepGRR'

function Report() {
    const [type,setType] = useState("RepDAR")
    const handleReport = (e) => {
        setType(e.target.value)
    };

    return (
        <div>
            <button><a href="/admin/home">Home</a></button><br />
            <label>Reports:
                <select name="ReportType" onChange={handleReport}>
                    <option value="RepDAR">Department Appointment</option>
                    <option value="RepGAR">General Appointment</option>
                    <option value="RepGRR">General Revenue</option>
                </select>
            </label>
            
            {/* Conditionally render the selected report component */}
            {type === "RepDAR" && <RepDAR />}
            {type === "RepGAR" && <RepGAR />}
            {type === "RepGRR" && <RepGRR />}
        </div>
    );
};

export default Report;