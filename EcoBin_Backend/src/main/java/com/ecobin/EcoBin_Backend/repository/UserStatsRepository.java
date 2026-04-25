package com.ecobin.EcoBin_Backend.repository;

import com.ecobin.EcoBin_Backend.model.User;
import com.ecobin.EcoBin_Backend.model.UserStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserStatsRepository extends JpaRepository<UserStats, Long> {

    public Optional<UserStats> findByUser(User user);

    List<UserStats> findAllByOrderByTotalPointsDesc();

    @org.springframework.data.jpa.repository.Query("SELECT us FROM UserStats us WHERE us.user.role NOT LIKE '%ADMIN%' ORDER BY us.totalPoints DESC")
    List<UserStats> findLeaderboardExcludingAdmins();

}
