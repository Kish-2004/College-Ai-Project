package com.example.vehicledamage.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Data
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String vin; // Vehicle Identification Number

    private String make;
    private String model;
    private int year;

    // A vehicle is owned by one user
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // A vehicle can have many claims
    @OneToMany(mappedBy = "vehicle")
    private List<Claim> claims;
}