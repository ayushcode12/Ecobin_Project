package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.dto.ScanHistoryDTO;
import com.ecobin.EcoBin_Backend.model.ScanHistory;
import com.ecobin.EcoBin_Backend.model.User;
import com.ecobin.EcoBin_Backend.repository.ScanHistoryRepository;
import com.ecobin.EcoBin_Backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ScanHistoryService {

    @Autowired
    private ScanHistoryRepository scanHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    public void saveScan(
            User user,
            String textDescription,
            String imageUrl,
            String categoryType,
            String matchedKeyword,
            Integer rulePriority,
            Integer pointsAwarded
    ) {
        ScanHistory scan = new ScanHistory();
        scan.setUser(user);
        scan.setTextDescription(textDescription);
        // Never persist raw base64 — store a placeholder instead to keep DB lightweight
        if (imageUrl != null && imageUrl.startsWith("data:")) {
            scan.setImageUrl("base64-image-used");
        } else {
            scan.setImageUrl(imageUrl);
        }
        scan.setCategoryType(categoryType);
        scan.setMatchedKeyword(matchedKeyword);
        scan.setRulePriority(rulePriority);
        scan.setPointsAwarded(pointsAwarded);
        scanHistoryRepository.save(scan);
    }

    public List<ScanHistoryDTO> getMyScans(
            String loggedInEmail,
            String categoryType,
            LocalDateTime fromDate,
            LocalDateTime toDate
    ) {
        User user = userRepository.findByEmail(loggedInEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return scanHistoryRepository.findByUserAndFilters(user, normalize(categoryType), fromDate, toDate)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public List<ScanHistoryDTO> getMyRecentScans(String loggedInEmail, int limit) {
        int safeLimit = Math.max(1, limit);
        return getMyScans(loggedInEmail, null, null, null)
                .stream()
                .limit(safeLimit)
                .toList();
    }

    public List<ScanHistoryDTO> getAllScans() {
        return scanHistoryRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toDto)
                .toList();
    }

    public String exportMyScansCsv(
            String loggedInEmail,
            String categoryType,
            LocalDateTime fromDate,
            LocalDateTime toDate
    ) {
        List<ScanHistoryDTO> scans = getMyScans(loggedInEmail, categoryType, fromDate, toDate);
        StringBuilder csv = new StringBuilder();
        csv.append("id,createdAt,categoryType,textDescription,matchedKeyword,rulePriority,pointsAwarded,imageUrl\n");

        for (ScanHistoryDTO scan : scans) {
            csv.append(scan.getId()).append(",")
                    .append(csvValue(scan.getCreatedAt())).append(",")
                    .append(csvValue(scan.getCategoryType())).append(",")
                    .append(csvValue(scan.getTextDescription())).append(",")
                    .append(csvValue(scan.getMatchedKeyword())).append(",")
                    .append(csvValue(scan.getRulePriority())).append(",")
                    .append(csvValue(scan.getPointsAwarded())).append(",")
                    .append(csvValue(scan.getImageUrl()))
                    .append("\n");
        }

        return csv.toString();
    }

    private ScanHistoryDTO toDto(ScanHistory scan) {
        return new ScanHistoryDTO(
                scan.getId(),
                scan.getTextDescription(),
                scan.getImageUrl(),
                scan.getCategoryType(),
                scan.getMatchedKeyword(),
                scan.getRulePriority(),
                scan.getPointsAwarded(),
                scan.getCreatedAt()
        );
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String csvValue(Object value) {
        if (value == null) return "";
        String raw = String.valueOf(value).replace("\"", "\"\"");
        return "\"" + raw + "\"";
    }
}
