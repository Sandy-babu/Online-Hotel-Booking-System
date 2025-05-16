package com.springboot.login.repository;

import com.springboot.login.entity.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ManagerRepository extends JpaRepository<Manager, Long> {
	
	@Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Manager m WHERE LOWER(m.email) = LOWER(:email)")
	boolean existsByEmail(@Param("email") String email);
	
	boolean existsByUsername(String username);
	
	@Query("SELECT m FROM Manager m WHERE LOWER(m.email) = LOWER(:email)")
	Optional<Manager> findByEmail(@Param("email") String email);
}
