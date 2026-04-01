package com.ecobin.EcoBin_Backend.repository;

import com.ecobin.EcoBin_Backend.model.ScanHistory;
import com.ecobin.EcoBin_Backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScanHistoryRepository extends JpaRepository<ScanHistory, Long> {

    @Query("""
            select s from ScanHistory s
            where s.user = :user
              and (:categoryType is null or upper(s.categoryType) = upper(:categoryType))
              and (:fromDate is null or s.createdAt >= :fromDate)
              and (:toDate is null or s.createdAt <= :toDate)
            order by s.createdAt desc
            """)
    List<ScanHistory> findByUserAndFilters(
            @Param("user") User user,
            @Param("categoryType") String categoryType,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );
}
