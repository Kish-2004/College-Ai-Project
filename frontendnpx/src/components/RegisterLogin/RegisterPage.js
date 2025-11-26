import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Form.css";

// 🚨 IMPORTANT: Replace this with your actual backend OAuth URL
const GOOGLE_AUTH_URL = "http://localhost:8080/oauth2/authorization/google";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const registrationData = { name, email, password };
      await axios.post(
        "http://localhost:8080/api/auth/register",
        registrationData
      );

      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data);
      } else {
        setMessage("Registration failed. Please try again later.");
      }
      console.error("Registration failed:", error);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_AUTH_URL;
  };

  return (
    <div className="form-container">
      <div className="form-split-card">
        {/* 1. Left Panel */}
        <div className="form-image-panel">
          <h3>Welcome to AI Estimator!</h3>
          <p>
            Get instant repair estimates and simplify your claim process.
            Register now to begin.
          </p>
        </div>

        {/* 2. Right Panel */}
        <div className="form-content-panel">
          <form onSubmit={handleSubmit}>
            <h2>Create Account</h2>

            {/* Social Login */}
            <div className="social-login">
              <button
                type="button"
                className="social-button google"
                onClick={handleGoogleLogin}
              >
                <span className="icon">G</span> Sign up with Google
              </button>
              <button type="button" className="social-button facebook">
                <span className="icon">f</span> Sign up with Facebook
              </button>
            </div>

            <div className="divider">OR</div>

            {/* Fields with Icons */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

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
                  placeholder="Create a password"
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

            {message && (
              <p
                className={`message ${
                  message.includes("successful") ? "success" : "error"
                }`}
              >
                {message}
              </p>
            )}

            <button type="submit" className="form-button">
              Register
            </button>
          </form>

          <p className="form-switch">
            Already have an account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
