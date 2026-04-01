package com.ecobin.EcoBin_Backend.controller;

import com.ecobin.EcoBin_Backend.dto.ClassificationPreviewDTO;
import com.ecobin.EcoBin_Backend.dto.ClassificationRuleDTO;
import com.ecobin.EcoBin_Backend.service.ClassificationRuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rules")
@CrossOrigin
public class ClassificationRuleController {

    @Autowired
    private ClassificationRuleService classificationRuleService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ClassificationRuleDTO> getRules(
            @RequestParam(required = false) String categoryType
    ) {
        return classificationRuleService.getAllRules(categoryType);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ClassificationRuleDTO createRule(@RequestBody ClassificationRuleDTO dto) {
        return classificationRuleService.createRule(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ClassificationRuleDTO updateRule(
            @PathVariable Long id,
            @RequestBody ClassificationRuleDTO dto
    ) {
        return classificationRuleService.updateRule(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteRule(@PathVariable Long id) {
        classificationRuleService.deleteRule(id);
    }

    @GetMapping("/preview")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ClassificationPreviewDTO previewClassification(
            @RequestParam String text
    ) {
        return classificationRuleService.classifyText(text);
    }
}
