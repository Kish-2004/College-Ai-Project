package com.example.vehicledamage.service;

import com.example.vehicledamage.dto.AnalysisResponse;
import com.example.vehicledamage.dto.EstimateResponse;
import com.example.vehicledamage.model.Claim;
import com.example.vehicledamage.model.LineItem;
import com.example.vehicledamage.repository.LineItemRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
public class CostEngineService {

    private final LineItemRepository lineItemRepository;
    private final MockCatalogService mockCatalogService;

    // Updated set to include all new damage types from your data.yaml
    private static final Set<String> REPLACE_DAMAGE_TYPES = Set.of(
            "damage", "glass-break", "shatter", "missing", "broken",
            "car_window_damage", "front_windscreen_damage", "rear_windscreen_damage",
            "headlight_damage", "taillight_damage", "tire_flat", "crack", "glass-crack"
    );

    @Transactional
    public EstimateResponse calculateAndSaveEstimate(AnalysisResponse analysisResponse, Claim claim) {

        List<EstimateResponse.LineItem> lineItemsDto = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        // ---------------------------------------------------------------------
        // STEP 1: CALCULATE BASE COSTS & SAVE LINE ITEMS (Preserved Logic)
        // ---------------------------------------------------------------------
        for (AnalysisResponse.DamageLocation loc : analysisResponse.getDamageLocations()) {

            DamageInfo damageInfo = parseLabel(loc.getLocation());
            MockCatalogService.PartCost partCost = mockCatalogService.getPartCost(damageInfo.partName());

            boolean replace = shouldReplace(damageInfo.damageType(), loc.getConfidence());
            String action = replace ? "Replace" : "Repair + Paint";

            // Override logic for specific glass/tire parts
            if (damageInfo.partName().contains("windscreen") ||
                    damageInfo.partName().contains("window") ||
                    damageInfo.partName().equals("glass") ||
                    damageInfo.partName().equals("tire")) {
                action = "Replace";
                replace = true;
            }

            BigDecimal lineItemCost = calculateLineItemCost(replace, partCost, loc.getConfidence());

            // Add to running subtotal
            subtotal = subtotal.add(lineItemCost);

            // Add to DTO list
            lineItemsDto.add(new EstimateResponse.LineItem(damageInfo.partName(), damageInfo.damageType(), action, lineItemCost));

            // Save to Database
            LineItem lineItemEntity = new LineItem();
            lineItemEntity.setPart(damageInfo.partName());
            lineItemEntity.setDamageType(damageInfo.damageType());
            lineItemEntity.setAction(action);
            lineItemEntity.setAmount(lineItemCost);
            lineItemEntity.setClaim(claim);
            lineItemRepository.save(lineItemEntity);
        }

        // ---------------------------------------------------------------------
        // STEP 2: NEW TOTAL, DEPRECIATION & TOTAL LOSS LOGIC
        // ---------------------------------------------------------------------

        BigDecimal taxRate = new BigDecimal("0.18");
        BigDecimal taxAmount = subtotal.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal originalTotal = subtotal.add(taxAmount).setScale(2, RoundingMode.HALF_UP);

        BigDecimal deductionAmount = BigDecimal.ZERO;
        StringBuilder deductionReason = new StringBuilder("None"); // Changed to StringBuilder for multiple reasons

        // 📉 Feature: Age-Based Depreciation Logic
        int vehicleAge = 0;
        if(claim.getYearOfManufacture() != null) {
            vehicleAge = java.time.LocalDateTime.now().getYear() - claim.getYearOfManufacture();
        }

        // Apply Depreciation IF: Car > 3 years old AND User does NOT have Zero Dep cover
        if (vehicleAge > 3 && (claim.getHasZeroDepreciationCover() == null || !claim.getHasZeroDepreciationCover())) {
            BigDecimal depRate = (vehicleAge > 5) ? new BigDecimal("0.40") : new BigDecimal("0.20"); // 40% or 20%
            BigDecimal ageDeduction = subtotal.multiply(depRate).setScale(2, RoundingMode.HALF_UP);

            deductionAmount = deductionAmount.add(ageDeduction);
            deductionReason = new StringBuilder("Age Depreciation (" + (vehicleAge > 5 ? "40%" : "20%") + ")");
        }

        // 🔄 Existing Multi-Claim Logic
        if (claim.getStatus() != null && claim.getStatus().contains("LIMITED")) {
            BigDecimal multiClaimDeduction = originalTotal.multiply(new BigDecimal("0.50")).setScale(2, RoundingMode.HALF_UP);
            deductionAmount = deductionAmount.add(multiClaimDeduction);

            if (deductionReason.toString().equals("None")) {
                deductionReason = new StringBuilder("50% Multiple Claim Penalty");
            } else {
                deductionReason.append(" + 50% Multi-Claim Penalty");
            }
        }

        BigDecimal finalTotal = originalTotal.subtract(deductionAmount);
        // Prevent negative total
        if (finalTotal.compareTo(BigDecimal.ZERO) < 0) finalTotal = BigDecimal.ZERO;

        // 🛑 Feature: Total Loss Logic
        // If Repair Cost > 75% of IDV (Insured Value)
        if (claim.getInsuredDeclaredValue() != null && claim.getInsuredDeclaredValue().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal totalLossThreshold = claim.getInsuredDeclaredValue().multiply(new BigDecimal("0.75"));

            if (finalTotal.compareTo(totalLossThreshold) > 0) {
                claim.setStatus("TOTAL_LOSS_DETECTED");
                deductionReason.append(" [TOTAL LOSS: Repair exceeds 75% of IDV]");
            }
        }

        // ... Continue to Step 3 (Build Response) ...
        // In Step 3, make sure to use deductionReason.toString()

        // ---------------------------------------------------------------------
        // STEP 3: BUILD RESPONSE (Using Setters for clarity)
        // ---------------------------------------------------------------------
        EstimateResponse response = new EstimateResponse();

        // Basic Fields
        response.setLineItems(lineItemsDto);
        response.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        response.setTax(taxAmount);

        // New Deduction Fields (For Frontend Display)
        response.setOriginalTotal(originalTotal);
        response.setDeductionAmount(deductionAmount);
        response.setDeductionReason(deductionReason.toString());

        // Final Payable Total
        response.setTotal(finalTotal);

        return response;
    }

