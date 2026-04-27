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

    List<ScanHistory> findAllByOrderByCreatedAtDesc();

    long countByUser(User user);

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
    );    @Query("SELECT COUNT(s) FROM ScanHistory s WHERE s.categoryType = :categoryType")
    long countByCategoryType(@Param("categoryType") String categoryType);

    @Query("SELECT COUNT(s) FROM ScanHistory s WHERE s.createdAt >= :since")
    long countRecentScans(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(s) FROM ScanHistory s WHERE s.categoryType = :categoryType AND s.createdAt >= :since")
    long countRecentScansByCategory(@Param("categoryType") String categoryType, @Param("since") LocalDateTime since);
}
