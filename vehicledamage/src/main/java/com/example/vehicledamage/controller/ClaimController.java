package com.example.vehicledamage.controller;

import com.example.vehicledamage.dto.*;
import com.example.vehicledamage.model.Claim;
import com.example.vehicledamage.model.User;
import com.example.vehicledamage.repository.ClaimRepository;
import com.example.vehicledamage.repository.UserRepository;
import com.example.vehicledamage.service.CostEngineService;
import com.example.vehicledamage.service.FastApiService;
import com.example.vehicledamage.service.FileStorageService;
import com.example.vehicledamage.service.ClaimService;
import com.example.vehicledamage.dto.ClaimRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime; // This import was missing, added it back
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final FastApiService fastApiService;
    private final CostEngineService costEngineService;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ClaimService claimService;

    /**
     * Fetches the details of the currently logged-in user, including the profile picture URL.
     */
    @GetMapping("/user/details")
    public ResponseEntity<UserDto> getUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        UserDto userDto = new UserDto();
        userDto.setId(currentUser.getId());
        userDto.setName(currentUser.getName());
        userDto.setEmail(currentUser.getEmail());
        userDto.setProfilePictureUrl(currentUser.getProfilePictureUrl());
        userDto.setClaimIds(currentUser.getClaims().stream()
                .map(Claim::getId)
                .collect(Collectors.toList()));

        return ResponseEntity.ok(userDto);
    }

// ---------------------------------------------------------------------------------------------------------------------

    /**
     * FIX: Fetches the claim history ONLY for the currently logged-in user.
     */
    @GetMapping("/history")
    public ResponseEntity<List<ClaimSummaryDto>> getUserClaimsHistory() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        List<Claim> userClaims = claimRepository.findByUserOrderByIdDesc(currentUser);

        List<ClaimSummaryDto> claimSummaryDtos = userClaims.stream()
                .map(claim -> {
                    ClaimSummaryDto dto = new ClaimSummaryDto();
                    dto.setId(claim.getId());
                    dto.setVehicleMakeModel(claim.getVehicleMakeModel());
                    dto.setVehicleRegistrationNumber(claim.getVehicleRegistrationNumber());
                    dto.setCreatedAt(claim.getCreatedAt());
                    dto.setStatus(claim.getStatus());
                    dto.setEstimatedTotal(claim.getEstimatedTotal() != null ? claim.getEstimatedTotal() : BigDecimal.ZERO);
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(claimSummaryDtos);
    }

// ---------------------------------------------------------------------------------------------------------------------

    /**
     * Step 1: Creates a new claim record with basic details.
     * This now uses ClaimService to apply the "first vs. subsequent" claim logic.
     */
    @PostMapping
    public ResponseEntity<ClaimResponse> createClaim(@RequestBody ClaimRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        // ClaimService now handles all logic and sets the correct PENDING status
        Claim savedClaim = claimService.createNewClaim(request, currentUser);

        ClaimResponse responseDto = new ClaimResponse();
        responseDto.setId(savedClaim.getId());

        return ResponseEntity.ok(responseDto);
    }

    /**
     * Step 2: Adds an image to an existing claim and gets an estimate.
     */
    @PostMapping("/{claimId}/estimate")
    @Transactional
    public ResponseEntity<FinalEstimateResponse> createEstimate(
            @PathVariable Long claimId,
            @RequestParam("image") MultipartFile imageFile) {

        System.out.println("--- STEP 2 STARTED: Creating Estimate for Claim ID: " + claimId + " ---");

        // 1. Get Current User
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        System.out.println("Logged in user email: " + userEmail);

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + userEmail));

        // 2. Find Claim
        Claim existingClaim = claimRepository.findById(claimId).orElse(null);
        if (existingClaim == null) {
            System.out.println("Error: Claim not found with ID " + claimId);
            return ResponseEntity.notFound().build();
        }

        // 3. Debugging Ownership (Check why 403 is happening)
        if (existingClaim.getUser() == null) {
            System.out.println("CRITICAL ERROR: This claim has no user assigned to it!");
            // If this prints, your Step 1 ClaimService logic isn't saving the user correctly.
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Long claimUserId = existingClaim.getUser().getId();
        Long currentUserId = currentUser.getId();

        System.out.println("Claim Owner ID: " + claimUserId);
        System.out.println("Current User ID: " + currentUserId);

        // 4. Safer Ownership Check
        if (!claimUserId.equals(currentUserId)) {
            System.out.println("Error: ID Mismatch! 403 Forbidden triggered.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // 5. Validate Image
        if (imageFile.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            // 6. Process Image
            AnalysisResponse analysis = fastApiService.getAnalysis(imageFile);
            EstimateResponse estimate = costEngineService.calculateAndSaveEstimate(analysis, existingClaim);
            FinalEstimateResponse finalResponse = new FinalEstimateResponse(analysis, estimate);

            // 7. Update Status Logic (Preserving your flow)
            String currentStatus = existingClaim.getStatus();

            // If logic based on what you set in Step 1
            if ("LIMITED_CLAIM_PENDING".equals(currentStatus)) {
                existingClaim.setStatus("LIMITED_CLAIM_ANALYZED");
            } else if ("FIRST_OR_NORMAL_CLAIM_PENDING".equals(currentStatus)) {
                existingClaim.setStatus("FIRST_CLAIM_ANALYZED");
            } else {
                existingClaim.setStatus("ANALYSIS_COMPLETE");
            }

            if (estimate != null) {
                existingClaim.setEstimatedTotal(estimate.getTotal());
            }

            // Save Analysis Data
            existingClaim.setPlottedImage(analysis.getPlottedImage());
            existingClaim.setIsDamaged(analysis.isDamaged());
            existingClaim.setDamageConfidence(analysis.getDamageConfidence());
            existingClaim.setDamageSeverityLabel(analysis.getDamageSeverity().getSeverityLabel());

            claimRepository.save(existingClaim);

            System.out.println("--- STEP 2 SUCCESS: Estimate Created ---");
            return ResponseEntity.ok(finalResponse);

        } catch (IOException e) {
            System.err.println("Error processing image: " + e.getMessage());
            return ResponseEntity.status(500).build();
        }
    }

// ---------------------------------------------------------------------------------------------------------------------
    /**
     * Fetches full details for a single claim, mapping to DetailedClaimDto.
     */
    @GetMapping("/{claimId}")
    @Transactional(readOnly = true)
    public ResponseEntity<DetailedClaimDto> getClaimDetails(@PathVariable Long claimId) {
        // (Get claim - unchanged)
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new UsernameNotFoundException("Claim not found with ID: " + claimId));

        // (Get user - unchanged)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        // (Admin check - unchanged)
        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"));

        // (Security check - unchanged)
        if (!isAdmin && !claim.getUser().getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build(); // Forbidden
        }

        // (Lazy loading - unchanged)
        claim.getLineItems().size();

        // (Map to DTO - unchanged)
        return ResponseEntity.ok(new DetailedClaimDto(claim));
    }


    /**
     * NEW ENDPOINT: Uploads and sets the profile picture for the currently logged-in user.
     */
    @PostMapping("/profile-picture")
    public ResponseEntity<String> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: "+userEmail));

        try {
            // (Store file - unchanged)
            String profileUrl = fileStorageService.storeFile(file, user.getId());

            // (Update user - unchanged)
            user.setProfilePictureUrl(profileUrl);
            userRepository.save(user);

            // (Return URL - unchanged)
            return ResponseEntity.ok(profileUrl);

        } catch (RuntimeException e) {
            System.err.println("File upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload profile picture.");
        }
    }
}