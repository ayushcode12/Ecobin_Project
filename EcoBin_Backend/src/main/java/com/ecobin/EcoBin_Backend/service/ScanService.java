package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.dto.ClassificationPreviewDTO;
import com.ecobin.EcoBin_Backend.dto.ScanResultDTO;
import com.ecobin.EcoBin_Backend.model.User;
import com.ecobin.EcoBin_Backend.model.UserStats;
import com.ecobin.EcoBin_Backend.repository.UserRepository;
import com.ecobin.EcoBin_Backend.repository.UserStatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class ScanService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserStatsRepository userStatsRepository;

    @Autowired
    private ClassificationRuleService classificationRuleService;

    @Autowired
    private ScanHistoryService scanHistoryService;

    public ScanResultDTO processScan(String textDescription, String imageUrl, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserStats stats = getOrCreateUserStats(user);
        
        String categoryType = "Unknown";
        int points = 3;
        String matchedKeyword = null;
        Integer rulePriority = null;
        boolean aiUsed = false;
        
        // 1. Try AI Model if image is provided
        if (imageUrl != null && !imageUrl.trim().isEmpty()) {
            try {
                org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
                java.util.Map<String, String> requestData = new java.util.HashMap<>();
                requestData.put("image", imageUrl);
                
                org.springframework.http.ResponseEntity<java.util.Map> response = 
                    restTemplate.postForEntity("http://localhost:5000/predict", requestData, java.util.Map.class);
                    
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    categoryType = (String) response.getBody().get("prediction");
                    matchedKeyword = "AI-Model-Predicted";
                    points = 10; // AI bonus points
                    aiUsed = true;
                    rulePriority = 1000;
                }
            } catch (Exception e) {
                System.err.println("AI Model API failed: " + e.getMessage());
            }
        }
        
        // 2. Fallback to Text Rules if no image or AI failed
        if (!aiUsed) {
            ClassificationPreviewDTO classification = classificationRuleService.classifyText(textDescription);
            categoryType = classification.getCategoryType();
            points = classification.getPoints() == null ? 3 : classification.getPoints();
            matchedKeyword = classification.getMatchedKeyword();
            rulePriority = classification.getRulePriority();
        }

        updateStreak(stats);
        stats.setTotalPoints(stats.getTotalPoints() + points);
        userStatsRepository.save(stats);

        scanHistoryService.saveScan(
                user,
                textDescription == null || textDescription.isBlank() ? "Image Classification" : textDescription,
                imageUrl,
                categoryType,
                matchedKeyword,
                rulePriority,
                points
        );

        return buildScanResult(
                categoryType,
                points,
                stats,
                matchedKeyword,
                rulePriority
        );
    }

    private UserStats getOrCreateUserStats(User user) {
        Optional<UserStats> existing = userStatsRepository.findByUser(user);

        if (existing.isPresent()) {
            return existing.get();
        }

        UserStats newStats = new UserStats();
        newStats.setUser(user);
        newStats.setTotalPoints(0);
        newStats.setCurrentStreak(0);
        newStats.setLastSubmissionDate(null);
        return userStatsRepository.save(newStats);
    }

    private void updateStreak(UserStats stats) {
        LocalDate today = LocalDate.now();

        if (stats.getLastSubmissionDate() == null) {
            stats.setCurrentStreak(1);
            stats.setLastSubmissionDate(today);
            return;
        }

        if (stats.getLastSubmissionDate().equals(today)) {
            return;
        }

        if (stats.getLastSubmissionDate().equals(today.minusDays(1))) {
            stats.setCurrentStreak(stats.getCurrentStreak() + 1);
            stats.setLastSubmissionDate(today);
            return;
        }

        stats.setCurrentStreak(1);
        stats.setLastSubmissionDate(today);
    }

    private String generateMotivationalMessage(String categoryType) {
        if (categoryType.equals("Non-Biodegradable")) {
            return "Good call. Non-biodegradable waste needs proper segregation to reduce pollution.";
        }

        if (categoryType.equals("Recyclable")) {
            return "Awesome! Recycling this item helps save energy and valuable resources.";
        }

        if (categoryType.equals("Biodegradable")) {
            return "Great! Biodegradable waste can return to nature and reduce landfill load.";
        }

        return "Every small effort matters! Keep learning about waste categories.";
    }

    private String determineBinColor(String categoryType) {
        if (categoryType.equals("Biodegradable")) {
            return "Green";
        }

        if (categoryType.equals("Recyclable")) {
            return "Blue";
        }

        if (categoryType.equals("Non-Biodegradable")) {
            return "Black";
        }

        return "Grey";
    }

    private ScanResultDTO buildScanResult(
            String categoryType,
            int points,
            UserStats stats,
            String matchedKeyword,
            Integer rulePriority
    ) {
        String binColor = determineBinColor(categoryType);
        String motivationalMessage = generateMotivationalMessage(categoryType);

        return new ScanResultDTO(
                categoryType,
                binColor,
                categoryType,
                motivationalMessage,
                points,
                stats.getCurrentStreak(),
                stats.getTotalPoints(),
                matchedKeyword,
                rulePriority
        );
    }
}
