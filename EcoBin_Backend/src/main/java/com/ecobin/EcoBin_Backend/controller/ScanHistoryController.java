package com.ecobin.EcoBin_Backend.controller;

import com.ecobin.EcoBin_Backend.dto.ScanHistoryDTO;
import com.ecobin.EcoBin_Backend.service.ScanHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping({"/api/scans", "/api/scan"})
@CrossOrigin
public class ScanHistoryController {

    @Autowired
    private ScanHistoryService scanHistoryService;

    @GetMapping("/my")
    public List<ScanHistoryDTO> getMyScans(
            @RequestParam(required = false) String categoryType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return scanHistoryService.getMyScans(email, categoryType, dateFrom, dateTo);
    }

    @GetMapping(value = "/my/export", produces = "text/csv")
    public ResponseEntity<String> exportMyScansCsv(
            @RequestParam(required = false) String categoryType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String csv = scanHistoryService.exportMyScansCsv(email, categoryType, dateFrom, dateTo);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=my_scans.csv")
                .contentType(new MediaType("text", "csv"))
                .body(csv);
    }
}
