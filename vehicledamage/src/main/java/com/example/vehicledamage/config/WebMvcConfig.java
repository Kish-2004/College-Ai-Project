package com.example.vehicledamage.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    // Must match the path in application.properties EXACTLY
    @Value("${upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 🟢 FIX: Maps the web path '/uploads/' to the physical file location.
        // This ensures Spring serves the image files.
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir); // Ensure this path is correct
    }
}