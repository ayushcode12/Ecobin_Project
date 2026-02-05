package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.model.Category;
import com.ecobin.EcoBin_Backend.model.User;
import com.ecobin.EcoBin_Backend.model.UserStats;
import com.ecobin.EcoBin_Backend.model.WasteRequest;
import com.ecobin.EcoBin_Backend.repository.CategoryRepository;
import com.ecobin.EcoBin_Backend.repository.UserRepository;
import com.ecobin.EcoBin_Backend.repository.UserStatsRepository;
import com.ecobin.EcoBin_Backend.repository.WasteRequestRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class WasteRequestService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WasteRequestRepository wasteRequestRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserStatsRepository userStatsRepository;


    // ===========================
    // CREATE REQUEST  (User)
    // ===========================
    public WasteRequest createWasteRequest(WasteRequest request, String loggedInEmail) {

        User user = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        request.setUser(user);

        // Category validation
        if (request.getCategory() != null) {
            Category cat = categoryRepository.findById(request.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            request.setCategory(cat);
        }

        // AI placeholder
        String categoryType = (request.getCategory() != null)
                ? request.getCategory().getCategoryType()
                : "Unknown";

        fillAiFields(request, categoryType);

        // Bonus points for reporting waste
        int bonusPoints = 3;
        request.setPoints(bonusPoints);

        // Save request FIRST
        WasteRequest saved = wasteRequestRepository.save(request);

        // Then update user stats
        addBonusPoints(user, bonusPoints);

        return saved;
    }



    // ===========================
    // UPDATE STATUS  (Admin)
    // ===========================
    public WasteRequest updateStatus(Long id, String newStatus) {

        WasteRequest request = wasteRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Waste request not found"));

        request.setStatus(newStatus);

        int extraPoints = 0;

        if (newStatus.equalsIgnoreCase("APPROVED")) {
            extraPoints = 2;
        } else if (newStatus.equalsIgnoreCase("COMPLETED")) {
            extraPoints = 5;
        }

        if (extraPoints > 0) {
            request.setPoints(request.getPoints() + extraPoints);
            addBonusPoints(request.getUser(), extraPoints);
        }

        return wasteRequestRepository.save(request);
    }



    // ===========================
    // ASSIGN PICKUP (Admin)
    // ===========================
    public WasteRequest assignPickup(Long id, LocalDateTime date) {

        WasteRequest request = wasteRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Waste request not found"));

        request.setPickupDate(date);

        // Points for scheduling pickup
        int extraPoints = 3;
        request.setPoints(request.getPoints() + extraPoints);

        addBonusPoints(request.getUser(), extraPoints);

        return wasteRequestRepository.save(request);
    }



    // ===========================
    // My Requests (User)
    // ===========================
    public List<WasteRequest> getMyRequests(String loggedInEmail) {
        User user = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return wasteRequestRepository.findByUser(user);
    }

    // ===========================
    // All Requests (Admin)
    // ===========================
    public List<WasteRequest> getAllRequests() {
        return wasteRequestRepository.findAll();
    }



    // ===========================
    // Helpers
    // ===========================
    private void addBonusPoints(User user, int points) {
        UserStats stats = userStatsRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("UserStats not found"));

        stats.setTotalPoints(stats.getTotalPoints() + points);
        userStatsRepository.save(stats);
    }

    private WasteRequest fillAiFields(WasteRequest request, String categoryType) {
        request.setAiPrediction(categoryType);
        request.setMotivationalMessage("AI will generate a message soon.");
        return request;
    }
}
