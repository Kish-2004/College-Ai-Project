import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../../api/api";

import "../../App.css"; // Global styles for layout
import "./HomePage.css"; // Dedicated styles for this form

// --- Helper Components ---
const formatCurrency = (value) => `Rs. ${Number(value).toFixed(2)}`;

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// 🟢 NEW: Helper component for the warning banner
const MultipleClaimsBanner = ({ claimCount }) => {
  if (claimCount === 1) {
    // This is the 2nd claim (1 previous)
    return (
      <div className="banner-message warning">
        <strong>⚠️ This is your 2nd claim within 1 year.</strong>
        <p>
          Please note: Your claim amount may be reduced as per your policy's
          multiple claim clause.
        </p>
      </div>
    );
  }
  if (claimCount >= 2) {
    // This is the 3rd+ claim (2+ previous)
    return (
      <div className="banner-message danger">
        <strong>❗ You have submitted {claimCount} claims this year.</strong>
        <p>
          Insurance coverage for this claim will be significantly reduced as per
          policy terms.
        </p>
      </div>
    );
  }
  // 0 previous claims, show nothing
  return null;
};
// 🟢 NEW: Simple Heatmap Component
const CarHeatmap = ({ lineItems }) => {
  // Check if a part exists in the line items to color it red
  const isDamaged = (partName) =>
    lineItems.some((item) => item.part.toLowerCase().includes(partName));

  return (
    <div
      className="heatmap-container"
      style={{ textAlign: "center", marginTop: "20px" }}
    >
      <h4>🚗 Damage Heatmap</h4>
      <svg
        width="200"
        height="300"
        viewBox="0 0 200 300"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body Outline */}
        <rect
          x="50"
          y="20"
          width="100"
          height="260"
          rx="15"
          fill="#e0e0e0"
          stroke="#333"
          strokeWidth="2"
        />
        {/* Windscreen */}
        <path
          d="M 60 80 Q 100 70 140 80 L 140 110 Q 100 100 60 110 Z"
          fill={isDamaged("windscreen") ? "#ff4d4d" : "#87CEEB"}
          stroke="black"
        />
        {/* Hood/Bonnet */}
        <path
          d="M 55 25 Q 100 15 145 25 L 145 75 Q 100 65 55 75 Z"
          fill={isDamaged("bonnet") || isDamaged("hood") ? "#ff4d4d" : "white"}
          stroke="black"
        />
        {/* Bumper (Front) */}
        <path
          d="M 50 20 Q 100 10 150 20 L 150 40 Q 100 30 50 40 Z"
          fill={isDamaged("bumper") ? "#ff4d4d" : "#ccc"}
          stroke="black"
        />
        {/* Doors (Simplified) */}
        <rect
          x="52"
          y="120"
          width="10"
          height="60"
          fill={isDamaged("door") ? "#ff4d4d" : "white"}
          stroke="black"
        />
        <rect
          x="138"
          y="120"
          width="10"
          height="60"
          fill={isDamaged("door") ? "#ff4d4d" : "white"}
          stroke="black"
        />
      </svg>
      <p style={{ fontSize: "0.8rem", color: "#666" }}>
        Red areas indicate detected damage.
      </p>
    </div>
  );
};

