package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.dto.CreateWasteRequestDTO;
import com.ecobin.EcoBin_Backend.dto.UpdateWasteRequestStatusDTO;
import com.ecobin.EcoBin_Backend.model.Category;
import com.ecobin.EcoBin_Backend.model.User;
import com.ecobin.EcoBin_Backend.model.UserStats;
import com.ecobin.EcoBin_Backend.model.WasteRequest;
import com.ecobin.EcoBin_Backend.repository.CategoryRepository;
import com.ecobin.EcoBin_Backend.repository.UserRepository;
import com.ecobin.EcoBin_Backend.repository.UserStatsRepository;
import com.ecobin.EcoBin_Backend.repository.WasteRequestRepository;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@AllArgsConstructor
public class WasteRequestService {

    private static final Map<String, Set<String>> STATUS_TRANSITIONS = Map.of(
            "PENDING", Set.of("APPROVED"),
            "APPROVED", Set.of("IN_PROGRESS"),
            "IN_PROGRESS", Set.of("COMPLETED", "REJECTED"),
            "COMPLETED", Set.of(),
            "REJECTED", Set.of()
    );

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WasteRequestRepository wasteRequestRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserStatsRepository userStatsRepository;

    public WasteRequest createWasteRequest(CreateWasteRequestDTO requestDto, String loggedInEmail) {
        User user = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        WasteRequest request = new WasteRequest();
        request.setUser(user);
        request.setDescription(requestDto.getTextDescription());
        request.setImageUrl(requestDto.getImageUrl());
        request.setSeverity(normalizeSeverity(requestDto.getSeverity()));
        request.setEstimatedQuantity(safeQuantity(requestDto.getEstimatedQuantity()));
        request.setAddress(requestDto.getAddress());
        request.setLatitude(requestDto.getLatitude());
        request.setLongitude(requestDto.getLongitude());

        if (requestDto.getCategoryId() != null) {
            Category cat = categoryRepository.findById(requestDto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            request.setCategory(cat);
        }

        String categoryType = (request.getCategory() != null)
                ? request.getCategory().getCategoryType()
                : "Pending Review";

        fillAiFields(request, categoryType);

        int bonusPoints = 3;
        request.setPoints(bonusPoints);

        WasteRequest saved = wasteRequestRepository.save(request);
        addBonusPoints(user, bonusPoints);
        return saved;
    }

    private UserStats getOrCreateUserStats(User user) {
        return userStatsRepository.findByUser(user)
                .orElseGet(() -> {
                    UserStats newStats = new UserStats();
                    newStats.setUser(user);
                    newStats.setTotalPoints(0);
                    newStats.setCurrentStreak(0);
                    newStats.setLastSubmissionDate(null);
                    return userStatsRepository.save(newStats);
                });
    }

    public WasteRequest updateStatus(Long id, UpdateWasteRequestStatusDTO statusUpdate) {
        WasteRequest request = wasteRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Waste request not found"));

        String targetStatus = normalizeStatus(statusUpdate.getStatus());
        if (targetStatus == null) {
            throw new RuntimeException("Status is required");
        }

        String currentStatus = normalizeStatus(request.getStatus());
        if (currentStatus == null) {
            currentStatus = "PENDING";
        }

        if (!currentStatus.equals(targetStatus)) {
            Set<String> allowedTargets = STATUS_TRANSITIONS.getOrDefault(currentStatus, Set.of());
            if (!allowedTargets.contains(targetStatus)) {
                throw new RuntimeException(
                        "Invalid status transition. Allowed: " + currentStatus + " -> " + allowedTargets
                );
            }
        }

        if ("COMPLETED".equals(targetStatus)) {
            boolean hasIncomingProof = statusUpdate.getResolutionProofUrl() != null &&
                    !statusUpdate.getResolutionProofUrl().isBlank();
            boolean hasExistingProof = request.getResolutionProofUrl() != null &&
                    !request.getResolutionProofUrl().isBlank();

            if (!hasIncomingProof && !hasExistingProof) {
                throw new RuntimeException("Resolution proof image URL is required to mark report as COMPLETED");
            }
        }

        if (statusUpdate.getAdminNote() != null) {
            request.setAdminNote(statusUpdate.getAdminNote().trim());
        }

        if (statusUpdate.getResolutionProofUrl() != null && !statusUpdate.getResolutionProofUrl().isBlank()) {
            request.setResolutionProofUrl(statusUpdate.getResolutionProofUrl().trim());
        }

        int extraPoints = 0;
        if (!currentStatus.equals(targetStatus)) {
            request.setStatus(targetStatus);
            extraPoints = pointsForStatusTransition(targetStatus);
            if (extraPoints > 0) {
                request.setPoints((request.getPoints() == null ? 0 : request.getPoints()) + extraPoints);
            }
        }

        WasteRequest saved = wasteRequestRepository.save(request);

        if (extraPoints > 0) {
            addBonusPoints(saved.getUser(), extraPoints);
        }

        return saved;
    }

    public WasteRequest assignPickup(Long id, LocalDateTime date) {
        WasteRequest request = wasteRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Waste request not found"));

        String status = normalizeStatus(request.getStatus());
        if (!"APPROVED".equals(status) && !"IN_PROGRESS".equals(status)) {
            throw new RuntimeException("Pickup can be assigned only when report is APPROVED or IN_PROGRESS");
        }

        boolean firstAssignment = request.getPickupDate() == null;
        request.setPickupDate(date);

        int extraPoints = 0;
        if (firstAssignment) {
            extraPoints = 3;
            request.setPoints((request.getPoints() == null ? 0 : request.getPoints()) + extraPoints);
        }

        WasteRequest saved = wasteRequestRepository.save(request);
        if (extraPoints > 0) {
            addBonusPoints(saved.getUser(), extraPoints);
        }

        return saved;
    }

    public List<WasteRequest> getMyRequests(String loggedInEmail) {
        return getMyRequests(loggedInEmail, null, null, null, null);
    }

    public List<WasteRequest> getMyRequests(
            String loggedInEmail,
            String status,
            String categoryType,
            LocalDateTime fromDate,
            LocalDateTime toDate
    ) {
        User user = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return wasteRequestRepository.findMyRequestsWithFilters(
                user,
                normalizeBlank(status),
                normalizeBlank(categoryType),
                fromDate,
                toDate
        );
    }

    public String exportMyRequestsCsv(
            String loggedInEmail,
            String status,
            String categoryType,
            LocalDateTime fromDate,
            LocalDateTime toDate
    ) {
        List<WasteRequest> requests = getMyRequests(loggedInEmail, status, categoryType, fromDate, toDate);
        StringBuilder csv = new StringBuilder();
        csv.append("id,createdAt,status,severity,categoryType,description,address,latitude,longitude,estimatedQuantity,pickupDate,points,adminNote,resolutionProofUrl,imageUrl\n");

        for (WasteRequest request : requests) {
            csv.append(request.getId()).append(",")
                    .append(csvValue(request.getCreatedAt())).append(",")
                    .append(csvValue(request.getStatus())).append(",")
                    .append(csvValue(request.getSeverity())).append(",")
                    .append(csvValue(request.getCategory() == null ? null : request.getCategory().getCategoryType())).append(",")
                    .append(csvValue(request.getDescription())).append(",")
                    .append(csvValue(request.getAddress())).append(",")
                    .append(csvValue(request.getLatitude())).append(",")
                    .append(csvValue(request.getLongitude())).append(",")
                    .append(csvValue(request.getEstimatedQuantity())).append(",")
                    .append(csvValue(request.getPickupDate())).append(",")
                    .append(csvValue(request.getPoints())).append(",")
                    .append(csvValue(request.getAdminNote())).append(",")
                    .append(csvValue(request.getResolutionProofUrl())).append(",")
                    .append(csvValue(request.getImageUrl()))
                    .append("\n");
        }

        return csv.toString();
    }

    public List<WasteRequest> getAllRequests() {
        return wasteRequestRepository.findAll();
    }

    private void addBonusPoints(User user, int points) {
        UserStats stats = getOrCreateUserStats(user);
        stats.setTotalPoints(stats.getTotalPoints() + points);
        userStatsRepository.save(stats);
    }

    private WasteRequest fillAiFields(WasteRequest request, String categoryType) {
        request.setAiPrediction(categoryType);
        request.setMotivationalMessage("AI review will refine this report soon.");
        return request;
    }

    private String normalizeBlank(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private Integer safeQuantity(Integer quantity) {
        if (quantity == null) return 1;
        return Math.max(1, quantity);
    }

    private String normalizeSeverity(String severity) {
        if (severity == null || severity.isBlank()) {
            return "MEDIUM";
        }

        String normalized = severity.trim().toUpperCase();
        if (!Set.of("LOW", "MEDIUM", "HIGH").contains(normalized)) {
            throw new RuntimeException("Invalid severity. Allowed values: LOW, MEDIUM, HIGH");
        }
        return normalized;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        return status.trim().toUpperCase();
    }

    private int pointsForStatusTransition(String status) {
        if ("APPROVED".equals(status)) return 2;
        if ("COMPLETED".equals(status)) return 5;
        return 0;
    }

    private String csvValue(Object value) {
        if (value == null) return "";
        String raw = String.valueOf(value).replace("\"", "\"\"");
        return "\"" + raw + "\"";
    }
}
