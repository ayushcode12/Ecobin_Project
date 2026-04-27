package com.ecobin.EcoBin_Backend.repository;

import com.ecobin.EcoBin_Backend.model.AdminActionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminActionLogRepository extends JpaRepository<AdminActionLog, Long> {
    List<AdminActionLog> findAllByOrderByTimestampDesc();
}