// --- The Main Component ---
function HomePage() {
  const [step, setStep] = useState(1);
  const [claimId, setClaimId] = useState(null);
  const [userClaimCount, setUserClaimCount] = useState(0); // 🟢 This will be fetched
  const [claimDetails, setClaimDetails] = useState({
    // IDs
    vin: "",
    make: "",
    model: "",
    // Vehicle & Incident
    vehicleRegistrationNumber: "",
    vehicleMakeModel: "",
    yearOfManufacture: "",
    fuelType: "Petrol",
    odometerReading: "",
    chassisNumber: "",
    engineNumber: "",
    dateOfIncident: "",
    // 🟢 NEW FIELDS ADDED
    location: "",
    claimReason: "",
    // 🟢 END NEW FIELDS
    incidentDescription: "",
    // Owner
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    aadharNumber: "",
    drivingLicenseNumber: "",
    address: "",
    // Insurance & Repair
    insuranceCompany: "",
    policyNumber: "",
    policyExpiryDate: "",
    claimNumber: "",
    isFirFiled: false,
    firNumber: "",
    preferredGarage: "",
    needsPickup: false,
    urgency: "Medium",
    budgetEstimate: "",
    insuredDeclaredValue: "",
    hasZeroDepreciationCover: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // This useEffect fetches the user's past claim count on component load
  useEffect(() => {
    const fetchClaimCount = async () => {
      try {
        // This endpoint returns the UserDto, which includes the list of claim IDs
        const response = await api.get("/claims/user/details");

        // The count is the length of the claimIds array
        const count = response.data.claimIds
          ? response.data.claimIds.length
          : 0;
        setUserClaimCount(count);
      } catch (e) {
        console.error("Failed to fetch user claim count:", e);
        // Don't block the user, just default to 0
        setUserClaimCount(0);
      }
    };
    fetchClaimCount();
  }, []); // Runs once on component mount

  // This is the user-facing ID (e.g., "Your 1st Claim", "Your 2nd Claim")
  const nextClaimDisplayId = userClaimCount + 1;

  const handleDetailChange = (event) => {
    const { name, value, type, checked } = event.target;
    setClaimDetails((prevDetails) => ({
      ...prevDetails,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDetailsSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // The claimDetails state now includes location and claimReason,
      // so they are sent automatically.
      const response = await api.post("/claims", claimDetails);
      setClaimId(response.data.id); // Save the REAL claim ID from backend
      setStep(2); // Move to Step 2
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        "Failed to save details. Please check all fields and try again.";
      setError(errorMsg);
      console.error("Claim creation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file (png, jpg, jpeg).");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  const handleImageSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please select an image file first.");
      return;
    }
    if (!claimId) {
      setError("Claim ID is missing. Please go back to Step 1.");
      return;
    } // Safety check

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      // Use the real claimId from the backend response
      const response = await api.post(`/claims/${claimId}/estimate`, formData);
      setResult(response.data);
    } catch (err) {
      setError("An error occurred during image analysis. Please try again.");
      console.error("Image submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePdfReport = () => {
    if (!result) return;
    const doc = new jsPDF();
    const { analysis, estimate } = result;
    const { vehicleRegistrationNumber, vehicleMakeModel, firstName, lastName } =
      claimDetails;

    // Use the user-facing display ID
    const displayClaimId = nextClaimDisplayId;

    doc.setFontSize(22);
    doc.setFont(undefined, "bold");
    doc.text("AI Damage Analysis Report", 105, 20, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(15, 25, 195, 25);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    doc.text(`Claim ID (User-Specific): #${displayClaimId}`, 15, 32);
    doc.text(`Real Claim ID (Internal): #${claimId}`, 15, 37); // Show real ID in report

    doc.text(
      `Vehicle: ${vehicleMakeModel} (${vehicleRegistrationNumber})`,
      15,
      42
    );
    doc.text(`Client: ${firstName} ${lastName}`, 15, 47);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 195, 32, {
      align: "right",
    });

    autoTable(doc, {
      startY: 55,
      head: [["Metric", "Result"]],
      body: [
        ["Damage Detected", analysis.isDamaged ? "Yes" : "No"],
        [
          "Detection Confidence",
          `${(analysis.damageConfidence * 100).toFixed(2)}%`,
        ],
        ["Estimated Severity", analysis.damageSeverity.severityLabel],
        [
          { content: "Total Estimated Cost", styles: { fontStyle: "bold" } },
          {
            content: formatCurrency(estimate.total),
            styles: { fontStyle: "bold" },
          },
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: "#2c3e50" },
    });
    const lastTableY = doc.lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.text("Visual Evidence", 15, lastTableY + 15);
    const imgData = `data:image/jpeg;base64,${analysis.plottedImage}`;
    doc.addImage(
      imgData,
      "JPEG",
      15,
      lastTableY + 20,
      180,
      100,
      undefined,
      "FAST"
    );
    doc.addPage();
    doc.setFontSize(18);
    doc.text("Detailed Cost Breakdown", 15, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Part", "Damage Type", "Recommended Action", "Estimated Amount"]],
      body: estimate.lineItems.map((item) => [
        item.part,
        item.damageType,
        item.action,
        formatCurrency(item.amount),
      ]),
      theme: "striped",
      headStyles: { fillColor: "#2c3e50" },
      didDrawPage: (data) => {
        const finalY = data.cursor.y;
        doc.setFontSize(12);
        doc.text(
          `Subtotal: ${formatCurrency(estimate.subtotal)}`,
          data.settings.margin.left,
          finalY + 10
        );
        doc.setFont(undefined, "bold");
        doc.text(
          `Total (incl. Tax): ${formatCurrency(estimate.total)}`,
          data.settings.margin.left,
          finalY + 17
        );
      },
    });
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, 195, 290, { align: "right" });
      doc.text("Report generated by AI Estimator", 15, 290);
    }
    doc.save(`Damage-Report-${claimId}.pdf`);
  };

  const renderResults = () => {
    if (!result) return null;
    const { analysis, estimate } = result;
    const hasDamage =
      (estimate.lineItems && estimate.lineItems.length > 0) ||
      estimate.total > 0;
    return (
      <div className="report-container">
        {/* 🟢 NEW: Immediate Status Message */}
        <div
          className="banner-message warning"
          style={{ textAlign: "center", borderLeft: "5px solid #ffc107" }}
        >
          <strong>✅ AI Analysis Successful!</strong>
          <p>
            Your claim estimate has been generated. Please wait for an Admin to
            verify and approve this claim.
          </p>
        </div>
        <div className="report-header">
          {/* Use the user-facing display ID here */}
          <h2>Analysis & Cost Estimate for Claim ID: #{nextClaimDisplayId}</h2>
          <button onClick={generatePdfReport} className="download-pdf-button">
            Download PDF Report
          </button>
        </div>
        <div className="summary-grid">
          <div className="summary-card total-cost-card">
            <span className="card-title">Total Estimated Cost</span>
            <span className="card-value large-value">
              {formatCurrency(estimate.total)}
            </span>
          </div>
          <div className="summary-card">
            <span className="card-title">Damage Severity</span>
            <span
              className={`card-value severity-${analysis.damageSeverity.severityLabel.toLowerCase()}`}
            >
              {analysis.damageSeverity.severityLabel}
            </span>
          </div>
          <div className="summary-card">
            <span className="card-title">Damage Detected</span>
            <span className="card-value">{hasDamage ? "Yes" : "No"}</span>
          </div>
          <div className="summary-card">
            <span className="card-title">Detection Confidence</span>
            <span className="card-value">
              {(analysis.damageConfidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="main-content-grid">
          <div className="report-card visual-evidence-card">
            <h3>Visual Evidence</h3>
            <img
              src={`data:image/jpeg;base64,${analysis.plottedImage}`}
              alt="Vehicle with damage detections"
            />
            <CarHeatmap lineItems={estimate.lineItems} />
          </div>
          <div className="report-card breakdown-card">
            <h3>Detailed Cost Breakdown</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Part</th>
                  <th>Damage Type</th>
                  <th>Action</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {estimate.lineItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.part}</td>
                    <td>{item.damageType}</td>
                    <td>{item.action}</td>
                    <td>{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Find the "report-totals" div inside renderResults and replace it with this: */}

            <div className="report-totals">
              <p>
                <span>Subtotal (Parts & Labor):</span>
                <span>{formatCurrency(estimate.subtotal)}</span>
              </p>
              <p>
                <span>Tax (18% GST):</span>
                <span>{formatCurrency(estimate.tax)}</span>
              </p>

              {/* 🟢 LOGIC: Only show this section if a deduction exists */}
              {estimate.deductionAmount > 0 && (
                <>
                  <p
                    className="original-total-row"
                    style={{ textDecoration: "line-through", color: "#888" }}
                  >
                    <span>Original Estimate:</span>
                    <span>{formatCurrency(estimate.originalTotal)}</span>
                  </p>
                  <p
                    className="deduction-row"
                    style={{ color: "#d9534f", fontWeight: "bold" }}
                  >
                    <span>⚠️ {estimate.deductionReason}:</span>
                    <span>- {formatCurrency(estimate.deductionAmount)}</span>
                  </p>
                  <hr
                    style={{ margin: "10px 0", borderTop: "1px solid #ccc" }}
                  />
                </>
              )}

              <p
                className="total-row"
                style={{ fontSize: "1.4em", color: "#2c3e50" }}
              >
                <span>Final Payable Amount:</span>
                <span>{formatCurrency(estimate.total)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- MAIN RENDER ---
  return (
    <div className="internal-page-wrapper">
      <h1 className="app-header-title">🤖AI Vehicle Damage Estimator</h1>

      {/* 🟢 NEW: RENDER THE BANNER HERE. It will show nothing if claimCount is 0 */}
      <MultipleClaimsBanner claimCount={userClaimCount} />

      {step === 1 ? (
        // --- STEP 1: DETAILS FORM ---
        <form
          onSubmit={handleDetailsSubmit}
          className="details-form large-form"
        >
          <h2>Step 1: Provide Claim Details (Claim #{nextClaimDisplayId})</h2>

          <fieldset>
            <legend>🚗 Vehicle & Damage Details</legend>
            <input
              name="vin"
              value={claimDetails.vin}
              onChange={handleDetailChange}
              placeholder="Vehicle Identification Number (VIN)"
              required
            />
            <input
              name="make"
              value={claimDetails.make}
              onChange={handleDetailChange}
              placeholder="Vehicle Make (e.g., Toyota)"
              required
            />
            <input
              name="model"
              value={claimDetails.model}
              onChange={handleDetailChange}
              placeholder="Vehicle Model (e.g., Camry)"
              required
            />
            <input
              name="vehicleRegistrationNumber"
              value={claimDetails.vehicleRegistrationNumber}
              onChange={handleDetailChange}
              placeholder="Vehicle Registration Number"
              required
            />
            <input
              name="vehicleMakeModel"
              value={claimDetails.vehicleMakeModel}
              onChange={handleDetailChange}
              placeholder="Vehicle Make & Model (e.g. Toyota Camry)"
              required
            />
            <input
              name="yearOfManufacture"
              type="number"
              value={claimDetails.yearOfManufacture}
              onChange={handleDetailChange}
              placeholder="Year of Manufacture"
              required
            />
            <select
              name="fuelType"
              value={claimDetails.fuelType}
              onChange={handleDetailChange}
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
            </select>
            <input
              name="odometerReading"
              type="number"
              value={claimDetails.odometerReading}
              onChange={handleDetailChange}
              placeholder="Odometer Reading (in km)"
              required
            />
            <input
              name="chassisNumber"
              value={claimDetails.chassisNumber}
              onChange={handleDetailChange}
              placeholder="Chassis Number (optional)"
            />
            <input
              name="engineNumber"
              value={claimDetails.engineNumber}
              onChange={handleDetailChange}
              placeholder="Engine Number (optional)"
            />
            <label>
              Date of Incident:{" "}
              <input
                name="dateOfIncident"
                type="date"
                value={claimDetails.dateOfIncident}
                onChange={handleDetailChange}
                required
              />
            </label>

            {/* 🟢 NEW FIELDS ADDED HERE FOR LOGICAL GROUPING */}
            <input
              name="location"
              value={claimDetails.location}
              onChange={handleDetailChange}
              placeholder="Incident Location (City/Highway)"
              required
            />
            <textarea
              name="claimReason"
              value={claimDetails.claimReason}
              onChange={handleDetailChange}
              placeholder="Reason for Claim (e.g., Self-accident, Rear-ended)"
              required
            />
            {/* 🟢 END NEW FIELDS */}

            <textarea
              name="incidentDescription"
              value={claimDetails.incidentDescription}
              onChange={handleDetailChange}
              placeholder="Brief Description of Incident"
              required
            />
          </fieldset>

          <fieldset>
            <legend>👤 Owner Details</legend>
            <input
              name="firstName"
              value={claimDetails.firstName}
              onChange={handleDetailChange}
              placeholder="First Name"
              required
            />
            <input
              name="lastName"
              value={claimDetails.lastName}
              onChange={handleDetailChange}
              placeholder="Last Name"
              required
            />
            <input
              name="mobileNumber"
              value={claimDetails.mobileNumber}
              onChange={handleDetailChange}
              placeholder="Mobile Number"
              required
            />
            <input
              name="email"
              type="email"
              value={claimDetails.email}
              onChange={handleDetailChange}
              placeholder="Email Address"
              required
            />
            <input
              name="aadharNumber"
              value={claimDetails.aadharNumber}
              onChange={handleDetailChange}
              placeholder="Aadhaar Number"
              required
            />
            <input
              name="drivingLicenseNumber"
              value={claimDetails.drivingLicenseNumber}
              onChange={handleDetailChange}
              placeholder="Driving License Number (optional)"
            />
            <textarea
              name="address"
              value={claimDetails.address}
              onChange={handleDetailChange}
              placeholder="Address"
              required
            />
          </fieldset>

          <fieldset>
            <legend>📄 Insurance Information</legend>
            <input
              name="insuranceCompany"
              value={claimDetails.insuranceCompany}
              onChange={handleDetailChange}
              placeholder="Insurance Company Name"
            />
            <input
              name="policyNumber"
              value={claimDetails.policyNumber}
              onChange={handleDetailChange}
              placeholder="Policy Number"
            />
            <label>
              Policy Expiry Date:{" "}
              <input
                name="policyExpiryDate"
                type="date"
                value={claimDetails.policyExpiryDate}
                onChange={handleDetailChange}
              />
            </label>
            <input
              name="claimNumber"
              value={claimDetails.claimNumber}
              onChange={handleDetailChange}
              placeholder="Claim Number (if already filed)"
            />
            <label>
              <input
                name="isFirFiled"
                type="checkbox"
                checked={claimDetails.isFirFiled}
                onChange={handleDetailChange}
              />{" "}
              Is FIR Filed?
            </label>
            {claimDetails.isFirFiled && (
              <input
                name="firNumber"
                value={claimDetails.firNumber}
                onChange={handleDetailChange}
                placeholder="FIR Number"
              />
            )}
            <input
              name="insuredDeclaredValue"
              type="number"
              value={claimDetails.insuredDeclaredValue}
              onChange={handleDetailChange}
              placeholder="Insured Declared Value (IDV) e.g., 500000"
              required
            />
            <div
              className="toggle-container"
              style={{
                gridColumn: "1 / -1",
                background: "#e3f2fd",
                padding: "15px",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                gap: "15px",
              }}
            >
              <label
                className="switch"
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "50px",
                  height: "26px",
                }}
              >
                <input
                  type="checkbox"
                  name="hasZeroDepreciationCover"
                  checked={claimDetails.hasZeroDepreciationCover}
                  onChange={handleDetailChange}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  className="slider round"
                  style={{
                    position: "absolute",
                    cursor: "pointer",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: claimDetails.hasZeroDepreciationCover
                      ? "#2196f3"
                      : "#ccc",
                    borderRadius: "34px",
                    transition: ".4s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      content: '""',
                      height: "18px",
                      width: "18px",
                      left: claimDetails.hasZeroDepreciationCover
                        ? "26px"
                        : "4px",
                      bottom: "4px",
                      backgroundColor: "white",
                      borderRadius: "50%",
                      transition: ".4s",
                    }}
                  ></span>
                </span>
              </label>
              <span style={{ fontWeight: "bold", color: "#0d47a1" }}>
                🛡️ Enable Zero Depreciation Cover? (Get 100% on Parts)
              </span>
            </div>
          </fieldset>

          <fieldset>
            <legend>🛠️ Repair Preferences</legend>
            <input
              name="preferredGarage"
              value={claimDetails.preferredGarage}
              onChange={handleDetailChange}
              placeholder="Preferred Garage/Service Center"
            />
            <label>
              <input
                name="needsPickup"
                type="checkbox"
                checked={claimDetails.needsPickup}
                onChange={handleDetailChange}
              />{" "}
              Need Pickup Service?
            </label>
            <label>
              Urgency:
              <select
                name="urgency"
                value={claimDetails.urgency}
                onChange={handleDetailChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>
            <input
              name="budgetEstimate"
              type="number"
              value={claimDetails.budgetEstimate}
              onChange={handleDetailChange}
              placeholder="Budget Estimate (if any)"
            />
          </fieldset>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Next: Upload Image"}
          </button>
        </form>
      ) : (
        // --- STEP 2: IMAGE UPLOAD ---
        <div className="upload-form">
          <h2>
            Step 2: Upload Damaged Vehicle Image (Claim #{nextClaimDisplayId})
          </h2>
          <form onSubmit={handleImageSubmit} className="upload-container">
            <input
              type="file"
              id="fileUpload"
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg"
            />
            <label htmlFor="fileUpload" className="file-drop-zone">
              <div className="file-drop-zone-text">
                <UploadIcon />
                <span>
                  {selectedFile
                    ? "Image Ready for Upload!"
                    : "Click to browse or drag & drop image"}
                </span>
              </div>
            </label>
            {selectedFile && (
              <div className="file-name-preview">
                Selected File: {selectedFile.name}
              </div>
            )}
            {error && <p className="error-message">{error}</p>}
            <button
              type="submit"
              className="estimate-button"
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? "Analyzing..." : "Get Estimate"}
            </button>
          </form>

          {/* Results will render here once 'result' state is set */}
          {renderResults()}
        </div>
      )}
    </div>
  );
}

export default HomePage;
