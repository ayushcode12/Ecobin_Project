package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.model.ClassificationRule;
import com.ecobin.EcoBin_Backend.repository.ClassificationRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ClassificationRuleSeeder implements ApplicationRunner {

    @Autowired
    private ClassificationRuleRepository classificationRuleRepository;

    @Override
    public void run(ApplicationArguments args) {
        if (classificationRuleRepository.count() > 0) {
            return;
        }

        List<ClassificationRule> defaults = List.of(
                create("Biodegradable", "banana peel", 300, 8),
                create("Biodegradable", "apple core", 300, 8),
                create("Biodegradable", "vegetable peel", 300, 8),
                create("Biodegradable", "food waste", 300, 8),
                create("Biodegradable", "leftover food", 300, 8),
                create("Biodegradable", "tea leaves", 300, 8),
                create("Biodegradable", "coffee grounds", 300, 8),
                create("Biodegradable", "eggshell", 300, 8),
                create("Biodegradable", "dry leaves", 250, 8),
                create("Biodegradable", "grass clippings", 250, 8),

                create("Recyclable", "plastic bottle", 300, 10),
                create("Recyclable", "water bottle", 300, 10),
                create("Recyclable", "glass bottle", 300, 10),
                create("Recyclable", "newspaper", 300, 10),
                create("Recyclable", "cardboard", 300, 10),
                create("Recyclable", "milk carton", 250, 10),
                create("Recyclable", "aluminum can", 300, 10),
                create("Recyclable", "steel can", 250, 10),
                create("Recyclable", "tin can", 250, 10),
                create("Recyclable", "detergent bottle", 250, 10),

                create("Non-Biodegradable", "chips packet", 300, 5),
                create("Non-Biodegradable", "snack wrapper", 300, 5),
                create("Non-Biodegradable", "plastic bag", 300, 5),
                create("Non-Biodegradable", "styrofoam", 300, 5),
                create("Non-Biodegradable", "thermocol", 300, 5),
                create("Non-Biodegradable", "toothbrush", 250, 5),
                create("Non-Biodegradable", "diaper", 250, 5),
                create("Non-Biodegradable", "sanitary pad", 250, 5),
                create("Non-Biodegradable", "cigarette butt", 250, 5),
                create("Non-Biodegradable", "shampoo sachet", 250, 5)
        );

        classificationRuleRepository.saveAll(defaults);
    }

    private ClassificationRule create(String categoryType, String keyword, Integer priority, Integer points) {
        ClassificationRule rule = new ClassificationRule();
        rule.setCategoryType(categoryType);
        rule.setKeyword(keyword);
        rule.setPriority(priority);
        rule.setPoints(points);
        rule.setActive(true);
        return rule;
    }
}
