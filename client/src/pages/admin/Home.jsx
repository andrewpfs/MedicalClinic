import React from 'react'
import { Link } from 'react-router-dom'

function AdminHome() {

    return (
        <div>
            <h1>Home Page</h1>
            <Link to="/admin/profile"><button>View Profile</button></Link>
            <Link to="/admin/employees"><button>Employees</button></Link>
            <br /><br /><h1>Reports:</h1>
            <p>The General Appointment Report creates a report that sorts Departments by how many appointments each gets within a certain time period.</p>
            <p>The General Revenue Report creates a report that sorts Departments by how much revenue each makes within a certain time period.</p>
            <p>The Department Appointment Report creates a report that sorts Doctors within a specified Department by how many appointments each gets within a certain time period.</p>
            <Link to="/admin/report"><button>Start Report</button></Link><br />
        </div>
    );
};

export default AdminHome;