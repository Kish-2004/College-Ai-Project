import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../../App.css";
import "./ClaimDetailPage.css";
import axios from "axios";

// --- Helper Functions ---
const formatDate = (dateString) =>
  dateString ? new Date(dateString).toLocaleDateString() : "N/A";
const formatDateTime = (dateString) =>
  dateString ? new Date(dateString).toLocaleString() : "N/A";
const formatValue = (value, prefix = "", suffix = "") =>
  value != null && value !== "" ? `${prefix}${value}${suffix}` : "N/A";
const formatCurrency = (value) => `₹${Number(value).toFixed(2)}`;
const formatCurrencyPdf = (value) => `INR ${Number(value).toFixed(2)}`;
// Calculates subtotal (pre-tax) assuming an 8% tax rate (1.08 factor)
const getSubtotal = (total, taxRate = 1.08) =>
  (Number(total) / taxRate).toFixed(2);

// 🟢 NEW: Heatmap Component (Copy from HomePage)
const CarHeatmap = ({ lineItems }) => {
  const isDamaged = (partName) =>
    lineItems &&
    lineItems.some((item) => item.part.toLowerCase().includes(partName));
  return (
    <div
      className="heatmap-container"
      style={{ textAlign: "center", marginTop: "20px", padding: "10px" }}
    >
      <h4 style={{ color: "#2c3e50", marginBottom: "10px" }}>
        🚗 Damage Heatmap
      </h4>
      <svg
        width="120"
        height="200"
        viewBox="0 0 200 300"
        xmlns="http://www.w3.org/2000/svg"
      >
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
        <path
          d="M 60 80 Q 100 70 140 80 L 140 110 Q 100 100 60 110 Z"
          fill={isDamaged("windscreen") ? "#ff4d4d" : "#87CEEB"}
          stroke="black"
        />
        <path
          d="M 55 25 Q 100 15 145 25 L 145 75 Q 100 65 55 75 Z"
          fill={isDamaged("bonnet") || isDamaged("hood") ? "#ff4d4d" : "white"}
          stroke="black"
        />
        <path
          d="M 50 20 Q 100 10 150 20 L 150 40 Q 100 30 50 40 Z"
          fill={isDamaged("bumper") ? "#ff4d4d" : "#ccc"}
          stroke="black"
        />
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
    </div>
  );
};
function ClaimDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClaimDetails = async () => {
      if (!id) return;
      // ❌ DELETE THIS LINE:
      // const token = getToken();
      try {
        const response = await api.get(`/claims/${id}`);

        // 🟢 THIS IS THE FIX:
        setClaim(response.data); // Use setClaim, not setClaimDetails
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          (err.response?.status === 403 || err.response?.status === 401)
        ) {
          // ... (rest of your error handling is fine)
          console.error(
            "Authorization Error (401/403):",
            err.response?.data || err.response?.statusText
          );
          setError(
            "Your session has expired or you lack permission. Redirecting to login..."
          );
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setError(
            "Failed to load claim details. Check network or ensure you have permission to view this claim."
          );
          console.error("Fetch claim detail error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchClaimDetails();
  }, [id, navigate]);
  // --- PDF Generation Logic ---
  const generatePdfReport = () => {
    // ... (PDF generation code remains the same) ...
    if (
      !claim ||
      claim.status !== "ANALYSIS_COMPLETE" ||
      !claim.lineItems ||
      claim.lineItems.length === 0
    ) {
      console.error("Report data is incomplete or analysis is pending.");
      return;
    }

    const analysis = claim.analysisResponse || {};
    const estimate = {
      total: Number(claim.estimatedTotal || 0),
      lineItems: claim.lineItems,
    };
    const subtotalValue = getSubtotal(estimate.total);
    const hasDamage =
      (estimate.lineItems && estimate.lineItems.length > 0) ||
      estimate.total > 0;

    const doc = new jsPDF();
    const { vehicleRegistrationNumber, vehicleMakeModel, firstName, lastName } =
      claim;

    doc.setFontSize(22);
    doc.setFont(undefined, "bold");
    doc.text("AI Damage Analysis Report", 105, 20, { align: "center" });
    doc.setLineWidth(0.5);
    doc.line(15, 25, 195, 25);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    doc.text(`Claim ID (Global): #${claim.id}`, 15, 32);
    doc.text(
      `Vehicle: ${vehicleMakeModel || "N/A"} (${
        vehicleRegistrationNumber || "N/A"
      })`,
      15,
      37
    );
    doc.text(
      `Client: ${formatValue(firstName)} ${formatValue(lastName)}`,
      15,
      42
    );
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 195, 32, {
      align: "right",
    });

    // --- Summary Table ---
    autoTable(doc, {
      startY: 50,
      head: [["Metric", "Result"]],
      body: [
        // FIX 2: Use the reliable 'hasDamage' variable
        ["Damage Detected", hasDamage ? "Yes" : "No"],
        [
          "Detection Confidence",
          analysis.damageConfidence
            ? `${(analysis.damageConfidence * 100).toFixed(2)}%`
            : "N/A",
        ],
        ["Estimated Severity", analysis.damageSeverity?.severityLabel || "N/A"],
        // FIX 1: Use PDF-safe currency format
        [
          { content: "Total Estimated Cost", styles: { fontStyle: "bold" } },
          {
            content: formatCurrencyPdf(estimate.total),
            styles: { fontStyle: "bold" },
          },
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: "#2c3e50" },
    });

    const lastTableY = doc.lastAutoTable.finalY;

    // --- Visual Evidence ---
    if (analysis.plottedImage) {
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
    }

    // --- Detailed Breakdown Table ---
    doc.setFontSize(18);
    doc.text("Detailed Cost Breakdown", 15, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Part", "Damage Type", "Recommended Action", "Estimated Amount"]],
      // FIX 1: Use PDF-safe currency format
      body: estimate.lineItems.map((item) => [
        item.part,
        item.damageType,
        item.action,
        formatCurrencyPdf(item.amount),
      ]),
      theme: "striped",
      headStyles: { fillColor: "#2c3e50" },
      didDrawPage: (data) => {
        const finalY = data.cursor.y;
        doc.setFontSize(12);
        // FIX 1: Use PDF-safe currency format
        doc.text(
          `Subtotal (Pre-Tax): ${formatCurrencyPdf(subtotalValue)}`,
          data.settings.margin.left,
          finalY + 10
        );
        doc.setFont(undefined, "bold");
        // FIX 1: Use PDF-safe currency format
        doc.text(
          `Grand Total (inc. Tax): ${formatCurrencyPdf(estimate.total)}`,
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
    doc.save(`Damage-Report-Claim-${claim.id}.pdf`);
  };

  // --- Report Rendering Component ---
  const renderReportSection = () => {
    // 🟢 FIX 1: Add 'LIMITED_CLAIM_ANALYZED' to this list so the report shows up
    const completeStatuses = [
      "ANALYSIS_COMPLETE",
      "FIRST_CLAIM_ANALYZED",
      "LIMITED_CLAIM_ANALYZED",
      "CLAIM_APPROVED",
      "CLAIM_REJECTED",
    ];

    if (
      !completeStatuses.includes(claim.status) ||
      !claim.lineItems ||
      claim.lineItems.length === 0
    ) {
      return (
        <div className="detail-section mt-8">
          <h3>Report Status</h3>
          <p>
            Analysis is not yet complete for this claim. Status:{" "}
            <strong>{claim.status || "PENDING"}</strong>
          </p>
        </div>
      );
    }

    const analysis = claim.analysisResponse || {};

    // 🟢 FIX 2: Calculate Deduction Logic for Display
    // Since the backend sends the FINAL total, we reverse-calculate for display if it's a limited claim.
    let finalTotal = Number(claim.estimatedTotal);
    let originalTotal = finalTotal;
    let deductionAmount = 0;
    let isLimited = claim.status.includes("LIMITED");

    if (isLimited) {
      // If 50% deduction was applied, the Original was double the Final
      originalTotal = finalTotal * 2;
      deductionAmount = finalTotal; // 50% of original is equal to the final
    }

    // Helper to calculate subtotal from the Original amount (to match the math)
    const subtotalValue = getSubtotal(originalTotal);
    const hasDamage =
      (claim.lineItems && claim.lineItems.length > 0) || finalTotal > 0;

    return (
      <div className="report-container">
        <div
          style={{
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "8px",
            textAlign: "center",
            fontWeight: "bold",
            backgroundColor:
              claim.status === "CLAIM_APPROVED"
                ? "#d4edda"
                : claim.status === "CLAIM_REJECTED"
                ? "#f8d7da"
                : "#fff3cd",
            color:
              claim.status === "CLAIM_APPROVED"
                ? "#155724"
                : claim.status === "CLAIM_REJECTED"
                ? "#721c24"
                : "#856404",
          }}
        >
          {claim.status === "CLAIM_APPROVED" &&
            "🎉 CLAIM APPROVED! Our team has verified your report. Payment is processing."}
          {claim.status === "CLAIM_REJECTED" &&
            "❌ CLAIM REJECTED. Please contact support for details."}
          {!claim.status.includes("APPROVED") &&
            !claim.status.includes("REJECTED") &&
            "⏳ AI Analysis Complete. Please wait for Admin/Company verification for final approval."}
        </div>
        <div className="report-header">
          <h2>📊 Analysis & Cost Estimate</h2>
          <button onClick={generatePdfReport} className="download-pdf-button">
            Download PDF Report
          </button>
        </div>

        <div className="summary-grid">
          <div className="summary-card total-cost-card">
            <span className="card-title">Total Estimated Cost</span>
            <span className="card-value large-value">
              {formatCurrency(finalTotal)}
            </span>
          </div>
          <div className="summary-card">
            <span className="card-title">Damage Severity</span>
            <span
              className={`card-value severity-${
                analysis.damageSeverity?.severityLabel?.toLowerCase() || "n-a"
              }`}
            >
              {analysis.damageSeverity?.severityLabel || "N/A"}
            </span>
          </div>
          <div className="summary-card">
            <span className="card-title">Damage Detected</span>
            <span className="card-value">{hasDamage ? "Yes" : "No"}</span>
          </div>
          <div className="summary-card">
            <span className="card-title">Detection Confidence</span>
            <span className="card-value">
              {analysis.damageConfidence
                ? `${(analysis.damageConfidence * 100).toFixed(1)}%`
                : "N/A"}
            </span>
          </div>
        </div>

        <div className="main-content-grid">
          {analysis.plottedImage && (
            <div className="report-card visual-evidence-card">
              <h3>Visual Evidence</h3>
              <img
                src={`data:image/jpeg;base64,${analysis.plottedImage}`}
                alt="Vehicle with damage detections"
              />
              <CarHeatmap lineItems={claim.lineItems} />
            </div>
          )}

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
                {claim.lineItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.part}</td>
                    <td>{item.damageType}</td>
                    <td>{item.action}</td>
                    <td>{formatCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 🟢 FIX 3: Enhanced Totals Section (Matches HomePage CSS) */}
            <div className="report-totals">
              <p>
                <span>Subtotal (Parts & Labor):</span>
                <span>{formatCurrency(subtotalValue)}</span>
              </p>
              <p>
                <span>Tax (18% GST):</span>
                <span>{formatCurrency(originalTotal - subtotalValue)}</span>
              </p>

              {/* Show Deduction Box if Limited */}
              {isLimited && (
                <>
                  <p className="original-total-row">
                    <span>Original Estimate:</span>
                    <span>{formatCurrency(originalTotal)}</span>
                  </p>
                  <p className="deduction-row">
                    <span>⚠️ 50% Deduction (Policy Limit):</span>
                    <span>- {formatCurrency(deductionAmount)}</span>
                  </p>
                </>
              )}

              <p className="total-row">
                <span>Final Payable Amount:</span>
                <span>{formatCurrency(finalTotal)}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Main Render Function ---

  if (isLoading)
    return (
      <div className="loading-spinner">
        <h2>Loading Claim Details...</h2>
      </div>
    );
  if (error) return <div className="error-message">{error}</div>;
  if (!claim)
    return <div className="container">No data found for this claim.</div>;

  const vehicleDisplay = `${claim.vehicleMakeModel || "N/A"}${
    claim.vehicleRegistrationNumber
      ? ` (${claim.vehicleRegistrationNumber})`
      : ""
  }`;

  return (
    // 🚨 WRAPPER FIX: Claim Detail Page uses the standard centered layout
    <div className="internal-page-wrapper">
      <div className="claim-detail-container">
        <Link to="/profile" className="back-link">
          ← Back to My Profile
        </Link>
        <h1>Details for Claim #{claim.id}</h1>
        <p className="claim-meta">
          Submitted on {formatDateTime(claim.createdAt)} | Status:
          <span
            className={`status-badge ${
              claim.status === "CLAIM_APPROVED"
                ? "status-success"
                : claim.status === "CLAIM_REJECTED"
                ? "status-danger"
                : "status-warning"
            }`}
          >
            {/* Optional: Clean up the text to remove underscores */}
            {claim.status.replace(/_/g, " ")}
          </span>
        </p>

        {renderReportSection()}

        <div className="detail-section">
          <h3>🚗 Vehicle & Incident Information</h3>
          <div className="detail-grid-large">
            <p>
              <strong>Vehicle:</strong> {vehicleDisplay}
            </p>
            <p>
              <strong>Year:</strong> {formatValue(claim.yearOfManufacture)}
            </p>
            <p>
              <strong>Fuel Type:</strong> {formatValue(claim.fuelType)}
            </p>
            <p>
              <strong>Odometer:</strong>{" "}
              {formatValue(claim.odometerReading, "", " km")}
            </p>
            <p>
              <strong>Chassis Number:</strong>{" "}
              {formatValue(claim.chassisNumber)}
            </p>
            <p>
              <strong>Engine Number:</strong> {formatValue(claim.engineNumber)}
            </p>
            <p>
              <strong>Date of Incident:</strong>{" "}
              {formatDate(claim.dateOfIncident)}
            </p>
            <p className="full-width">
              <strong>Incident Description:</strong>{" "}
              {formatValue(claim.incidentDescription)}
            </p>
          </div>
        </div>

        <div className="detail-section">
          <h3>👤 Owner Information</h3>
          <div className="detail-grid-large">
            <p>
              <strong>Name:</strong> {formatValue(claim.firstName)}{" "}
              {formatValue(claim.lastName)}
            </p>
            <p>
              <strong>Mobile Number:</strong> {formatValue(claim.mobileNumber)}
            </p>
            <p>
              <strong>Email Address:</strong> {formatValue(claim.email)}
            </p>
            <p>
              <strong>Aadhaar Number:</strong> {formatValue(claim.aadharNumber)}
            </p>
            <p>
              <strong>Driving License:</strong>{" "}
              {formatValue(claim.drivingLicenseNumber)}
            </p>
            <p className="full-width">
              <strong>Address:</strong> {formatValue(claim.address)}
            </p>
          </div>
        </div>

        <div className="detail-section">
          <h3>📄 Insurance & Repair Preferences</h3>
          <div className="detail-grid-large">
            <p>
              <strong>Insurance Co:</strong>{" "}
              {formatValue(claim.insuranceCompany)}
            </p>
            <p>
              <strong>Policy #:</strong> {formatValue(claim.policyNumber)}
            </p>
            <p>
              <strong>Policy Expiry:</strong>{" "}
              {formatDate(claim.policyExpiryDate)}
            </p>
            <p>
              <strong>IDV (Insured Value):</strong>{" "}
              {formatCurrency(claim.insuredDeclaredValue)}
            </p>
            <p>
              <strong>Zero Depreciation:</strong>
              <span
                style={{
                  color: claim.hasZeroDepreciationCover ? "green" : "red",
                  fontWeight: "bold",
                }}
              >
                {claim.hasZeroDepreciationCover ? "Active 🛡️" : "Not Active"}
              </span>
            </p>
            <p>
              <strong>FIR Filed:</strong>{" "}
              {claim.isFirFiled
                ? `Yes (${formatValue(claim.firNumber)})`
                : "No"}
            </p>
            <p>
              <strong>Preferred Garage:</strong>{" "}
              {formatValue(claim.preferredGarage)}
            </p>
            <p>
              <strong>Needs Pickup Service:</strong>{" "}
              {claim.needsPickup ? "Yes" : "No"}
            </p>
            <p>
              <strong>Urgency:</strong> {formatValue(claim.urgency)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClaimDetailPage;
