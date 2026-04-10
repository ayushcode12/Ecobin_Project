package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.dto.ClassificationPreviewDTO;
import com.ecobin.EcoBin_Backend.dto.LiveScanPreviewDTO;
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

    @Autowired
    private AiModelService aiModelService;

    public ScanResultDTO processScan(String textDescription, String imageUrl, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserStats stats = getOrCreateUserStats(user);

        String categoryType = "Unknown";
        int points = 3;
        String matchedKeyword = null;
        Integer rulePriority = null;
        boolean aiUsed = false;

        boolean hasRealImage = imageUrl != null
                && !imageUrl.trim().isEmpty()
                && !imageUrl.contains("placehold.co")
                && !imageUrl.equals("https://placehold.co/400");

        if (hasRealImage) {
            AiModelService.AiPredictionResult aiPrediction = aiModelService.predictImage(imageUrl);
            categoryType = aiPrediction.prediction();
            matchedKeyword = aiPrediction.confidence() == null
                    ? "AI-Model-Predicted"
                    : "AI-Model-Predicted (" + String.format("%.2f", aiPrediction.confidence()) + ")";
            points = 10;
            aiUsed = true;
            rulePriority = 1000;
            System.out.println("AI prediction: " + categoryType);
        }

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

    public LiveScanPreviewDTO previewLiveScan(String imageUrl) {
        boolean hasRealImage = imageUrl != null
                && !imageUrl.trim().isEmpty()
                && !imageUrl.contains("placehold.co")
                && !imageUrl.equals("https://placehold.co/400");

        if (!hasRealImage) {
            throw new IllegalArgumentException("A real image is required for live preview.");
        }

        AiModelService.AiPredictionResult aiPrediction = aiModelService.predictImage(imageUrl);
        String categoryType = aiPrediction.prediction();

        return new LiveScanPreviewDTO(
                categoryType,
                determineBinColor(categoryType),
                aiPrediction.confidence(),
                aiPrediction.rawLabel(),
                buildLiveStatusMessage(categoryType, aiPrediction.confidence())
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

    private String buildLiveStatusMessage(String categoryType, Double confidence) {
        if (confidence == null) {
            return "Reading live camera frame...";
        }

        if (confidence >= 0.80d) {
            return "Stable " + categoryType + " detection. Confirm to award points.";
        }

        if (confidence >= 0.60d) {
            return "Model is leaning toward " + categoryType + ". Hold the item steady.";
        }

        return "Detection is still uncertain. Keep the object inside the box.";
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
