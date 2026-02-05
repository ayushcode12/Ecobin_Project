package com.ecobin.EcoBin_Backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "waste_requests")
public class WasteRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @ManyToOne
    @JoinColumn(name = "category_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Category category;

    private String description;
    private String imageUrl;
    private String aiPrediction;
    private String motivationalMessage;

    private Integer points;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime pickupDate;

    @PrePersist
    void onCreate(){
         createdAt = LocalDateTime.now();
         status = "PENDING";
    }
}
