package com.ecobin.EcoBin_Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassificationRuleDTO {

    private Long id;
    private String categoryType;
    private String keyword;
    private Integer priority;
    private Integer points;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
