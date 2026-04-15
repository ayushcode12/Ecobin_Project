package com.ecobin.EcoBin_Backend.controller;

import com.ecobin.EcoBin_Backend.dto.UserStatsSummaryDTO;
import com.ecobin.EcoBin_Backend.model.User;
import com.ecobin.EcoBin_Backend.model.UserStats;
import com.ecobin.EcoBin_Backend.repository.ScanHistoryRepository;
import com.ecobin.EcoBin_Backend.repository.UserRepository;
import com.ecobin.EcoBin_Backend.repository.UserStatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin
public class UserStatsController {

    private static final int POINTS_PER_TREE = 30;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserStatsRepository userStatsRepository;

    @Autowired
    private ScanHistoryRepository scanHistoryRepository;

    @GetMapping("/me")
    public UserStatsSummaryDTO getMyStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserStats stats = userStatsRepository.findByUser(user)
                .orElseGet(() -> {
                    UserStats newStats = new UserStats();
                    newStats.setUser(user);
                    newStats.setTotalPoints(0);
                    newStats.setCurrentStreak(0);
                    newStats.setLastSubmissionDate(null);
                    return userStatsRepository.save(newStats);
                });

        int totalPoints = stats.getTotalPoints() == null ? 0 : stats.getTotalPoints();
        int currentStreak = stats.getCurrentStreak() == null ? 0 : stats.getCurrentStreak();
        int treesPlanted = totalPoints / POINTS_PER_TREE;
        int remainder = totalPoints % POINTS_PER_TREE;
        int treeProgressPercent = totalPoints == 0 ? 0 : (remainder == 0 ? 100 : (int) Math.round((remainder * 100.0d) / POINTS_PER_TREE));
        int pointsToNextTree = totalPoints == 0 ? POINTS_PER_TREE : (remainder == 0 ? 0 : POINTS_PER_TREE - remainder);
        long totalScans = scanHistoryRepository.countByUser(user);

        return new UserStatsSummaryDTO(
                totalPoints,
                currentStreak,
                treesPlanted,
                pointsToNextTree,
                treeProgressPercent,
                totalScans
        );
    }
}
