package com.example.vehicledamage.dto;


import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ClaimSummaryDto {
    private Long id;
    private String vehicleMakeModel;
    private String vehicleRegistrationNumber;
    private LocalDateTime createdAt;
    private String status;
    private BigDecimal estimatedTotal;

    private String userName;
    private String userEmail;
}
