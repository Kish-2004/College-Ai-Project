package com.example.vehicledamage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class WebConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Specify the allowed origin for your React app
        configuration.setAllowedOrigins(List.of("http://localhost:3000"));

        // Specify the allowed HTTP methods
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Allow all headers, including Authorization
        configuration.setAllowedHeaders(List.of("*"));

        // This is crucial for sending credentials like JWTs
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this configuration to all paths under /api/
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}