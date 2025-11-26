package com.example.vehicledamage.service;

import com.example.vehicledamage.dto.AnalysisResponse; // <-- Changed import
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import java.io.IOException;

@Service
public class FastApiService {

    private final WebClient webClient;

    public FastApiService(WebClient.Builder webClientBuilder, @Value("${ml.api.base-url}") String mlApiBaseUrl) {
        this.webClient = webClientBuilder.baseUrl(mlApiBaseUrl).build();
    }

    // Method is updated to get the full analysis
    public AnalysisResponse getAnalysis(MultipartFile imageFile) throws IOException {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", imageFile.getResource());

        return this.webClient.post()
                .uri("/ml/analyze") // <-- Call the new endpoint
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(AnalysisResponse.class) // <-- Use the new DTO
                .block();
    }
}