import React from 'react'

function AdminHome() {

    return (
        <div>
            <h1>Home Page</h1>
            <a href="/admin/Profile"><button>View Profile</button></a>
            <a href="/admin/AddE"><button>Add employee</button></a>
            <br /><br /><h1>Reports:</h1>
            <p>The General Appointment Report creates a report that sorts Departments by how many appointments each gets within a certain time period.</p>
            <p>The General Revenue Report creates a report that sorts Departments by how much revenue each makes within a certain time period.</p>
            <p>The Department Appointment Report creates a report that sorts Doctors within a specified Department by how many appointments each gets within a certain time period.</p>
            <a href="/admin/Report"><button>Start Report</button></a><br />
        </div>
    );
};

export default AdminHome;