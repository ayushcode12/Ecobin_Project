package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.repository.ScanHistoryRepository;
import com.ecobin.EcoBin_Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AnalyticsService {

    @Autowired
    private ScanHistoryRepository scanHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getAdminDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalUsers", userRepository.count());
        stats.put("totalClassifications", scanHistoryRepository.count());
        
        stats.put("recyclableItems", scanHistoryRepository.countByCategoryType("Recyclable"));
        stats.put("biodegradableItems", scanHistoryRepository.countByCategoryType("Biodegradable"));
        stats.put("nonBiodegradableItems", scanHistoryRepository.countByCategoryType("Non-Biodegradable"));
        
        // Trends (Recent activity in last 30 days)
        LocalDateTime monthAgo = LocalDateTime.now().minusDays(30);
        stats.put("recentScans", scanHistoryRepository.countRecentScans(monthAgo));
        
        return stats;
    }
}
