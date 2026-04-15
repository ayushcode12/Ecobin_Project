package com.ecobin.EcoBin_Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsSummaryDTO {
    private Integer totalPoints;
    private Integer currentStreak;
    private Integer treesPlanted;
    private Integer pointsToNextTree;
    private Integer treeProgressPercent;
    private Long totalScans;
}
