package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.dto.LeaderboardEntryDTO;
import com.ecobin.EcoBin_Backend.model.UserStats;
import com.ecobin.EcoBin_Backend.repository.UserStatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaderboardService {

    @Autowired
    private UserStatsRepository userStatsRepository;

    public List<LeaderboardEntryDTO> getLeaderboard(){
        List<UserStats> stats = userStatsRepository.findLeaderboardExcludingAdmins();

        return stats.stream()
                .map(s -> new LeaderboardEntryDTO(
                        s.getUser().getName(),
                        s.getTotalPoints(),
                        s.getCurrentStreak()
                ))
                .toList();
    }

}
