// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import HomePage from "./components/HomePage/HomePage";
import LoginPage from "./components/RegisterLogin/LoginPage";
import RegisterPage from "./components/RegisterLogin/RegisterPage";
import AboutPage from "./components/About/AboutPage";
import Navbar from "./components/navbar/Navbar";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import ClaimDetailPage from "./components/ClaimDetailPage/ClaimDetailPage";
import LandingPage from "./components/LandingPage/LandingPage";
import ContactPage from "./components/ContactPage/ContactPage";

// 🟢 1. IMPORT THE REAL COMPONENT (This is correct)
import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import "./App.css";
import {
  UserRoute,
  AdminRoute,
  PublicRoute,
  AuthenticatedRoute,
} from "./components/AuthRoutes";

// Your LayoutContainer is good, no changes needed
const LayoutContainer = ({ children }) => {
  const location = useLocation();
  const fullWidthRoutes = ["/", "/login", "/register", "/contact"];
  if (
    fullWidthRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/#") ||
    location.pathname.startsWith("/claim/")
  ) {
    return children;
  }
  return <div className="internal-page-wrapper">{children}</div>;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main>
          <LayoutContainer>
            <Routes>
              {/* --- Public Routes (Only for logged-out users) --- */}
              <Route element={<PublicRoute />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>

              {/* --- Protected USER Routes (Only for non-admin users) --- */}
              <Route element={<UserRoute />}>
                <Route path="/new-claim" element={<HomePage />} />
                <Route
                  path="/claims"
                  element={<div>My Claims List Page Placeholder</div>}
                />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* --- Protected ADMIN Routes (Only for admins) --- */}
              <Route element={<AdminRoute />}>
                {/* 🟢 4. This now correctly uses your imported component */}
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* --- 🟢 2. NEW: SHARED Authenticated Routes --- */}
              {/* Admins AND Users can now see this page */}
              <Route element={<AuthenticatedRoute />}>
                <Route path="/claim/:id" element={<ClaimDetailPage />} />
              </Route>

              {/* --- Fallback for unknown paths --- */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </LayoutContainer>
        </main>
      </div>
    </Router>
  );
}

export default App;
