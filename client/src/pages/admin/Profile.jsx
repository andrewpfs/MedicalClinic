import React from 'react'
import { useState,useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStaffAuth } from '../../hooks/useStaffAuth';

import API from '../../api';
function AdminProfile() {
    useStaffAuth('Admin');
    const [info, setInfo] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        fetch(`${API}/admin/api/profile`, { credentials: 'include' })
            .then(res => {
                if (res.status === 401) { navigate('/admin/home'); return null; }
                return res.json();
            })
            .then(data => { if (data) setInfo(data); })
            .catch(() => setError('Failed to load profile.'));
    }, []);
    if (error) return <p style={{ padding: '20px', color: 'red' }}>{error}</p>;
    
    // This prevents the "reading property of null" error while data loads
    if (!info) return <p style={{ padding: '20px' }}>Loading profile...</p>;

    return (
        <div style={{ padding: '20px' }}>
            <button onClick={() => navigate("/admin/home")}>Home</button>
            <h1>Name: {info.First} {info.Last}</h1>
            <p><strong>Role:</strong> {info.Role}</p>
            <p><strong>Department:</strong> {info.Depart}</p>
            <p><strong>Phone:</strong> {info.Phone}</p>
            <p><strong>Email:</strong> {info.Email}</p>
            
            <hr />
            {/* Pass info as a prop to the update form */}
            <UpdateProfile info={info} />
        </div>
    );
};

function UpdateProfile({ info }) {
    const navigate = useNavigate();
    const [updated, setUpdated] = useState({
        FirstName: info.First || "",
        LastName: info.Last || "",
        Address: info.Address || "",
        PhoneNumber: info.Phone || "",
        Email: info.Email || "",
    });

    const handleChange = (e) => {
        setUpdated(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API}/admin/api/updateprofile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...updated, EmployeeID: info.id }) 
            });
            if (response.ok) {
                alert("Profile updated successfully!");
                window.location.reload(); // Refresh to show new data
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h3>Update Profile</h3>
            <form onSubmit={handleUpdate}>
                <label>First Name: 
                    <input type="text" name="FirstName" defaultValue={info.First} onChange={handleChange} />
                </label><br />
                <label>Last Name: 
                    <input type="text" name="LastName" defaultValue={info.Last} onChange={handleChange} />
                </label><br />
                <label>Phone: 
                    <input type="tel" name="PhoneNumber" defaultValue={info.Phone} onChange={handleChange} />
                </label><br />
                <label>Email: 
                    <input type="email" name="Email" defaultValue={info.Email} onChange={handleChange} />
                </label><br />
                <button type="submit">Save Changes</button>
            </form>
        </div>
    );
}

export default AdminProfile;