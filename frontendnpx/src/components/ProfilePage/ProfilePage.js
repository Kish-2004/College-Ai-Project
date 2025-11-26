import React, { useState, useEffect, useRef } from "react";
import api from "../../api/api";
import { Link, useNavigate } from "react-router-dom";
import "../../App.css";
import "./ProfilePage.css"; // Ensure this file has the NEW CSS I provided

// Helper function to format currency
const formatCurrency = (value) => {
  if (value == null) return "N/A";
  return `₹${Number(value).toFixed(2)}`;
};

// Default Avatar URL
const DEFAULT_AVATAR = "/default-avatar.png";

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [claimsHistory, setClaimsHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // 🟢 2. USE 'api.get' AND REMOVE HEADERS
        const profileResponse = await api.get("/claims/user/details");
        setProfile(profileResponse.data);

        // 🟢 3. USE 'api.get' AND REMOVE HEADERS
        const claimsResponse = await api.get("/claims/history");

        const sortedClaims = claimsResponse.data.sort((a, b) => a.id - b.id);
        setClaimsHistory(sortedClaims);
      } catch (err) {
        setError("Failed to load profile data. The session may have expired.");
        console.error("Profile fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handlePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      // 🟢 4. USE 'api.post' AND REMOVE HEADERS
      const response = await api.post("/claims/profile-picture", formData);

      setProfile((prevProfile) => ({
        ...prevProfile,
        profilePictureUrl: response.data,
      }));
    } catch (err) {
      console.error("Profile picture upload failed:", err);
      const status = err.response ? err.response.status : "Network";
      setError(`Upload failed. Status: ${status}. Check server logs.`);
    }
  };

  const handleViewDetailsClick = (claimId) => {
    navigate(`/claim/${claimId}`);
  };

  if (isLoading)
    return (
      <div className="loading-spinner">
        <h2>Loading Your Profile...</h2>
      </div>
    );
  if (error && !profile) return <div className="error-message">{error}</div>;
  if (!profile)
    return <div className="container">Could not find profile information.</div>;

  // Determine the image source
  const imagePath =
    profile.profilePictureUrl && profile.profilePictureUrl.trim() !== ""
      ? profile.profilePictureUrl
      : DEFAULT_AVATAR;
  const imageSource = imagePath.startsWith("/")
    ? `http://localhost:8080${imagePath}`
    : imagePath;

  // --- Render ---
  return (
    <div className="internal-page-wrapper">
      <div className="profile-container">
        <h1>My Profile 👤</h1>

        {/* --- 🚀 UPDATED: PROFILE PICTURE UPLOAD SECTION (FLOATING BUTTON) --- */}
        <div className="profile-avatar-area">
          <div
            className="profile-avatar-wrapper"
            style={{ position: "relative", width: "130px", margin: "0 auto" }}
          >
            <img
              src={imageSource}
              alt="Profile"
              className="profile-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_AVATAR;
              }}
              // Removed onClick on image to prevent accidental clicks
            />
            {/* 📸 Floating Edit Button */}
            <button
              onClick={() => fileInputRef.current.click()}
              className="edit-avatar-btn"
              title="Change Picture"
            >
              📷
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/png, image/jpeg, image/jpg"
            onChange={handlePictureUpload}
          />

          {error && (
            <div className="error-message" style={{ marginTop: "10px" }}>
              {error}
            </div>
          )}
        </div>
        {/* --- END PROFILE PICTURE SECTION --- */}

        {/* 👇 --- 🚀 UPDATED: GLASS IDENTITY CARD SECTION --- 👇 */}
        <div className="user-info">
          <div className="user-info-item">
            <span className="info-label">FULL NAME</span>
            <span className="info-value">{profile.name}</span>
          </div>
          <div className="user-info-item">
            <span className="info-label">EMAIL ADDRESS</span>
            <span className="info-value">{profile.email}</span>
          </div>
        </div>
        {/* 👆 --- END OF UPDATED SECTION --- 👆 */}

        <div className="claims-history-section">
          <h2>My Claims History</h2>
          {claimsHistory.length > 0 ? (
            <div className="claims-table-wrapper">
              <table className="claims-table">
                <thead>
                  <tr>
                    <th>Claim ID</th>
                    <th>Vehicle</th>
                    <th>Date Submitted</th>
                    <th>Status</th>
                    <th>Est. Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {claimsHistory.map((claim, index) => (
                    <tr key={claim.id}>
                      <td data-label="Claim ID">#{index + 1}</td>
                      <td data-label="Vehicle">
                        {claim.vehicleMakeModel || "N/A"}
                        {claim.vehicleRegistrationNumber
                          ? ` (${claim.vehicleRegistrationNumber})`
                          : ""}
                      </td>
                      <td data-label="Date Submitted">
                        {new Date(claim.createdAt).toLocaleDateString()}
                      </td>

                      {/* 🚀 UPDATED: STATUS BADGE */}
                      {/* Inside your ProfilePage map loop */}
                      <td>
                        {/* 🟢 LOGIC: If it says 'ANALYZED', show 'Waiting for Admin'. If 'APPROVED', show 'Approved' */}
                        <span
                          className={`status-badge ${
                            claim.status === "CLAIM_APPROVED"
                              ? "status-success" // If Approved -> Green
                              : claim.status === "CLAIM_REJECTED"
                              ? "status-danger" // If Rejected -> Red
                              : "status-warning" // Everything else -> Yellow
                          }`}
                        >
                          {claim.status === "CLAIM_APPROVED"
                            ? " Approved"
                            : claim.status === "CLAIM_REJECTED"
                            ? " Rejected"
                            : claim.status.includes("ANALYZED")
                            ? " Waiting for Approval"
                            : "⏳ Processing"}
                        </span>
                      </td>

                      <td data-label="Est. Total" className="currency">
                        {formatCurrency(claim.estimatedTotal)}
                      </td>
                      <td data-label="Action">
                        <button
                          onClick={() => handleViewDetailsClick(claim.id)}
                          className="view-details-link"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>You have not submitted any claims yet.</p>
          )}
        </div>

        <div className="new-claim-section">
          <Link to="/new-claim" className="new-claim-button">
            File a New Claim
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
