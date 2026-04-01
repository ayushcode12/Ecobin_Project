package com.ecobin.EcoBin_Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ClassificationPreviewDTO {

    private String categoryType;
    private Integer points;
    private String matchedKeyword;
    private Integer rulePriority;
}
