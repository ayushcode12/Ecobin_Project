package com.ecobin.EcoBin_Backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateWasteRequestStatusDTO {

    private String status;
    private String adminNote;
    private String resolutionProofUrl;
}
