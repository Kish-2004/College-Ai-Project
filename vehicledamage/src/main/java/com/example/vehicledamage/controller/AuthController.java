package com.example.vehicledamage.controller;

import com.example.vehicledamage.dto.AuthRequest;
import com.example.vehicledamage.dto.AuthResponse;
import com.example.vehicledamage.dto.RegistrationRequest;
import com.example.vehicledamage.service.JwtService;
import com.example.vehicledamage.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final UserDetailsService userDetailsService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegistrationRequest request) {
        try {
            // Recommendation: Ensure UserService.register also converts email to lowercase before saving.
            userService.register(request);
            return ResponseEntity.ok("User registered successfully!");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest) {

        // 🟢 FIX APPLIED: Normalize email to lowercase to prevent UsernameNotFoundException
        // due to case-sensitivity mismatches between the token and the database lookup.
        final String normalizedEmail = authRequest.getEmail().toLowerCase();

        // 1. Authenticate using the normalized email
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, authRequest.getPassword())
        );

        // 2. Load user details using the normalized email
        final UserDetails userDetails = userDetailsService.loadUserByUsername(normalizedEmail);

        // 3. Generate the token
        final String jwt = jwtService.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(jwt));
    }
}