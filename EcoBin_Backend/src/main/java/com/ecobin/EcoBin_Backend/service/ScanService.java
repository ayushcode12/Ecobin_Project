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
        ClassificationPreviewDTO classification = classificationRuleService.classifyText(textDescription);

        String categoryType = classification.getCategoryType();
        int points = classification.getPoints() == null ? 3 : classification.getPoints();

        updateStreak(stats);
        stats.setTotalPoints(stats.getTotalPoints() + points);
        userStatsRepository.save(stats);

        scanHistoryService.saveScan(
                user,
                textDescription,
                imageUrl,
                categoryType,
                classification.getMatchedKeyword(),
                classification.getRulePriority(),
                points
        );

        return buildScanResult(
                categoryType,
                points,
                stats,
                classification.getMatchedKeyword(),
                classification.getRulePriority()
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
