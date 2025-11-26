package com.example.vehicledamage.dto;
import lombok.Data;
import java.util.List;

@Data
public class SegmentationResponse {
    private List<Segmentation> segmentations;

    @Data
    public static class Segmentation {
        private String label;
        private double confidence;
        private List<Double> bbox;
        private int mask_area_pixels;
        private double mask_area_percent;
    }
}