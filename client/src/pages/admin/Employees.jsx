import AddE from './AddE'
import EmployeeTable from './EmployeeTable'

function Employees(list) {


    return (
        <div>
            <button><a href="/admin/home">Home</a></button>
            <AddE />
            <EmployeeTable list={list}/>
        </div>
    )
}

export default Employees;