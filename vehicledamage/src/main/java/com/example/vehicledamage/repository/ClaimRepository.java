package com.example.vehicledamage.repository;

import com.example.vehicledamage.model.Claim;
import com.example.vehicledamage.model.User; // <-- Add this import
import com.example.vehicledamage.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List; // <-- Add this import

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    // THIS IS THE NEW METHOD
    // It tells Spring to find all claims associated with a specific user object.
    List<Claim> findByUserOrderByIdDesc(User user);
    List<Claim> findAllByOrderByIdDesc();
    List<Claim> findByVehicleAndCreatedAtAfter(Vehicle vehicle, LocalDateTime cutoffDate);

    // Count all claims by user in last 1 year
    int countByUserAndCreatedAtAfter(User user, LocalDateTime cutoff);

    // Check if same vehicle already has claim in last 365 days
    boolean existsByVehicleAndCreatedAtAfter(Vehicle vehicle, LocalDateTime cutoff);


}
