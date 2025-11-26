// inside controller/AdminController.java
package com.example.vehicledamage.controller;

import com.example.vehicledamage.dto.ClaimSummaryDto;
import com.example.vehicledamage.model.Claim;
import com.example.vehicledamage.repository.ClaimRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional; // 🟢 1. IMPORT THIS
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ClaimRepository claimRepository;

    @GetMapping("/claims/all")
    @Transactional(readOnly = true) // 🟢 2. ADD THIS ANNOTATION
    public ResponseEntity<List<ClaimSummaryDto>> getAllClaims() {

        List<Claim> allClaims = claimRepository.findAllByOrderByIdDesc();

        List<ClaimSummaryDto> claimSummaries = allClaims.stream()
                .map(claim -> {
                    ClaimSummaryDto dto = new ClaimSummaryDto();
                    dto.setId(claim.getId());
                    dto.setVehicleMakeModel(claim.getVehicleMakeModel());
                    dto.setVehicleRegistrationNumber(claim.getVehicleRegistrationNumber());
                    dto.setCreatedAt(claim.getCreatedAt());
                    dto.setStatus(claim.getStatus());
                    dto.setEstimatedTotal(claim.getEstimatedTotal() != null ? claim.getEstimatedTotal() : BigDecimal.ZERO);

                    // 🟢 3. ADD THIS LOGIC TO GET USER INFO
                    if (claim.getUser() != null) {
                        dto.setUserName(claim.getUser().getName());
                        dto.setUserEmail(claim.getUser().getEmail());
                    }

                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(claimSummaries);
    }
    // 🟢 NEW: Endpoint to Approve or Reject a Claim
    @org.springframework.web.bind.annotation.PutMapping("/claims/{id}/status")
    @Transactional
    public ResponseEntity<String> updateClaimStatus(
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @org.springframework.web.bind.annotation.RequestParam String status) {

        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Claim not found"));

        // Update status (e.g., "CLAIM_APPROVED" or "CLAIM_REJECTED")
        claim.setStatus(status);
        claimRepository.save(claim);

        return ResponseEntity.ok("Claim status updated to " + status);
    }
}