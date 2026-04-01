package com.ecobin.EcoBin_Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScanHistoryDTO {

    private Long id;
    private String textDescription;
    private String imageUrl;
    private String categoryType;
    private String matchedKeyword;
    private Integer rulePriority;
    private Integer pointsAwarded;
    private LocalDateTime createdAt;
}
