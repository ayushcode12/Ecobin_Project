package com.ecobin.EcoBin_Backend.controller;

import com.ecobin.EcoBin_Backend.dto.CreateWasteRequestDTO;
import com.ecobin.EcoBin_Backend.dto.UpdateWasteRequestStatusDTO;
import com.ecobin.EcoBin_Backend.dto.WasteRequestDTO;
import com.ecobin.EcoBin_Backend.mapper.DtoMapper;
import com.ecobin.EcoBin_Backend.mapper.UserMapper;
import com.ecobin.EcoBin_Backend.model.WasteRequest;
import com.ecobin.EcoBin_Backend.service.WasteRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping({"/api/requests", "/api/request"})
@CrossOrigin
public class WasteRequestController {

    @Autowired
    private WasteRequestService wasteRequestService;

    @Autowired
    private DtoMapper dtoMapper;

    @Autowired
    private UserMapper userMapper;

    @PostMapping
    public WasteRequestDTO createWasteRequest(@RequestBody CreateWasteRequestDTO request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        WasteRequest saved = wasteRequestService.createWasteRequest(request, email);
        return dtoMapper.toWasteRequestDTO(saved, userMapper.toDto(saved.getUser()));
    }

    @GetMapping("/my")
    public List<WasteRequestDTO> getMyRequest(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String categoryType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return wasteRequestService.getMyRequests(email, status, categoryType, dateFrom, dateTo)
                .stream()
                .map(request -> dtoMapper.toWasteRequestDTO(request, userMapper.toDto(request.getUser())))
                .toList();
    }

    @GetMapping(value = "/my/export", produces = "text/csv")
    public ResponseEntity<String> exportMyRequestCsv(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String categoryType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo
    ) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String csv = wasteRequestService.exportMyRequestsCsv(email, status, categoryType, dateFrom, dateTo);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=my_reports.csv")
                .contentType(new MediaType("text", "csv"))
                .body(csv);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<WasteRequestDTO> getAllRequest() {
        return wasteRequestService.getAllRequests()
                .stream()
                .map(request -> dtoMapper.toWasteRequestDTO(request, userMapper.toDto(request.getUser())))
                .toList();
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public WasteRequestDTO updateStatus(
            @PathVariable Long id,
            @RequestBody UpdateWasteRequestStatusDTO statusUpdate
    ) {
        WasteRequest updated = wasteRequestService.updateStatus(id, statusUpdate);
        return dtoMapper.toWasteRequestDTO(updated, userMapper.toDto(updated.getUser()));
    }

    @PutMapping("/{id}/pickup")
    @PreAuthorize("hasRole('ADMIN')")
    public WasteRequestDTO assignPickup(
            @PathVariable Long id,
            @RequestParam String date
    ) {
        LocalDateTime pickupDate = LocalDateTime.parse(date);
        WasteRequest updated = wasteRequestService.assignPickup(id, pickupDate);

        return dtoMapper.toWasteRequestDTO(updated, userMapper.toDto(updated.getUser()));
    }

}
