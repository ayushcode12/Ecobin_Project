package com.ecobin.EcoBin_Backend.controller;

import com.ecobin.EcoBin_Backend.dto.LeaderboardEntryDTO;
import com.ecobin.EcoBin_Backend.service.LeaderboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin
public class LeaderboardController {

    @Autowired
    private LeaderboardService leaderboardService;

    @GetMapping("/leaderboard")
    public List<LeaderboardEntryDTO> getLeaderboard(){
        return leaderboardService.getLeaderboard();
    }

}
