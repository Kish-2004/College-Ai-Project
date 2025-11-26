package com.example.vehicledamage.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ClaimRequest {

    // Vehicle identifier fields
    private String vin;
    private String make;
    private String model;

    // --- Vehicle & Incident ---
    private String vehicleRegistrationNumber;
    private String vehicleMakeModel;
    private Integer yearOfManufacture;
    private String fuelType;
    private Integer odometerReading;
    private String chassisNumber;
    private String engineNumber;
    private LocalDate dateOfIncident;
    private String incidentDescription;

    // NEW FIELDS ADDED (to match Claim.java + fix errors)
    private String location;
    private String claimReason;

    // --- Owner ---
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String email;
    private String aadharNumber;
    private String drivingLicenseNumber;
    private String address;

    // --- Insurance & Repair ---
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
    private Boolean hasZeroDepreciationCover;
    private BigDecimal insuredDeclaredValue;
}
