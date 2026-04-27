package com.ecobin.EcoBin_Backend.controller;

import com.ecobin.EcoBin_Backend.model.Announcement;
import com.ecobin.EcoBin_Backend.model.EcoTip;
import com.ecobin.EcoBin_Backend.service.ContentManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/content")
public class ContentManagementController {

    @Autowired
    private ContentManagementService contentService;

    // Tips API
    @GetMapping("/tips")
    public List<EcoTip> getAllTips() { return contentService.getAllTips(); }

    @PostMapping("/tips")
    @PreAuthorize("hasRole('ADMIN')")
    public EcoTip createTip(@RequestBody EcoTip tip) { return contentService.saveTip(tip); }

    @DeleteMapping("/tips/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTip(@PathVariable Long id) { contentService.deleteTip(id); }

    // Announcements API
    @GetMapping("/announcements")
    public List<Announcement> getAllAnnouncements() { return contentService.getAllAnnouncements(); }

    @PostMapping("/announcements")
    @PreAuthorize("hasRole('ADMIN')")
    public Announcement createAnnouncement(@RequestBody Announcement announcement) { return contentService.saveAnnouncement(announcement); }

    @DeleteMapping("/announcements/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteAnnouncement(@PathVariable Long id) { contentService.deleteAnnouncement(id); }
}
