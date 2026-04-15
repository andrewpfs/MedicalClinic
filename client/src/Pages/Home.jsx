import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles.css"
function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState("");
  const navigate = useNavigate()

  useEffect(() => {
    fetch("/api/session", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setIsLoggedIn(data.isLoggedIn);
        setFirstName(data.firstName);
      })
  }, []);

  const handleLogout = async () => {
    await fetch("/patient/logout", { credentials: "include" })
    setIsLoggedIn(false)
    setFirstName("")
    navigate("/")
  }


  return (
    <div>
      <div className="navbar">
        <div className="logo">Hello {firstName}</div>
        <div className="auth">
          {isLoggedIn ? (
            <>
                <Link to="/patient/profile">
                    <button className="nav-btn">My Profile</button>
                 </Link>
              <button className="nav-btn" onClick = {handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <Link to="/select-role">
                <button className="nav-btn">Log In</button>
              </Link>
              <Link to="/register">
                <button className="nav-btn">Register</button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="home-banner">
        <img src="https://www.frontsigns.com/wp-content/uploads/2021/07/comfortable-seating-in-medical-clinic-reception.jpg" alt="Clinic" />
      </div>

      <div className="content">
        <h1>Welcome</h1>
        <p>This is your clinic management system.</p>
      </div>
    </div>
  );
}

export default Home;