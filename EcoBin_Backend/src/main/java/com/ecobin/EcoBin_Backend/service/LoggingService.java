package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.model.AdminActionLog;
import com.ecobin.EcoBin_Backend.repository.AdminActionLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LoggingService {

    @Autowired
    private AdminActionLogRepository adminActionLogRepository;

    public void logAction(String adminEmail, String action, String target, String details) {
        AdminActionLog log = new AdminActionLog();
        log.setAdminEmail(adminEmail);
        log.setAction(action);
        log.setTarget(target);
        log.setDetails(details);
        adminActionLogRepository.save(log);
    }

    public List<AdminActionLog> getAllAdminLogs() {
        return adminActionLogRepository.findAllByOrderByTimestampDesc();
    }
}
