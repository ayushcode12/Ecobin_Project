package com.ecobin.EcoBin_Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScanResultDTO {

    private String categoryType;
    private String binColor;
    private String aiPrediction;
    private String motivationalMessage;
    private Integer pointsAwarded;
    private Integer updatedStreak;
    private Integer updatedTotalPoints;
    private String matchedKeyword;
    private Integer rulePriority;

}
