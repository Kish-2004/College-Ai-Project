// src/components/navbar/Navbar.js
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// ❌ import { isAuthenticated, logout } from '../../auth'; // DELETE THIS
// ❌ DELETE useState and useEffect
import { useAuth } from "../../context/AuthContext"; // 🟢 IMPORT THE NEW HOOK
import "./Navbar.css";

function Navbar() {
  // 🟢 GET ALL AUTH INFO FROM THE CONTEXT
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  // ❌ const location = useLocation(); // No longer needed
  // ❌ const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated()); // DELETE
  // ❌ useEffect(...) // DELETE

  const handleLogout = () => {
    logout(); // 🟢 USE THE NEW LOGOUT
    navigate("/"); // Redirect to the public landing page
  };

  return (
    <nav className="navbar">
      {/* 🟢 Link to correct dashboard */}
      <Link
        to={isAuthenticated ? (isAdmin ? "/admin" : "/new-claim") : "/"}
        className="navbar-brand"
      >
        <span style={{ fontSize: "1.2em" }}>⚡</span> AI Estimator
      </Link>
      <div className="nav-links">
        {/* 🟢 Use isAuthenticated (from context) */}
        {isAuthenticated ? (
          <>
            {/* --- 🟢 NEW ADMIN/USER LOGIC --- */}
            {isAdmin ? (
              <>
                {/* --- ADMIN LINKS --- */}
                <Link to="/admin" className="nav-button primary">
                  Admin Dashboard
                </Link>
              </>
            ) : (
              <>
                {/* --- USER LINKS --- */}
                <Link to="/new-claim" className="nav-button primary">
                  New Claim
                </Link>
                <Link to="/profile">My Profile</Link>
                <Link to="/about">About Us</Link>
              </>
            )}
            {/* --- This shows for both users and admins --- */}
            <button onClick={handleLogout} className="nav-button">
              Logout
            </button>
          </>
        ) : (
          <>
            {/* --- LOGGED-OUT LINKS (Public) --- */}
            <a href="/#features">Features</a>
            <a href="/#how-it-works">How It Works</a>
            <Link to="/contact">Contact</Link>
            <Link to="/login" className="nav-button secondary">
              Login
            </Link>
            <Link to="/register" className="nav-button primary">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
