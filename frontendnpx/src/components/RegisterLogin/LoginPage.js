import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "./Form.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        { email, password }
      );
      const token = response.data.jwt;

      if (token) {
        login(token);
        navigate("/new-claim");
      } else {
        setError("Login failed: No token received.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Invalid email or password. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="form-container">
      <div className="form-split-card">
        {/* 1. Left Panel */}
        <div className="form-image-panel">
          <h3>Welcome Back!</h3>
          <p>We missed you! Please log in to view your claims and estimates.</p>
        </div>

        {/* 2. Right Panel */}
        <div className="form-content-panel">
          <form onSubmit={handleSubmit}>
            <h2>Login</h2>

            {/* Social Login */}
            <div className="social-login">
              <button type="button" className="social-button google">
                <span className="icon">G</span> Log in with Google
              </button>
              <button type="button" className="social-button facebook">
                <span className="icon">f</span> Log in with Facebook
              </button>
            </div>

            <div className="divider">OR</div>

            {/* Fields with Icons */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <span className="input-icon">✉️</span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="eye-icon"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            {error && <p className="message error">{error}</p>}

            <button type="submit" className="form-button">
              Login
            </button>
          </form>

          <p className="form-switch">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
