package com.ecobin.EcoBin_Backend.controller;

import com.ecobin.EcoBin_Backend.dto.ScanRequestDTO;
import com.ecobin.EcoBin_Backend.dto.ScanResultDTO;
import com.ecobin.EcoBin_Backend.service.ScanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scan")
@CrossOrigin
public class ScanController {

    @Autowired
    private ScanService scanService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")

    public ScanResultDTO scanWaste(@RequestBody ScanRequestDTO request){

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        return scanService.processScan(request.getTextDescription(), request.getImageUrl(), email);
    }

}
