package com.example.vehicledamage.service;

import com.example.vehicledamage.model.Claim;
import com.example.vehicledamage.model.User;
import com.example.vehicledamage.model.Vehicle;
import com.example.vehicledamage.repository.ClaimRepository;
import com.example.vehicledamage.repository.VehicleRepository;
import com.example.vehicledamage.dto.ClaimRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class ClaimService {

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Transactional
    public Claim createNewClaim(ClaimRequest request, User user) {

        // 1️⃣ FIND VEHICLE OR CREATE NEW ONE
        Vehicle vehicle = vehicleRepository.findByVin(request.getVin())
                .orElseGet(() -> {
                    Vehicle v = new Vehicle();
                    v.setVin(request.getVin());
                    v.setMake(request.getMake());
                    v.setModel(request.getModel());
                    v.setYear(request.getYearOfManufacture() != null ? request.getYearOfManufacture() : 0);
                    v.setUser(user);
                    return vehicleRepository.save(v);
                });

        // Define 1-year window
        LocalDateTime oneYearAgo = LocalDateTime.now().minusYears(1);

        // ❌ DELETED RULE 1: We do NOT want to throw an exception/block the user anymore.
        // The user is allowed to make a 2nd claim, it will just have a different status.

        // 2️⃣ RULE 2 (Renamed): COUNT PREVIOUS CLAIMS (last 1 year)
        // This counts how many claims this user has made *before* this one.
        int userClaimCount = claimRepository.countByUserAndCreatedAtAfter(user, oneYearAgo);

        // Create new claim object
        Claim newClaim = new Claim();
        newClaim.setUser(user);
        newClaim.setVehicle(vehicle);

        // 3️⃣ MAP REQUEST FIELDS (Copying data from request to entity)
        newClaim.setVehicleRegistrationNumber(request.getVehicleRegistrationNumber());
        newClaim.setVehicleMakeModel(request.getVehicleMakeModel());
        newClaim.setYearOfManufacture(request.getYearOfManufacture());
        newClaim.setFuelType(request.getFuelType());
        newClaim.setOdometerReading(request.getOdometerReading());
        newClaim.setChassisNumber(request.getChassisNumber());
        newClaim.setEngineNumber(request.getEngineNumber());

        newClaim.setFirstName(request.getFirstName());
        newClaim.setLastName(request.getLastName());
        newClaim.setMobileNumber(request.getMobileNumber());
        newClaim.setEmail(request.getEmail());
        newClaim.setAadharNumber(request.getAadharNumber());
        newClaim.setDrivingLicenseNumber(request.getDrivingLicenseNumber());
        newClaim.setAddress(request.getAddress());

        newClaim.setIncidentDescription(request.getIncidentDescription());
        newClaim.setPolicyNumber(request.getPolicyNumber());
        newClaim.setDateOfIncident(request.getDateOfIncident());
        newClaim.setLocation(request.getLocation());
        newClaim.setClaimReason(request.getClaimReason());

        newClaim.setInsuranceCompany(request.getInsuranceCompany());
        newClaim.setPolicyExpiryDate(request.getPolicyExpiryDate());
        newClaim.setClaimNumber(request.getClaimNumber());
        newClaim.setIsFirFiled(request.getIsFirFiled());
        newClaim.setFirNumber(request.getFirNumber());
        newClaim.setPreferredGarage(request.getPreferredGarage());
        newClaim.setNeedsPickup(request.getNeedsPickup());
        newClaim.setUrgency(request.getUrgency());
        newClaim.setBudgetEstimate(request.getBudgetEstimate());

        newClaim.setHasZeroDepreciationCover(request.getHasZeroDepreciationCover());
        newClaim.setInsuredDeclaredValue(request.getInsuredDeclaredValue());
        // 4️⃣ SET STATUS BASED ON CLAIM COUNT
        newClaim.setEstimatedTotal(BigDecimal.ZERO);

        // Logic:
        // If count is 0 -> This is the 1st claim -> Normal
        // If count is 1 -> This is the 2nd claim -> Apply Reduction (Limited)
        // If count is 2+ -> This is the 3rd+ claim -> Apply Reduction (Limited)

        if (userClaimCount >= 1) {
            // Previous claims exist, so this one is "Limited"
            newClaim.setStatus("LIMITED_CLAIM_PENDING");
            // OPTIONAL: You could also add a flag here like newClaim.setReductionApplied(true);
        } else {
            // No previous claims
            newClaim.setStatus("FIRST_OR_NORMAL_CLAIM_PENDING");
        }

        // Save and return final claim
        return claimRepository.save(newClaim);
    }
}