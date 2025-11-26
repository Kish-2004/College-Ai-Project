package com.example.vehicledamage.dto;

import lombok.Data;
import java.util.List;

@Data // <-- This annotation was missing. It creates the 'setId' method.
public class UserProfileDto {
    private Long id;
    private String name;
    private String email;
    private List<ClaimSummaryDto> claims;
}

