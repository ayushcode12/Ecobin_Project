package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.dto.ClassificationPreviewDTO;
import com.ecobin.EcoBin_Backend.dto.ClassificationRuleDTO;
import com.ecobin.EcoBin_Backend.model.ClassificationRule;
import com.ecobin.EcoBin_Backend.repository.ClassificationRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
public class ClassificationRuleService {

    private static final List<String> ALLOWED_CATEGORIES = List.of(
            "Biodegradable",
            "Recyclable",
            "Non-Biodegradable"
    );

    @Autowired
    private ClassificationRuleRepository classificationRuleRepository;

    public List<ClassificationRuleDTO> getAllRules(String categoryType) {
        List<ClassificationRule> rules = (categoryType == null || categoryType.isBlank())
                ? classificationRuleRepository.findAll()
                : classificationRuleRepository.findByCategoryTypeIgnoreCase(categoryType.trim());

        return rules.stream()
                .sorted(ruleComparator())
                .map(this::toDto)
                .toList();
    }

    public ClassificationRuleDTO createRule(ClassificationRuleDTO dto) {
        ClassificationRule newRule = new ClassificationRule();
        applyChanges(newRule, dto);
        return toDto(classificationRuleRepository.save(newRule));
    }

    public ClassificationRuleDTO updateRule(Long id, ClassificationRuleDTO dto) {
        ClassificationRule existing = classificationRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found"));

        applyChanges(existing, dto);
        return toDto(classificationRuleRepository.save(existing));
    }

    public void deleteRule(Long id) {
        if (!classificationRuleRepository.existsById(id)) {
            throw new RuntimeException("Rule not found");
        }
        classificationRuleRepository.deleteById(id);
    }

    public ClassificationPreviewDTO classifyText(String text) {
        String normalizedText = normalizeText(text);

        List<ClassificationRule> rules = classificationRuleRepository.findByActiveTrue()
                .stream()
                .sorted(ruleComparator())
                .toList();

        for (ClassificationRule rule : rules) {
            String normalizedKeyword = normalizeText(rule.getKeyword());
            if (normalizedKeyword.isBlank()) {
                continue;
            }

            if (normalizedText.contains(normalizedKeyword)) {
                return new ClassificationPreviewDTO(
                        normalizeCategory(rule.getCategoryType()),
                        rule.getPoints() == null ? defaultPointsForCategory(rule.getCategoryType()) : rule.getPoints(),
                        rule.getKeyword(),
                        rule.getPriority() == null ? 100 : rule.getPriority()
                );
            }
        }

        return fallbackClassification(normalizedText);
    }

    private ClassificationPreviewDTO fallbackClassification(String normalizedText) {
        if (normalizedText.contains("peel") || normalizedText.contains("organic") || normalizedText.contains("food")) {
            return new ClassificationPreviewDTO("Biodegradable", defaultPointsForCategory("Biodegradable"), "fallback-organic", 0);
        }

        if (normalizedText.contains("paper") || normalizedText.contains("glass") ||
                normalizedText.contains("can") || normalizedText.contains("bottle")) {
            return new ClassificationPreviewDTO("Recyclable", defaultPointsForCategory("Recyclable"), "fallback-recyclable", 0);
        }

        return new ClassificationPreviewDTO("Non-Biodegradable", defaultPointsForCategory("Non-Biodegradable"), "fallback-default", 0);
    }

    private void applyChanges(ClassificationRule rule, ClassificationRuleDTO dto) {
        String category = normalizeCategory(dto.getCategoryType());
        if (!ALLOWED_CATEGORIES.contains(category)) {
            throw new RuntimeException("Invalid category type. Allowed: " + String.join(", ", ALLOWED_CATEGORIES));
        }

        String keyword = normalizeText(dto.getKeyword());
        if (keyword.isBlank()) {
            throw new RuntimeException("Keyword is required");
        }

        rule.setCategoryType(category);
        rule.setKeyword(keyword);
        rule.setPriority(dto.getPriority() == null ? 100 : dto.getPriority());
        rule.setPoints(dto.getPoints() == null ? defaultPointsForCategory(category) : dto.getPoints());
        rule.setActive(dto.getActive() == null ? true : dto.getActive());
    }

    private String normalizeCategory(String value) {
        if (value == null) {
            return "";
        }
        String normalized = value.trim().toLowerCase(Locale.ROOT);

        return switch (normalized) {
            case "biodegradable" -> "Biodegradable";
            case "recyclable" -> "Recyclable";
            case "non-biodegradable", "non biodegradable", "nonbiodegradable" -> "Non-Biodegradable";
            default -> value.trim();
        };
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private int defaultPointsForCategory(String categoryType) {
        String normalizedCategory = normalizeCategory(categoryType);
        if (normalizedCategory.equals("Non-Biodegradable")) return 10;
        if (normalizedCategory.equals("Recyclable")) return 8;
        return 5;
    }

    private Comparator<ClassificationRule> ruleComparator() {
        return Comparator
                .comparing((ClassificationRule rule) -> rule.getPriority() == null ? 0 : rule.getPriority())
                .reversed()
                .thenComparing(rule -> rule.getKeyword() == null ? 0 : rule.getKeyword().length(), Comparator.reverseOrder())
                .thenComparing(rule -> rule.getId() == null ? Long.MAX_VALUE : rule.getId());
    }

    private ClassificationRuleDTO toDto(ClassificationRule rule) {
        return new ClassificationRuleDTO(
                rule.getId(),
                rule.getCategoryType(),
                rule.getKeyword(),
                rule.getPriority(),
                rule.getPoints(),
                rule.getActive(),
                rule.getCreatedAt(),
                rule.getUpdatedAt()
        );
    }
}
