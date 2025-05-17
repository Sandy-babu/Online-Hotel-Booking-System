package com.springboot.login.controller;

import com.springboot.login.dto.PaymentRequestDTO;
import com.springboot.login.dto.PaymentResponseDTO;
import com.springboot.login.entity.Customer;
import com.springboot.login.entity.Payment;
import com.springboot.login.repository.CustomerRepository;
import com.springboot.login.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    
    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    /**
     * Process a payment
     */
    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@Valid @RequestBody PaymentRequestDTO paymentRequestDTO,
                                           @RequestParam String email) {
        logger.info("Payment processing request received for booking reference: {}", paymentRequestDTO.getBookingReference());
        
        try {
            PaymentResponseDTO response = paymentService.processPayment(paymentRequestDTO, email);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error processing payment: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Payment processing failed: " + e.getMessage());
        }
    }
    
    /**
     * Get payment by booking reference
     */
    @GetMapping("/booking/{bookingReference}")
    public ResponseEntity<?> getPaymentByBookingReference(@PathVariable String bookingReference,
                                                         @RequestParam String email) {
        logger.info("Fetching payment for booking reference: {}", bookingReference);
        
        try {
            Optional<Payment> payment = paymentService.getPaymentByBookingReference(bookingReference);
            
            if (payment.isPresent()) {
                // Check if the payment belongs to the requesting customer
                Optional<Customer> customer = customerRepository.findByEmail(email);
                
                if (customer.isPresent() && payment.get().getCustomer().getId().equals(customer.get().getId())) {
                    return ResponseEntity.ok(payment.get());
                } else {
                    logger.warn("Unauthorized access attempt to payment for booking reference: {}", bookingReference);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to view this payment");
                }
            } else {
                logger.warn("Payment not found for booking reference: {}", bookingReference);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error fetching payment: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching payment: " + e.getMessage());
        }
    }
    
    /**
     * Get all payments for a customer
     */
    @GetMapping("/customer")
    public ResponseEntity<?> getCustomerPayments(@RequestParam String email) {
        logger.info("Fetching all payments for customer: {}", email);
        
        try {
            Optional<Customer> customerOpt = customerRepository.findByEmail(email);
            
            if (customerOpt.isPresent()) {
                List<Payment> payments = paymentService.getPaymentsByCustomer(customerOpt.get());
                return ResponseEntity.ok(payments);
            } else {
                logger.warn("Customer not found with email: {}", email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }
        } catch (Exception e) {
            logger.error("Error fetching customer payments: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching payments: " + e.getMessage());
        }
    }
    
    /**
     * Admin endpoint to get all payments (restricted to admin users)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllPayments() {
        logger.info("Admin request to fetch all payments");
        
        try {
            List<Payment> payments = paymentService.getAllPayments();
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            logger.error("Error fetching all payments: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching payments: " + e.getMessage());
        }
    }
}