package com.springboot.login.repository;

import com.springboot.login.entity.HotelManager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HotelManagerRepository extends JpaRepository<HotelManager, Long> {
    Optional<HotelManager> findByEmail(String email);
    Optional<HotelManager> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
} 