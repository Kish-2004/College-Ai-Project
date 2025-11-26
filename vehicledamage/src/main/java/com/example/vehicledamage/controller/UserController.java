package com.example.vehicledamage.controller;

import com.example.vehicledamage.dto.ClaimDetailDto;
import com.example.vehicledamage.dto.ClaimSummaryDto;
import com.example.vehicledamage.dto.UserProfileDto;
import com.example.vehicledamage.model.Claim;
import com.example.vehicledamage.model.User;
import com.example.vehicledamage.repository.ClaimRepository;
import com.example.vehicledamage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final ClaimRepository claimRepository;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getCurrentUserProfile() {
        User currentUser = getCurrentUser();

        UserProfileDto profileDto = new UserProfileDto();
        profileDto.setId(currentUser.getId());
        profileDto.setName(currentUser.getName());
        profileDto.setEmail(currentUser.getEmail());

        List<Claim> userClaims = claimRepository.findByUserOrderByIdDesc(currentUser);

        List<ClaimSummaryDto> claimSummaries = userClaims.stream()
                .map(this::convertToClaimSummaryDto)
                .collect(Collectors.toList());
        profileDto.setClaims(claimSummaries);

        return ResponseEntity.ok(profileDto);
    }

    @GetMapping("/claims/{id}")
    public ResponseEntity<ClaimDetailDto> getClaimById(@PathVariable Long id) {
        User currentUser = getCurrentUser();

        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Claim not found"));

        if (!claim.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to view this claim.");
        }

        // THE FIX: This now correctly calls the helper method to convert the
        // full Claim entity into the detailed DTO before sending it.
        return ResponseEntity.ok(convertToClaimDetailDto(claim));
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        return userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found for email: " + userEmail));
    }

    private ClaimSummaryDto convertToClaimSummaryDto(Claim claim) {
        ClaimSummaryDto dto = new ClaimSummaryDto();
        dto.setId(claim.getId());
        dto.setVehicleRegistrationNumber(claim.getVehicleRegistrationNumber());
        dto.setVehicleMakeModel(claim.getVehicleMakeModel());
        dto.setCreatedAt(claim.getCreatedAt());
        dto.setStatus(claim.getStatus());
        dto.setEstimatedTotal(claim.getEstimatedTotal());
        return dto;
    }

    private ClaimDetailDto convertToClaimDetailDto(Claim claim) {
        ClaimDetailDto dto = new ClaimDetailDto();
        // Base Info
        dto.setId(claim.getId());
        dto.setCreatedAt(claim.getCreatedAt());
        dto.setStatus(claim.getStatus());

        // Vehicle & Incident
        dto.setVehicleRegistrationNumber(claim.getVehicleRegistrationNumber());
        dto.setVehicleMakeModel(claim.getVehicleMakeModel());
        dto.setYearOfManufacture(claim.getYearOfManufacture());
        dto.setFuelType(claim.getFuelType());
        dto.setOdometerReading(claim.getOdometerReading());
        dto.setChassisNumber(claim.getChassisNumber());
        dto.setEngineNumber(claim.getEngineNumber());
        dto.setDateOfIncident(claim.getDateOfIncident());
        dto.setIncidentDescription(claim.getIncidentDescription());

        // Owner
        dto.setFirstName(claim.getFirstName());
        dto.setLastName(claim.getLastName());
        dto.setMobileNumber(claim.getMobileNumber());
        dto.setEmail(claim.getEmail());
        dto.setAadharNumber(claim.getAadharNumber());
        dto.setDrivingLicenseNumber(claim.getDrivingLicenseNumber());
        dto.setAddress(claim.getAddress());

        // Insurance & Repair
        dto.setInsuranceCompany(claim.getInsuranceCompany());
        dto.setPolicyNumber(claim.getPolicyNumber());
        dto.setPolicyExpiryDate(claim.getPolicyExpiryDate());
        dto.setClaimNumber(claim.getClaimNumber());
        dto.setIsFirFiled(claim.getIsFirFiled());
        dto.setFirNumber(claim.getFirNumber());
        dto.setPreferredGarage(claim.getPreferredGarage());
        dto.setNeedsPickup(claim.getNeedsPickup());
        dto.setUrgency(claim.getUrgency());
        dto.setBudgetEstimate(claim.getBudgetEstimate());

        return dto;
    }
}

