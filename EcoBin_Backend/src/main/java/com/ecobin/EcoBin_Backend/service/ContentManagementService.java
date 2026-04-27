package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.model.Announcement;
import com.ecobin.EcoBin_Backend.model.EcoTip;
import com.ecobin.EcoBin_Backend.repository.AnnouncementRepository;
import com.ecobin.EcoBin_Backend.repository.EcoTipRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContentManagementService {

    @Autowired
    private EcoTipRepository ecoTipRepository;

    @Autowired
    private AnnouncementRepository announcementRepository;

    // Eco Tips
    public List<EcoTip> getAllTips() { return ecoTipRepository.findAll(); }
    public EcoTip saveTip(EcoTip tip) { return ecoTipRepository.save(tip); }
    public void deleteTip(Long id) { ecoTipRepository.deleteById(id); }

    // Announcements
    public List<Announcement> getAllAnnouncements() { return announcementRepository.findAll(); }
    public List<Announcement> getActiveAnnouncements() { return announcementRepository.findByActiveTrue(); }
    public Announcement saveAnnouncement(Announcement announcement) { return announcementRepository.save(announcement); }
    public void deleteAnnouncement(Long id) { announcementRepository.deleteById(id); }
}
