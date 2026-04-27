package com.ecobin.EcoBin_Backend.controller;

import com.ecobin.EcoBin_Backend.model.AdminActionLog;
import com.ecobin.EcoBin_Backend.service.LoggingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/logs")
public class AdminLogController {

    @Autowired
    private LoggingService loggingService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminActionLog> getAdminLogs() {
        return loggingService.getAllAdminLogs();
    }
}
