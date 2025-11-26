package com.example.vehicledamage.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserDto {
    private Long id;
    private String name;
    private String email;


    private String profilePictureUrl;

    private List<Long> claimIds;
}