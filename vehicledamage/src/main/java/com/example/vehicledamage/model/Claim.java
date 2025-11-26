package com.example.vehicledamage.model;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "claims")
@Data
public class Claim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Vehicle & Damage Details ---
    private String vehicleRegistrationNumber;
    private String vehicleMakeModel;
    private Integer yearOfManufacture;
    private String fuelType;
    private Integer odometerReading;
    private String chassisNumber;
    private String engineNumber;

    private LocalDate dateOfIncident;  // ✔ matches ClaimRequest
    @Lob
    private String incidentDescription;

    // NEW FIELDS ADDED (to fix your service errors)
    private String location;
    private String claimReason;

    // --- Owner/Requester Details ---
    private String firstName;
    private String lastName;
    private String mobileNumber;
    private String email;
    private String aadharNumber;
    private String drivingLicenseNumber;
    @Lob
    private String address;

    // --- Insurance Information ---
    private String insuranceCompany;
    private String policyNumber;
    private LocalDate policyExpiryDate;
    private String claimNumber;
    private Boolean isFirFiled;
    private String firNumber;
    private Boolean hasZeroDepreciationCover;
    private BigDecimal insuredDeclaredValue;

    // --- Repair Preferences ---
    private String preferredGarage;
    private Boolean needsPickup;
    private String urgency;
    private BigDecimal budgetEstimate;

    // --- Analysis Data Fields ---
    @Lob
    private String plottedImage;
    private Boolean isDamaged;
    private Double damageConfidence;
    private String damageSeverityLabel;

    private String status;
    private BigDecimal estimatedTotal;
    private String currency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LineItem> lineItems = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonIgnore
    private Vehicle vehicle;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
