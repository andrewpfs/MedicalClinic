import React from 'react'
import {useState} from 'react'
import {createRoot} from 'react'
import {useNavigate} from 'react-router-dom'


const AddE = () => {
    const navigate = useNavigate();

    const [emp,setEmp] = useState({
        FirstName: "",
        LastName: "",
        BirthDate: "",
        GenderCode: "",
        RaceCode: "",
        EthnicityCode: "",
        Role: "",
        Department: "",
        Address: "",
        PhoneNumber: "",
        Email: "",
        Password: "",
        Specialty: "",
        IsPrimaryCare: "",
        AssignedDoctorID: ""
    });

    const [check,setCheck] = useState({
        Doctor:"none",
        Nurse:"none"
    })
    
    const handleChange = (e) => {
        setEmp(prev=>({...prev,[e.target.name] : e.target.value}));
    };
    
    const handleClick = async e => {
        e.preventDefault()
        try {
            await fetch(`/api/addemployee`, emp) //Need to figure out how to connect and make post request
            console.log("Employee Created")

            if (emp.Role == 'Doctor') {
                const id = await fetch(`/api/getID`,emp)
                
                await fetch(`/api/adddoctor`,{EmployeeID:id,Specialty:emp.Specialty,IsPrimaryCare:emp.IsPrimaryCare})
                console.log("Doctor Created")
            }
            else if (emp.Role == 'Nurse') {
                const id = await fetch(`/api/getID`,emp)

                await fetch(`/api/addnurse`,{EmployeeID:id,AssignedDoctorID:emp.AssignedDoctorID})
                console.log("Nurse Created")
            }
            
            
            navigate("/admin/employees") //IDK PLEASE SEND HELP
        }catch(err){
            console.error(err)
        }
    };

    const handleDisplay = (e) => {
        if (e.target.value == 'Doctor') {
            setCheck({Doctor: "inline",Nurse: "none"})
        }else if (e.target.value == 'Nurse') {
            setCheck({Doctor: "none",Nurse: "inline"})
        }else {
            setCheck({Doctor: "none",Nurse: "none"})
        }
    }

    return (
    <div className="form-section">
        <h1>Add New Employee</h1>
        <form>
            <label>First Name*:
                <input type="text" name="FirstName" onChange={handleChange} maxlength="30" required/>
            </label>
            <label>Last Name*:
                <input type="text" name="LastName" onChange={handleChange} maxlength="30" required/>
            </label>
            <label>Birth Date*:
                <input type="date" name="Birthdate" onChange={handleChange} required/>
            </label><br /><br />
            <label>Gender:
                <select name="GenderCode" onChange={handleChange}>
                    <option value="">Select Gender</option>
                    <option value="1">Male</option>
                    <option value="2">Female</option>
                    <option value="3">Other</option>
                </select>
            </label>
            <label>Race:
                <select name="RaceCode" onChange={handleChange}>
                    <option value="">Select Race</option>
                    <option value="1">White</option>
                    <option value="3">African</option>
                    <option value="2">Asian</option>
                    <option value="5">Other</option>
                </select>
            </label>
            <label>Ethnicity:
                <select name="EthnicityCode" onChange={handleChange}>
                    <option value="">Select Ethnicity</option>
                    <option value="1">Hispanic</option>
                    <option value="2">Latin American</option>
                    <option value="3">African</option>
                    <option value="4">Caribbean</option>
                    <option value="5">Indian</option>
                    <option value="6">Melanesian</option>
                    <option value="7">Chinese</option>
                    <option value="8">Japanese</option>
                    <option value="9">Korean</option>
                    <option value="10">Arabic</option>
                    <option value="11">European</option>
                    <option value="12">Other</option>
                </select>
            </label><br /><br />
            <label>Role*:
                <select name="Role" onChange={handleChange} required>
                    <option value="">Select Role</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Admin">Admin</option>
                </select>
            </label>
            <label>Department*:
                <select name="DepartmentID" onChange={handleChange} required>
                    <option value="">Select Department</option>
                    <option value="1">General</option>
                    <option value="2">Optometry</option>
                    <option value="3">Cardiology</option>
                    <option value="4">Orthopedics</option>
                </select>
            </label><br />
            <label>Address:
                <input type="text" name="Address" onChange={handleChange} maxlength="100"/>
            </label>
            <label>Phone Number:
                <input type="tel" placeholder="1234567890" name="PhoneNumber" onChange={handleChange} pattern="[0-9]{10}"/>
            </label><br />
            <label>Email*:
                <input type="email" placeholder="example@example.com" name="Email" onChange={handleChange} required/>
            </label>
            <label>Password*:
                <input type="text" placeholder="Password" name="Password" onChange={handleChange} required/>
            </label>
            <div>
            <br /><br />If A Doctor:<br />
            <label>Specialty:
                <input type="text" placeholder="Specialty" name="Specialty" onChange={handleChange} maxlength="20"/>
            </label>
            <label>Is A Primary Care Physician:
                <select name="IsPrimaryCare" onChange={handleChange}>
                    <option value="">Select</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                </select>
            </label>
            </div>
            <div>
            <br /><br />If A Nurse:<br />
            <label>Assigned Doctor ID:
                <input type="text" placeholder="0000" name="AssignedDoctorID" onChange={handleChange}/>
            </label>
            </div><br />
            <button onClick={handleClick}>Create Employee</button>
        </form>
    </div>
    );
};


export default AddE;