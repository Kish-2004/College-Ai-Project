package com.example.vehicledamage.repository;

import com.example.vehicledamage.model.User;
import com.example.vehicledamage.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    // This is the method we use in ClaimService
    Optional<Vehicle> findByVin(String vin);

    List<Vehicle> findByUser(User user);
}