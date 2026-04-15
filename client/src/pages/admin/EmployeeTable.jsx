import DataTable from 'react-data-table-component'
import {useState,useEffect} from 'react'


function EmployeeTable(data) {
    const [records,setRecords] = useState(data)
    const [loading,setLoading] = useState(false)
    
    const columns = [
        {
            name: "First Name",
            selector: (row) => row.FirstName,
            sortable: true
        },
        {
            name: "Last Name",
            selector: (row) => row.LastName,
            sortable: true
        },
        {
            name: "Email",
            selector: (row) => row.Email,
        },
        {
            name: "Phone Number",
            selector: (row) => row.PhoneNumber,
        },
        {
            name: "Address",
            selector: (row) => row.Address,
        },
        {
            name: "Edit",
            button: true,
            cell: (row) => {
                <button onClick={editRow(row)}>
                    Edit
                </button>
            }
        },
        {
            name: "Deactivate",
            button: true,
            cell: (row) => {
                <button onClick={DeactivateRow(row)}>
                    Deactivate
                </button>
            }
        }
    ];

    function editRow(row) { //NEED TO IMPLIMENT
        //Edit(row.id)
    };

    function DeactivateRow(row) { //NEED TO IMPLIMENT
        //Deactivate(row.id)
    };
    async function fetchTableData() {
        setLoading(true)
        const URL = "//"
        const response = await fetch(URL)
    };

    useEffect(() => {
        fetchTableData()
    });

    function handleFilterF(event) {
        const newData = data.filter(row => {
            return row.FirstName.toLowerCase().includes(event.target.value.toLowerCase())
        })
        setRecords(newData)
    };

    function handleFilterL(event) {
        const newData = data.filter(row => {
            return row.LastName.toLowerCase().includes(event.target.value.toLowerCase())
        })
        setRecords(newData)
    };
    return (
        <div className="report-table">
            <div>
                <label>First Name: 
                    <input type="text" onChange={handleFilterF}/>
                </label>
                <label>Last Name: 
                    <input type="text" onChange={handleFilterL}/>
                </label>
            </div>
            <DataTable 
                title="Report" 
                columns={columns} 
                data={records} 
                progressPending={loading}
                fixedHeader/>
        </div>
    );
};

export default EmployeeTable;