import {useState} from 'react'
import RepDAR from './RepDAR'
import RepGAR from './RepGAR'
import RepGRR from './RepGRR'
import RepAllAppt from './RepAllAppt'
import RepAllTrans from './RepAllTrans'
import { useStaffAuth } from '../../hooks/useStaffAuth'

function Report() {
    useStaffAuth('Admin');
    const [type, setType] = useState("AllAppt");

    return (
        <div>
            <button><a href="/admin/home">Home</a></button><br />
            <label>Report type:
                <select name="ReportType" onChange={e => setType(e.target.value)} value={type}>
                    <option value="AllAppt">All Appointments</option>
                    <option value="AllTrans">All Transactions</option>
                    <option value="RepDAR">Dept. Appointment Summary</option>
                    <option value="RepGAR">General Appointment Summary</option>
                    <option value="RepGRR">General Revenue Summary</option>
                </select>
            </label>

            {type === "AllAppt"  && <RepAllAppt />}
            {type === "AllTrans" && <RepAllTrans />}
            {type === "RepDAR"   && <RepDAR />}
            {type === "RepGAR"   && <RepGAR />}
            {type === "RepGRR"   && <RepGRR />}
        </div>
    );
};

export default Report;