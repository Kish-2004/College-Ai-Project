// src/components/AdminDashboard/AdminDashboard.js

import React, { useEffect, useState } from "react";
import api from "../../api/api";
import "./AdminDashboard.css";
import { Link } from "react-router-dom";

// Icons
import {
  FaUsers,
  FaFileInvoice,
  FaCheckCircle,
  FaHourglassHalf,
} from "react-icons/fa";

function AdminDashboard() {
  const [allClaims, setAllClaims] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllClaims = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/admin/claims/all");
        const claims = response.data;
        setAllClaims(claims);

        // Userwise Stats Logic (Unchanged)
        const stats = claims.reduce((acc, claim) => {
          const email = claim.userEmail || "Unknown User";
          const name = claim.userName || "Unknown";
          if (!acc[email]) acc[email] = { count: 0, name };
          acc[email].count += 1;
          return acc;
        }, {});
        setUserStats(stats);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
        setError("Failed to load data. You may not be an admin.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllClaims();
  }, []);

  // 🟢 FIX 2: Smarter Metrics Calculation
  const totalClaims = allClaims.length;

  // "Completed" means a final decision has been made (Approved or Rejected)
  const completedClaims = allClaims.filter(
    (c) => c.status.includes("APPROVED") || c.status.includes("REJECTED")
  ).length;

  // "Pending" means waiting for Admin (Analyzed but not decided)
  const pendingClaims = allClaims.filter(
    (c) => !c.status.includes("APPROVED") && !c.status.includes("REJECTED")
  ).length;

  const uniqueUsers = Object.keys(userStats).length;

  // 🟢 NEW: Handle Approve/Reject
  const handleStatusUpdate = async (claimId, newStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to mark this claim as ${newStatus}?`
      )
    )
      return;
    try {
      await api.put(`/admin/claims/${claimId}/status?status=${newStatus}`);
      // Refresh the list locally
      setAllClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      alert("Failed to update status");
    }
  };
  // 🟢 Helper to format Status Text
  const getStatusLabel = (status) => {
    if (status === "CLAIM_APPROVED") return "✅ Approved";
    if (status === "CLAIM_REJECTED") return "❌ Rejected";
    if (status.includes("ANALYZED")) return "⚠️ Waiting for Approval";
    if (status.includes("PENDING")) return "⏳ Processing";
    return status.replace(/_/g, " ");
  };
  // ---------------------------
  // 🔥 Loading Skeleton Section
  // ---------------------------
  if (isLoading) {
    return (
      <div className="admin-container center-dashboard">
        <h1 className="admin-header fade-up">Admin Dashboard</h1>

        <div className="key-metrics fade-up">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="metric-card skeleton-card"></div>
          ))}
        </div>

        <section className="admin-section glass-card fade-up">
          <div className="skeleton-title"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="stat-card skeleton-card"></div>
          ))}
        </section>

        <section className="admin-section glass-card fade-up">
          <div className="skeleton-title"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-row"></div>
          ))}
        </section>
      </div>
    );
  }

  // ----------------------------------
  // ❌ Error UI
  // ----------------------------------
  if (error) {
    return (
      <div className="admin-container center-dashboard">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  // ----------------------------------
  // ✅ Actual Dashboard UI
  // ----------------------------------
  return (
    <div className="admin-container center-dashboard">
      {/* Floating Glass Bubbles */}
      <div
        className="background-bubble"
        style={{ top: "10%", left: "5%" }}
      ></div>
      <div
        className="background-bubble"
        style={{ bottom: "12%", right: "10%" }}
      ></div>

      {/* Header */}
      <h1 className="admin-header fade-up">Admin Dashboard</h1>

      {/* --------------------- */}
      {/* 1. Key Metrics Section */}
      {/* --------------------- */}
      <section className="key-metrics fade-up">
        <div className="metric-card glass-card slide-up">
          <FaFileInvoice
            size={70}
            className="metric-icon"
            style={{ color: "#007bff" }}
          />
          <div className="metric-info">
            <span className="metric-value">{totalClaims}</span>
            <span className="metric-label">Total Claims</span>
          </div>
        </div>

        <div className="metric-card glass-card slide-up">
          <FaUsers
            size={70}
            className="metric-icon"
            style={{ color: "#28a745" }}
          />
          <div className="metric-info">
            <span className="metric-value">{uniqueUsers}</span>
            <span className="metric-label">Unique Users</span>
          </div>
        </div>

        <div className="metric-card glass-card slide-up">
          <FaCheckCircle
            size={70}
            className="metric-icon"
            style={{ color: "#17a2b8" }}
          />
          <div className="metric-info">
            <span className="metric-value">{completedClaims}</span>
            <span className="metric-label">Completed</span>
          </div>
        </div>

        <div className="metric-card glass-card slide-up">
          <FaHourglassHalf
            size={70}
            className="metric-icon"
            style={{ color: "#ffc107" }}
          />
          <div className="metric-info">
            <span className="metric-value">{pendingClaims}</span>
            <span className="metric-label">Pending</span>
          </div>
        </div>
      </section>

      {/* ------------------------ */}
      {/* 2. User Activity Section */}
      {/* ------------------------ */}
      <section className="admin-section glass-card fade-up">
        <h2>User Activity</h2>

        <div className="stats-cards">
          {Object.entries(userStats).map(([email, data], index) => (
            <div
              key={email}
              className="stat-card glass-card row-animate"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div>
                <div className="stat-card-name">{data.name}</div>
                <div className="stat-card-email">{email}</div>
              </div>
              <div className="stat-card-count-wrapper">
                <div className="stat-card-count">{data.count}</div>
                <span>{data.count === 1 ? "Claim" : "Claims"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------- */}
      {/* 3. All Claims Table Section */}
      {/* --------------------------- */}
      <section className="admin-section glass-card fade-up">
        <h2>All Claims ({allClaims.length})</h2>

        <div className="table-wrapper">
          <table className="claims-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>User</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Estimate</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>

            {/* Replace your existing <tbody> with this: */}
            <tbody>
              {allClaims.map((claim, index) => (
                <tr
                  key={claim.id}
                  className="row-animate"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td>
                    <strong>#{claim.id}</strong>
                  </td>

                  <td>
                    <div className="user-cell">
                      <div>{claim.userName}</div>
                      <span>{claim.userEmail}</span>
                    </div>
                  </td>

                  <td>{claim.vehicleMakeModel}</td>

                  {/* 🟢 1. UPDATED STATUS COLUMN */}
                  {/* 🟢 FIX 1: CORRECT STATUS BADGE LOGIC */}
                  <td>
                    <span
                      className={`status-badge ${
                        claim.status.includes("APPROVED")
                          ? "status-success"
                          : claim.status.includes("REJECTED")
                          ? "status-danger"
                          : "status-warning" // Default to Yellow for anything else (Pending/Analyzed)
                      }`}
                    >
                      {/* Text Logic */}
                      {claim.status.includes("APPROVED")
                        ? "✅ Approved"
                        : claim.status.includes("REJECTED")
                        ? "❌ Rejected"
                        : "⚠️ Waiting Approval"}
                    </span>
                  </td>

                  <td className="estimate-cell">
                    ${claim.estimatedTotal.toFixed(2)}
                  </td>
                  <td>{new Date(claim.createdAt).toLocaleDateString()}</td>

                  {/* 🟢 2. UPDATED ACTION COLUMN (Better Buttons) */}
                  {/* 🟢 UPDATE: Action Column */}
                  <td className="action-cell">
                    <Link
                      to={`/claim/${claim.id}`}
                      className="btn-action btn-view"
                    >
                      View
                    </Link>

                    {!claim.status.includes("APPROVED") &&
                      !claim.status.includes("REJECTED") && (
                        <>
                          <button
                            onClick={() =>
                              handleStatusUpdate(claim.id, "CLAIM_APPROVED")
                            }
                            className="btn-action btn-accept"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(claim.id, "CLAIM_REJECTED")
                            }
                            className="btn-action btn-reject"
                          >
                            Reject
                          </button>
                        </>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
