package com.ecobin.EcoBin_Backend.mapper;

import com.ecobin.EcoBin_Backend.dto.*;
import com.ecobin.EcoBin_Backend.model.Category;
import com.ecobin.EcoBin_Backend.model.WasteRequest;
import org.springframework.stereotype.Component;

@Component
public class DtoMapper {

    public CategoryDTO toCategoryDTO(Category c) {
        if (c == null) return null;

        return new CategoryDTO(
                c.getId(),
                c.getCategoryType(),
                c.getName(),
                c.getDescription(),
                c.getBinColor()
        );
    }

    public WasteRequestDTO toWasteRequestDTO(WasteRequest wr, UserResponseDTO userDto) {
        return new WasteRequestDTO(
                wr.getId(),
                userDto,
                toCategoryDTO(wr.getCategory()),
                wr.getDescription(),
                wr.getImageUrl(),
                wr.getAiPrediction(),
                wr.getMotivationalMessage(),
                wr.getPoints(),
                wr.getStatus(),
                wr.getSeverity(),
                wr.getEstimatedQuantity(),
                wr.getAddress(),
                wr.getLatitude(),
                wr.getLongitude(),
                wr.getAdminNote(),
                wr.getResolutionProofUrl(),
                wr.getCreatedAt(),
                wr.getPickupDate()
        );
    }
}
