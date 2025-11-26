package com.example.vehicledamage.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.Map;
import java.util.Set;
import static java.util.Map.entry;

@Service
public class MockCatalogService {

    // Mock labor rate (e.g., $50 per hour)
    private static final BigDecimal LABOR_RATE_PER_HOUR = new BigDecimal("50.00");

    // Mock database of part costs, expanded to include all your classes.
    private static final Map<String, PartCost> partCatalog = Map.ofEntries(
            // --- Original Entries (kept for robustness) ---
            entry("front-bumper", new PartCost(new BigDecimal("350.00"), new BigDecimal("3.0"), new BigDecimal("1.0"), new BigDecimal("5.00"))),
            entry("rear-bumper", new PartCost(new BigDecimal("320.00"), new BigDecimal("3.0"), new BigDecimal("1.0"), new BigDecimal("5.00"))),
            entry("headlight", new PartCost(new BigDecimal("220.00"), new BigDecimal("0.5"), new BigDecimal("0.5"), new BigDecimal("0.00"))),
            entry("fender", new PartCost(new BigDecimal("180.00"), new BigDecimal("2.5"), new BigDecimal("0.8"), new BigDecimal("4.50"))),
            entry("door", new PartCost(new BigDecimal("450.00"), new BigDecimal("4.0"), new BigDecimal("1.5"), new BigDecimal("6.00"))),
            entry("bonnet", new PartCost(new BigDecimal("400.00"), new BigDecimal("3.5"), new BigDecimal("0.8"), new BigDecimal("7.00"))),
            entry("roof", new PartCost(new BigDecimal("600.00"), new BigDecimal("5.0"), new BigDecimal("2.5"), new BigDecimal("8.00"))),
            entry("pillar", new PartCost(new BigDecimal("250.00"), new BigDecimal("4.0"), new BigDecimal("1.8"), new BigDecimal("3.00"))),
            entry("runningboard", new PartCost(new BigDecimal("150.00"), new BigDecimal("2.0"), new BigDecimal("1.0"), new BigDecimal("2.50"))),
            entry("sidemirror", new PartCost(new BigDecimal("120.00"), new BigDecimal("0.5"), new BigDecimal("0.5"), new BigDecimal("1.00"))),
            entry("signlight", new PartCost(new BigDecimal("80.00"), new BigDecimal("0.4"), new BigDecimal("0.4"), new BigDecimal("0.00"))),
            entry("taillight", new PartCost(new BigDecimal("190.00"), new BigDecimal("0.5"), new BigDecimal("0.5"), new BigDecimal("0.00"))),
            entry("front-windscreen", new PartCost(new BigDecimal("300.00"), new BigDecimal("0.0"), new BigDecimal("1.5"), new BigDecimal("0.00"))),
            entry("rear-windscreen", new PartCost(new BigDecimal("280.00"), new BigDecimal("0.0"), new BigDecimal("1.5"), new BigDecimal("0.00"))),
            entry("glass", new PartCost(new BigDecimal("150.00"), new BigDecimal("0.0"), new BigDecimal("1.2"), new BigDecimal("0.00"))),

            // --- NEW Entries from your data.yaml ---
            entry("bumper", new PartCost(new BigDecimal("330.00"), new BigDecimal("3.0"), new BigDecimal("1.0"), new BigDecimal("5.00"))),
            entry("car_window", new PartCost(new BigDecimal("160.00"), new BigDecimal("0.0"), new BigDecimal("1.3"), new BigDecimal("0.00"))),
            entry("quarter_panel", new PartCost(new BigDecimal("280.00"), new BigDecimal("4.5"), new BigDecimal("2.0"), new BigDecimal("4.00"))), // Corrected spelling
            entry("tire", new PartCost(new BigDecimal("120.00"), new BigDecimal("0.0"), new BigDecimal("0.3"), new BigDecimal("0.00"))),
            entry("trunk_door", new PartCost(new BigDecimal("420.00"), new BigDecimal("3.0"), new BigDecimal("1.2"), new BigDecimal("5.50")))
    );

    /**
     * A record to hold all cost-related info for a part.
     */
    public record PartCost(BigDecimal mrp, BigDecimal repairHours, BigDecimal replaceHours, BigDecimal paintRatePerPercent) {}

    /**
     * Fetches the cost profile for a given part name.
     * UPDATED: Now standardizes both '_' and '-' to '-' for lookup.
     */
    public PartCost getPartCost(String partName) {
        String standardizedPartName = partName.toLowerCase()
                .replace("_", "-") // Standardize underscores to hyphens
                .replace("-break", "")
                .replace("-damage", "")
                .replace("-dent", "")   // Also strip damage types from part names
                .replace("-scratch", "");

        // Handle generic 'bumper' label
        if (standardizedPartName.equals("bumper")) {
            return partCatalog.get("bumper");
        }

        // Handle generic 'door' label
        if (standardizedPartName.equals("door")) {
            return partCatalog.get("door");
        }

        // Return a default value if the part is not in our mock catalog
        return partCatalog.getOrDefault(standardizedPartName,
                new PartCost(new BigDecimal("200.00"), new BigDecimal("2.0"), new BigDecimal("1.0"), new BigDecimal("3.00")));
    }

    /**
     * Fetches the standard labor rate.
     */
    public BigDecimal getLaborRate() {
        return LABOR_RATE_PER_HOUR;
    }

    /**
     * Returns a set of all available part names in the catalog.
     */
    public Set<String> getAllParts() {
        return partCatalog.keySet();
    }
}
