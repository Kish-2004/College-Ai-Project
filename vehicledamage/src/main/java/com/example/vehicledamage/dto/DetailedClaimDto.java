package com.example.vehicledamage.dto;


import com.example.vehicledamage.model.Claim;
import com.example.vehicledamage.model.LineItem;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors; // Added for stream mapping

/**
 * DTO to return a single claim's complete details to the frontend,
 * including analysis and estimate data, mapped to frontend expectations.
 */
@Data
public class DetailedClaimDto {
    private Long id;

    // Vehicle & Incident Details
    private String vehicleRegistrationNumber;
    private String vehicleMakeModel;
    private Integer yearOfManufacture;
    private String fuelType;
    private Integer odometerReading;
    private String chassisNumber;
    private String engineNumber;
    private LocalDate dateOfIncident;
    private String incidentDescription;

    // Owner Details (Basic)
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String email;
    private String aadharNumber;
    private String drivingLicenseNumber;
    private String address;

    // Insurance & Repair
    private String insuranceCompany;
    private String policyNumber;
    private LocalDate policyExpiryDate;
    private String claimNumber;
    private Boolean isFirFiled;
    private String firNumber;
    private String preferredGarage;
    private Boolean needsPickup;
    private String urgency;
    private BigDecimal budgetEstimate;

    // Status & Totals
    private LocalDateTime createdAt;
    private String status;
    private BigDecimal estimatedTotal;

    // Nested Report Data (Used by the frontend's renderReportSection)
    // We must use LineItemDto here, not the entity LineItem, to prevent serialization issues.
    private List<LineItemDto> lineItems;
    private AnalysisResponse analysisResponse;

    public DetailedClaimDto(Claim claim) {
        this.id = claim.getId();
        this.vehicleRegistrationNumber = claim.getVehicleRegistrationNumber();
        this.vehicleMakeModel = claim.getVehicleMakeModel();
        this.yearOfManufacture = claim.getYearOfManufacture();
        this.fuelType = claim.getFuelType();
        this.odometerReading = claim.getOdometerReading();
        this.chassisNumber = claim.getChassisNumber();
        this.engineNumber = claim.getEngineNumber();
        this.dateOfIncident = claim.getDateOfIncident();
        this.incidentDescription = claim.getIncidentDescription();
        this.firstName = claim.getFirstName();
        this.lastName = claim.getLastName();
        this.mobileNumber = claim.getMobileNumber();
        this.email = claim.getEmail();
        this.aadharNumber = claim.getAadharNumber();
        this.drivingLicenseNumber = claim.getDrivingLicenseNumber();
        this.address = claim.getAddress();
        this.insuranceCompany = claim.getInsuranceCompany();
        this.policyNumber = claim.getPolicyNumber();
        this.policyExpiryDate = claim.getPolicyExpiryDate();
        this.claimNumber = claim.getClaimNumber();
        this.isFirFiled = claim.getIsFirFiled();
        this.firNumber = claim.getFirNumber();
        this.preferredGarage = claim.getPreferredGarage();
        this.needsPickup = claim.getNeedsPickup();
        this.urgency = claim.getUrgency();
        this.budgetEstimate = claim.getBudgetEstimate();
        this.createdAt = claim.getCreatedAt();
        this.status = claim.getStatus();
        this.estimatedTotal = claim.getEstimatedTotal();

        // 1. Map LineItem entities to DTOs
        this.lineItems = claim.getLineItems().stream()
                .map(LineItemDto::fromLineItem) // Using the static factory method
                .collect(Collectors.toList());

        // 2. Map analysis fields to the AnalysisResponse structure
        AnalysisResponse analysis = new AnalysisResponse();
        analysis.setPlottedImage(claim.getPlottedImage());

        // FIX: Using setDamaged() for primitive boolean property mapping (common Lombok convention)
        analysis.setDamaged(claim.getIsDamaged());

        analysis.setDamageConfidence(claim.getDamageConfidence());

        // Assuming AnalysisResponse.DamageSeverity exists and has the necessary setter
        AnalysisResponse.DamageSeverity damageSeverity = new AnalysisResponse.DamageSeverity();
        damageSeverity.setSeverityLabel(claim.getDamageSeverityLabel());
        analysis.setDamageSeverity(damageSeverity);

        this.analysisResponse = analysis;
    }
}