    // ---------------------------------------------------------------------
    // HELPER METHODS (Preserved exactly as they were)
    // ---------------------------------------------------------------------

    private BigDecimal calculateLineItemCost(boolean replace, MockCatalogService.PartCost partCost, double confidence) {
        if (replace) {
            // Cost = Part MRP + Labor hours for replacement * Labor Rate
            return partCost.mrp().add(
                    partCost.replaceHours().multiply(mockCatalogService.getLaborRate())
            );
        } else {
            // Cost = Labor hours for repair * Labor Rate + Paint Cost (mocked)
            BigDecimal paintCost = partCost.paintRatePerPercent()
                    .multiply(BigDecimal.valueOf(confidence * 10)); // Mock paint cost

            return partCost.repairHours().multiply(mockCatalogService.getLaborRate())
                    .add(paintCost);
        }
    }

    // 🛠️ Feature: Smart Repair vs Replace Logic
    private boolean shouldReplace(String damageType, double confidence) {
        String type = damageType.toLowerCase();

        // 1. Critical parts are ALWAYS replaced
        if (type.contains("glass") || type.contains("windscreen") || type.contains("light") || type.contains("tire")) {
            return true;
        }

        // 2. Severe damage types are replaced
        if (REPLACE_DAMAGE_TYPES.contains(type) && confidence > 0.50) {
            return true;
        }

        // 3. AI Confidence Logic
        // If confidence is extremely high (>85%), it implies severe, obvious damage -> Replace
        // If confidence is moderate (50-85%), it might be repairable -> Repair
        return confidence > 0.85;
    }

    /**
     * Splits on either a hyphen '-' or an underscore '_'
     */
    private DamageInfo parseLabel(String label) {
        // Regex to split on the last hyphen OR last underscore
        String[] parts = label.split("(?<=[_-])(?!.*[_-])");

        if (parts.length > 1) {
            String partName = parts[0];
            String damageType = parts[1];
            // Standardize part name to use hyphens for consistency
            partName = partName.replace("_", "-");
            return new DamageInfo(partName, damageType);
        }

        // Handle cases with no separator (e.g., "crack", "deformation")
        return new DamageInfo("unknown", label);
    }

    // A simple record to hold parsed label information
    private record DamageInfo(String partName, String damageType) {}
}