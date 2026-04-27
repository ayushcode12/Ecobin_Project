package com.ecobin.EcoBin_Backend.repository;

import com.ecobin.EcoBin_Backend.model.User;
import com.ecobin.EcoBin_Backend.model.WasteRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WasteRequestRepository extends JpaRepository<WasteRequest, Long> {
    List<WasteRequest> findByUser(User user);
    List<WasteRequest> findByUserOrderByCreatedAtDesc(User user);

    @Query("""
            select wr from WasteRequest wr
            where wr.user = :user
              and (:status is null or wr.status = :status)
              and (:categoryType is null or (wr.category is not null and wr.category.categoryType = :categoryType))
              and (:fromDate is null or wr.createdAt >= :fromDate)
              and (:toDate is null or wr.createdAt <= :toDate)
            order by wr.createdAt desc
            """)
    List<WasteRequest> findMyRequestsWithFilters(
            @Param("user") User user,
            @Param("status") String status,
            @Param("categoryType") String categoryType,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );
}
