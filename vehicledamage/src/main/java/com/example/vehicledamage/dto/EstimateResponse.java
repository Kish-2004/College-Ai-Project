package com.example.vehicledamage.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor; // 🟢 1. Import this

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor // 🟢 2. ADD THIS (Fixes "found 0 arguments" error)
public class EstimateResponse {
    private List<LineItem> lineItems;
    private BigDecimal subtotal;

    private BigDecimal tax; // 🟢 3. ADD THIS (Fixes "Cannot resolve setTax" error)

    private BigDecimal total;

    private BigDecimal originalTotal;
    private BigDecimal deductionAmount;
    private String deductionReason;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor // Recommended to add this here too for safety
    public static class LineItem {
        private String part;
        private String damageType;
        private String action;
        private BigDecimal amount;
    }
}