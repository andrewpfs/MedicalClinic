import DataTable from 'react-data-table-component'
import {useState,useEffect} from 'react'
import { useStaffAuth } from '../../hooks/useStaffAuth'

function ReportTable(type, data) {
    useStaffAuth('Admin');
    const [stuff,setStuff] = useState([])
    const [loading,setLoading] = useState(false)
    const [perPage,setPerPage] = useState(10)

    
    let columns = []
    if (type == "RepDAR") {
        columns = [
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

        ]
    }
    else if(type == "RepGAR") {
        columns = [
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
        ]
    }
    else {
        columns = [
            {
                name: "Department",
                selector: (row) => row.DepartmentName,
            },
            {
                name: "Office",
                selector: (row) => row.OfficeName,
            },
            {
                name: "Revenue",
                selector: (row) => row.Revenue,
            },
        ]
    } 

    async function fetchTableData() {
        setLoading(true)
        const URL = "/" + type
        const response = await fetch(URL)
    }

    useEffect(() => {
        fetchTableData()
    }) 
    return (
        <div className="report-table">
            <DataTable 
                title="Report" 
                columns={columns} 
                data={data} 
                progressPending={loading}
                fixedHeader/>
        </div>
    )
}


export default ReportTable;