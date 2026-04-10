package com.ecobin.EcoBin_Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LiveScanPreviewDTO {

    private String categoryType;
    private String binColor;
    private Double confidence;
    private String rawLabel;
    private String statusMessage;
}
