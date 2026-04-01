package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.model.User;
import com.ecobin.EcoBin_Backend.model.UserStats;
import com.ecobin.EcoBin_Backend.repository.UserRepository;
import com.ecobin.EcoBin_Backend.repository.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserStatsBackfillService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserStatsRepository userStatsRepository;

    @Override
    public void run(String... args) {
        for (User user : userRepository.findAll()) {
            if (userStatsRepository.findByUser(user).isPresent()) {
                continue;
            }

            UserStats userStats = new UserStats();
            userStats.setUser(user);
            userStats.setTotalPoints(0);
            userStats.setCurrentStreak(0);
            userStats.setLastSubmissionDate(null);
            userStatsRepository.save(userStats);
        }
    }
}
