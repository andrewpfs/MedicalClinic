import AddE from './AddE'
import EmployeeTable from './EmployeeTable'
import { useStaffAuth } from '../../hooks/useStaffAuth'

function Employees(list) {
    useStaffAuth('Admin');


    return (
        <div>
            <button><a href="/admin/home">Home</a></button>
            <AddE />
            <EmployeeTable list={list}/>
        </div>
    )
}

export default Employees;