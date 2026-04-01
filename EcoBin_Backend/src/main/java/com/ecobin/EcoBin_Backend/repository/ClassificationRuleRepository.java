package com.ecobin.EcoBin_Backend.repository;

import com.ecobin.EcoBin_Backend.model.ClassificationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassificationRuleRepository extends JpaRepository<ClassificationRule, Long> {

    List<ClassificationRule> findByActiveTrue();

    List<ClassificationRule> findByCategoryTypeIgnoreCase(String categoryType);
}
