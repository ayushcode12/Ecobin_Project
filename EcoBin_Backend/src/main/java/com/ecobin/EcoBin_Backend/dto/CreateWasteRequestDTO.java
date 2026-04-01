package com.ecobin.EcoBin_Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateWasteRequestDTO {

    private Long categoryId;
    private String textDescription;
    private String imageUrl;

    private String severity;
    private Integer estimatedQuantity;
    private String address;
    private Double latitude;
    private Double longitude;
}
