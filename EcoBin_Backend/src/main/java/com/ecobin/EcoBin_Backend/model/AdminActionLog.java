package com.ecobin.EcoBin_Backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_action_logs")
@Data
public class AdminActionLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String adminEmail;
    private String action; // e.g., UPDATE_USER_STATUS, RESET_SCORE
    private String target; // e.g., User ID or Name
    private String details;
    
    private LocalDateTime timestamp;

    @PrePersist
    void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
