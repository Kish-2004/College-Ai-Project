package com.example.vehicledamage.config;

import com.example.vehicledamage.model.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // --- Public Endpoints (no auth required) ---
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // --- NEW ROLE-BASED RULES ---

                        // ADMIN endpoints: Only users with ROLE_ADMIN can access
                        .requestMatchers("/api/v1/admin/**").hasRole(Role.ROLE_ADMIN.name().replace("ROLE_", "")) // "ADMIN"

                        // USER endpoints: Only users with ROLE_USER can access
                        .requestMatchers("/api/v1/users/**").hasRole(Role.ROLE_USER.name().replace("ROLE_", "")) // "USER"

                        // 🟢 --- THIS IS THE FIX --- 🟢
                        // SHARED (USER and ADMIN)
                        .requestMatchers("/api/v1/claims/**").hasAnyRole(
                                Role.ROLE_USER.name().replace("ROLE_", ""),
                                Role.ROLE_ADMIN.name().replace("ROLE_", "")
                        ) // Allows "USER" OR "ADMIN"

                        // --- Fallback ---
                        .anyRequest().authenticated() // All other requests just need login
                )
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}