package com.example.vehicledamage.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "line_items")
@Data
@NoArgsConstructor      // <-- Add this for JPA
@AllArgsConstructor     // <-- Add this for convenience
public class LineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String part;
    private String action;
    private BigDecimal amount;

    private String damageType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "claim_id", nullable = false)
    private Claim claim;
}

