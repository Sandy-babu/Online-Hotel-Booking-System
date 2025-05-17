package com.springboot.login.repository;

import com.springboot.login.entity.Payment;
import com.springboot.login.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    List<Payment> findByCustomer(Customer customer);
    
    Optional<Payment> findByBookingReference(String bookingReference);
    
    List<Payment> findByPaymentStatus(String status);
    
    boolean existsByBookingReference(String bookingReference);
}