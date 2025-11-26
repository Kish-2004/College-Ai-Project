package com.example.vehicledamage.dto;


import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class FinalEstimateResponse {
    private AnalysisResponse analysis;
    private EstimateResponse estimate;
}