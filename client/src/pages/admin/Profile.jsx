import React from 'react'
import { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';



function AdminProfile() {
    const [info, setInfo] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
/*
    useEffect(() => {
    fetch('/admin/api/profile', { credentials: 'include' })
        .then(res => {
        if (res.status === 401) { navigate('/patient/login'); return null; }
        return res.json();
        })
        .then(data => { if (data) setInfo(data); })
        .catch(() => setError('Failed to load profile.'));
    }, [navigate]);
*/
    useEffect(() => {
        setInfo(fetch('/admin/api/profile',))
    })
    if (error) return <p style={{ padding: '20px', color: 'red' }}>{error}</p>;
    if (!info) return <p style={{ padding: '20px' }}>Loading...</p>;
    
    

    
    
    // button  style="text-decoration: none; color: black;"
    
    return (
        <div>
            <button><a href="/admin/home">Home</a></button>
            <h1> Name: {info.First} {info.Last}</h1>
            <h1>Role: {info.Role}</h1>
            <h1>Department: {info.Depart}</h1>
            <h1>Birth Date: {info.Birth}</h1>
            <h1>Gender: {info.Gender}</h1>
            <h1>Race: {info.Race}</h1>
            <h1>Ethnicity: {info.Ethnic}</h1>
            <h1>Address: {info.Address}</h1>
            <h1>Phone Number: {info.Phone}</h1>
            <h1>Email: {info.Email}</h1>
            <br /><br />
            <UpdateProfile />
        </div>

    );
};

function UpdateProfile(info) {
    const navigate = useNavigate();
    const [updated,setUpdated] = useState({
        FirstName: info.First,
        LastName: info.Last,
        Address: info.Address,
        PhoneNumber: info.Phone,
        Email: info.Email,
        Password: info.Pass,
    });

    const [passes,setPasses] = useState({
        OldPassword: "",
        NewPassword: ""
    })

    const handleChange = (e) => {
        setUpdated(prev=>({...prev,[e.target.name] : e.target.value}));
    };

    const handleChangePassword = (e) => {
        setPasses(prev=>({...prev,[e.target.name] : e.target.value}));
    };

    const handleUpdate = async e => {
        e.preventDefault()
        try {
            await fetch("/admin/api/updateprofile", updated) //Need to figure out how to connect and make post request
            navigate("/admin/Employees") //IDK PLEASE SEND HELP
        }catch(err){
            console.error(err)
        }
    };

    const handlePassword = async e => {
        e.preventDefault()
        if (passes.OldPassword == info.Pass) {
        try {
            await fetch("/admin/api/updatepassword", {Password:passes.NewPassword,ID:info.id} ) //Need to figure out how to connect and make post request
            navigate("/admin/Employees") //IDK PLEASE SEND HELP
        }catch(err){
            console.error(err)
        }}else {
            return <div>Incorrect Password. Please Try Again.</div>
        }
    };

    return (
        <div>
            <form>Update Profile
                <label>First Name:
                <input type="text" name="FirstName" onChange={handleChange} maxlength="30" required/>
                </label>
                <label>Last Name:
                    <input type="text" name="LastName" onChange={handleChange} maxlength="30" required/>
                </label><br /><br />
                <label>Address:
                    <input type="text" name="Address" onChange={handleChange} maxlength="100"/>
                </label>
                <label>Phone Number:
                    <input type="tel" placeholder="1234567890" name="PhoneNumber" onChange={handleChange} pattern="[0-9]{10}"/>
                </label><br />
                <label>Email:
                    <input type="email" placeholder="example@example.com" name="Email" onChange={handleChange} required/>
                </label>
                <button onClick={handleUpdate}>Submit</button>
            </form>
            <form>
                <label>Old Password:
                    <input type="text" placeholder="Password" name="OldPassword" onChange={handleChangePassword}/>
                </label>
                <label>New Password:
                    <input type="text" placeholder="Password" name="NewPassword" onChange={handleChangePassword}/>
                </label>
                <button onClick={handlePassword}>Submit</button>
            </form>
        </div>
    )
}


export default AdminProfile;