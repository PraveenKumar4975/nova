import { useEffect, useState } from "react";
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import "./Header.css";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (hash) => {
    navigate("/" + hash);
    setMenuOpen(false);
  };

  const handleLoginSuccess = async (tokenResponse) => {
    try {
      const res = await fetch("http://localhost:5000/auth/google/callback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: tokenResponse.credential }),
      });

      const data = await res.json();
      debugger;
console.log(data.token);
      if (data.success) {
        console.log("User logged in:", data.user);
        setIsLoggedIn(true);
        setUser(data.user);
        localStorage.setItem("token", data.token); // Store JWT
        // Optionally, make an authenticated API call here
        fetchProtectedData();
      } else {
        console.log("Login failed");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const fetchProtectedData = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const res = await fetch("http://localhost:5000/protected", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        console.log("Protected data:", data);
      } catch (err) {
        console.error("Error fetching protected data:", err);
      }
    }
  };

  const handleLogout = () => {
    googleLogout();
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem("token");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        setIsLoggedIn(true);
        // Optionally, fetch protected data on load if the token is valid
        fetchProtectedData();
      } catch (err) {
        console.error("Invalid token");
        localStorage.removeItem("token");
      }
    }
  }, []);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <div className="logo-icon">AI</div>
          <span className="logo-text">PortfolioGen</span>
        </div>

        <div className={`menu-toggle ${menuOpen ? "active" : ""}`} onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

        <nav className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <ul>
            <li className="cursor-pointer" onClick={() => scrollToSection("#hero")}>Home</li>
            <li className="cursor-pointer" onClick={() => scrollToSection("#workflow")}>Workflow</li>
            <li className="cursor-pointer" onClick={() => scrollToSection("#upload")}>Upload Resume</li>
            <li className="cursor-pointer" onClick={() => scrollToSection("#contact")}>Contact</li>
          </ul>
          <div className="nav-buttons">
            {isLoggedIn ? (
              <div className="login-flex">
                <p>Welcome, {user?.name || "User"}</p>
                <button className="btn btn-primary" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => console.log("Login Failed")}
              />
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
