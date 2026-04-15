import React from 'react'
import {useState,useEffect} from 'react'
//import {createRoot} from 'react'
import {useNavigate} from 'react-router-dom'


const AddE = () => {
    const navigate = useNavigate();
    const [department,setDepartment] = useState([])
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
        Doctor:false,
        Nurse:false
    })
    
    async function getDepart() {
        try {
            const deps = await fetch('/admin/api/getdepartments').then(res => res.json())


            setDepartment(deps)
        }catch(err) {
            console.error(err)
        }
    }

    useEffect(() => {
        getDepart()
    },[])
    const handleChange = (e) => {
        setEmp(prev=>({...prev,[e.target.name] : e.target.value}));
    };
    
    const handleClick = async e => {
        e.preventDefault();
        try {
            // Correct the fetch syntax for the POST request
            const response = await fetch(`/api/addemployee`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emp)
            });

            if (response.ok) {
                console.log("Employee Created");
                // If it's a Doctor, you might need to handle additional inserts here
                navigate("/admin/employees");
            }
        } catch(err){
            console.error("Add employee error:", err);
        }
    };

    const handleDisplay = (e) => {
        setEmp({Role:e.target.value})
        if (e.target.value === 'Doctor') {
            setCheck({Doctor: true,Nurse: false})
        }else if (e.target.value === 'Nurse') {
            setCheck({Doctor: false,Nurse: true})
        }else {
            setCheck({Doctor: false,Nurse: false})
        }
    }

    function DoctorForm() {
        return (
            <div>
                <br /><br /><br />
                <label>Specialty:
                    <input type="text" placeholder="Specialty" name="Specialty" onChange={handleChange} maxlength="20" opacity= {check.Doctor}/>
                </label>
                <label>Is A Primary Care Physician:
                    <select name="IsPrimaryCare" onChange={handleChange}>
                        <option value="">Select</option>
                        <option value="1">Yes</option>
                        <option value="0">No</option>
                    </select>
                </label>
            </div>
        )
    }

    function NurseForm() {
        return (
            <div>
                <br /><br /><br />
                <label>Assigned Doctor ID:
                    <input type="text" placeholder="0000" name="AssignedDoctorID" onChange={handleChange}/>
                </label>
            </div>
        )
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
                <select name="Role" onChange={handleDisplay}required>
                    <option value="">Select Role</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Admin">Admin</option>
                </select>
            </label>
            <label>Department*:
                <select name="DepartmentName" onChange={handleChange}>
            {department.map(department => (
                <option key={department.DepartmentID} value={department.DepartmentID}>
                    {department.DepartmentName}
                </option>
            ))}
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
            {check.Doctor ? <DoctorForm /> : null}
            {check.Nurse ? <NurseForm /> : null}
            <br />
            <button onClick={handleClick}>Create Employee</button>
        </form>
    </div>
    );
};



export default AddE;