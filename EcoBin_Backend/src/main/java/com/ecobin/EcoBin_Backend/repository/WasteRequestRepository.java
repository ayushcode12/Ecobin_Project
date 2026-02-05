package com.ecobin.EcoBin_Backend.repository;

import com.ecobin.EcoBin_Backend.model.User;
import com.ecobin.EcoBin_Backend.model.WasteRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WasteRequestRepository extends JpaRepository<WasteRequest, Long> {
    List<WasteRequest> findByUser(User user);
}
