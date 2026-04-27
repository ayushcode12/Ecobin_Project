package com.ecobin.EcoBin_Backend.repository;

import com.ecobin.EcoBin_Backend.model.EcoTip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EcoTipRepository extends JpaRepository<EcoTip, Long> {
}
