package com.ecobin.EcoBin_Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WasteRequestDTO {

    private Long id;
    private UserResponseDTO user;    // safe user
    private CategoryDTO category;    // safe category

    private String textDescription;
    private String imageUrl;
    private String aiPrediction;
    private String motivationalMessage;
    private Integer points;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime pickupDate;
}
