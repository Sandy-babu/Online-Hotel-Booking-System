package com.springboot.login.repository;

import com.springboot.login.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
	
	boolean existsByEmail(String email);
	boolean existsByUsername(String username);
	
    Optional<Admin> findByEmail(String email);
}
