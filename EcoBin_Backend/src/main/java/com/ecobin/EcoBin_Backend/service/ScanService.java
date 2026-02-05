package com.ecobin.EcoBin_Backend.service;

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

    public ScanResultDTO processScan(String textDescription, String imageUrl, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserStats stats = getOrCreateUserStats(user);

        String categoryType = detectCategory(textDescription);

        updateStreak(stats);

        int points = calculatePoints(categoryType);

        stats.setTotalPoints(stats.getTotalPoints() + points);

        userStatsRepository.save(stats);

        return buildScanResult(categoryType, points, stats);
    }

    private UserStats getOrCreateUserStats(User user){
        Optional<UserStats> existing = userStatsRepository.findByUser(user);

        if (existing.isPresent()){
            return existing.get();
        }

        UserStats newStats = new UserStats();
        newStats.setUser(user);
        newStats.setTotalPoints(0);
        newStats.setCurrentStreak(0);
        newStats.setLastSubmissionDate(null);

        return userStatsRepository.save(newStats);
    }

    private void updateStreak(UserStats stats){
        LocalDate today = LocalDate.now();

        if(stats.getLastSubmissionDate() == null){
            stats.setCurrentStreak(1);
            stats.setLastSubmissionDate(today);
            return;
        }

        if(stats.getLastSubmissionDate().equals(today)) return;

        if(stats.getLastSubmissionDate().equals(today.minusDays(1))){
            stats.setCurrentStreak(stats.getCurrentStreak() + 1);
            stats.setLastSubmissionDate(today);
            return;
        }

        stats.setCurrentStreak(1);
        stats.setLastSubmissionDate(today);
    }

    private String detectCategory(String textDescription){

        String text = textDescription.toLowerCase();

        if (text.contains("banana") || text.contains("food")) return "Biodegradable";
        if (text.contains("plastic") || text.contains("wrapper")) return "Non-Biodegradable";
        if (text.contains("battery") || text.contains("chemical")) return "Hazardous";
        return "Recyclable";

    }

    private int calculatePoints(String categoryType){

        if (categoryType.equals("Hazardous")) return 20;
        if (categoryType.equals("Non-Biodegradable")) return 10;
        if (categoryType.equals("Recyclable")) return 5;
        if (categoryType.equals("Biodegradable")) return 2;
        return 1;

    }

    private String generateMotivationalMessage(String categoryType){

        if (categoryType.equals("Hazardous"))
            return "Great job identifying hazardous waste! Proper disposal prevents serious harm.";

        if (categoryType.equals("Non-Biodegradable"))
            return "You’re helping reduce pollution! Non-biodegradable waste must be handled carefully.";

        if (categoryType.equals("Recyclable"))
            return "Awesome! Recycling this item helps save energy and resources.";

        if (categoryType.equals("Biodegradable"))
            return "Nice! Biodegradable waste can return to nature and reduce landfill load.";

        return "Every small effort matters! Keep learning about waste categories.";

    }

    private String determineBinColor(String categoryType){

        if (categoryType.equals("Biodegradable"))
            return "Green";

        if (categoryType.equals("Recyclable"))
            return "Blue";

        if (categoryType.equals("Hazardous"))
            return "Red";

        if (categoryType.equals("Non-Biodegradable"))
            return "Black";

        return "Grey";

    }

    private ScanResultDTO buildScanResult(String categoryType, int points, UserStats stats){

        String binColor = determineBinColor(categoryType);
        String motivationalMessage = generateMotivationalMessage(categoryType);

        return new ScanResultDTO(
                categoryType,
                binColor,
                categoryType,
                motivationalMessage,
                points,
                stats.getCurrentStreak(),
                stats.getTotalPoints()
        );
    }

}