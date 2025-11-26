package com.example.vehicledamage.service;

import com.example.vehicledamage.dto.RegistrationRequest;
import com.example.vehicledamage.model.Role; // 🟢 1. IMPORT THE ROLE MODEL
import com.example.vehicledamage.model.User;
import com.example.vehicledamage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor // Handles constructor injection for final fields
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User register(RegistrationRequest request) {
        // 1. Check if a user with the given email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already taken!");
        }

        User newUser = new User();
        // Set properties from the request DTO to the new User entity
        newUser.setName(request.getName());
        newUser.setEmail(request.getEmail());

        // 2. Encode the password before saving
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        // 🟢 2. SET THE DEFAULT ROLE
        newUser.setRole(Role.ROLE_USER);

        // 3. Save the new user to the database
        return userRepository.save(newUser);
    }
}