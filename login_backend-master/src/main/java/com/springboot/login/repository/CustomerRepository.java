package com.springboot.login.repository;

import com.springboot.login.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    
    Optional<Customer> findByEmail(String email);
}
