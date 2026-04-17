import { useEffect } from "react"

function DepartmentForm() {

    const [Department,setDepartment] = useState({
        DepartmentID:"",
        DepartmentName:""
    })

    async function getDep() {
        try {
            const [rows] = await fetch(`${API}/admin/api/getdepartments`))

            setDepartment(await rows.json())
        }catch(err) {
            console.error(err)
            
        }
    }
    useEffect(() => {
        getDep()
    })

    return (
        <form action="">
            <select name="DepartmentName" onChange={handleChange}>
            {department.map(department => (
                <option key={department.DepartmentID} value={department.DepartmentID}>
                    {department.DepartmentName}
                </option>
            ))}
        </select>
        </form>
    )
}