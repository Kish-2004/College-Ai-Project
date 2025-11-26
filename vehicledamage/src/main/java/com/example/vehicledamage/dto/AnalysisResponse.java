package com.example.vehicledamage.dto;

import lombok.Data;
import java.util.List;

@Data
public class AnalysisResponse {
    private boolean isCar;
    private boolean isDamaged;
    private double damageConfidence;
    private List<DamageLocation> damageLocations;
    private DamageSeverity damageSeverity;
    private String plottedImage;

    @Data
    public static class DamageLocation {
        private String location;
        private double confidence;
    }

    @Data
    public static class DamageSeverity {
        private String severityLabel;
        private double severityConfidence;
    }
}
