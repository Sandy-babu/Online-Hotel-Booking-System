package com.springboot.login.service;

import com.springboot.login.dto.PaymentRequestDTO;
import com.springboot.login.dto.PaymentResponseDTO;
import com.springboot.login.entity.Booking;
import com.springboot.login.entity.Customer;
import com.springboot.login.entity.Payment;
import com.springboot.login.repository.BookingRepository;
import com.springboot.login.repository.CustomerRepository;
import com.springboot.login.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    /**
     * Process a payment for a booking
     */
    @Transactional
    public PaymentResponseDTO processPayment(PaymentRequestDTO paymentRequestDTO, String customerEmail) {
        logger.info("Processing payment for booking reference: {}", paymentRequestDTO.getBookingReference());
        
        // 1. Validate booking exists
        Optional<Booking> bookingOpt = bookingRepository.findByBookingReference(paymentRequestDTO.getBookingReference());
        if (bookingOpt.isEmpty()) {
            logger.error("Booking not found for reference: {}", paymentRequestDTO.getBookingReference());
            return new PaymentResponseDTO(
                paymentRequestDTO.getBookingReference(),
                paymentRequestDTO.getAmount(),
                "FAILED",
                "Booking not found"
            );
        }
        
        Booking booking = bookingOpt.get();
        
        // 2. Validate customer
        Optional<Customer> customerOpt = customerRepository.findByEmail(customerEmail);
        if (customerOpt.isEmpty()) {
            logger.error("Customer not found with email: {}", customerEmail);
            return new PaymentResponseDTO(
                paymentRequestDTO.getBookingReference(),
                paymentRequestDTO.getAmount(),
                "FAILED",
                "Customer not found"
            );
        }
        
        Customer customer = customerOpt.get();
        
        // 3. Check if payment already exists
        if (paymentRepository.existsByBookingReference(paymentRequestDTO.getBookingReference())) {
            logger.warn("Payment already exists for booking reference: {}", paymentRequestDTO.getBookingReference());
            return new PaymentResponseDTO(
                paymentRequestDTO.getBookingReference(),
                paymentRequestDTO.getAmount(),
                "FAILED",
                "Payment already processed for this booking"
            );
        }
        
        // 4. Validate payment amount matches booking amount
        if (booking.getTotalPrice().compareTo(paymentRequestDTO.getAmount()) != 0) {
            logger.error("Payment amount {} does not match booking amount {}", 
                paymentRequestDTO.getAmount(), booking.getTotalPrice());
            return new PaymentResponseDTO(
                paymentRequestDTO.getBookingReference(),
                paymentRequestDTO.getAmount(),
                "FAILED",
                "Payment amount does not match booking amount"
            );
        }
        
        // 5. Process payment with payment gateway (simulated here)
        PaymentResponseDTO paymentResponse = processWithPaymentGateway(paymentRequestDTO);
        
        // 6. Save payment record in database
        if ("COMPLETED".equals(paymentResponse.getPaymentStatus())) {
            Payment payment = new Payment();
            payment.setBookingReference(paymentRequestDTO.getBookingReference());
            payment.setAmount(paymentRequestDTO.getAmount());
            payment.setPaymentStatus("COMPLETED");
            payment.setPaymentMethod(paymentRequestDTO.getPaymentMethod());
            payment.setCardLastFour(paymentRequestDTO.getCardLastFour());
            payment.setTransactionId(paymentResponse.getTransactionId());
            payment.setPaymentGateway("STRIPE"); // Example gateway
            payment.setPaymentDate(LocalDateTime.now());
            payment.setCustomer(customer);
            
            paymentRepository.save(payment);
            
            // 7. Update booking status
            booking.setStatus("CONFIRMED");
            booking.setIsPaid(true);
            bookingRepository.save(booking);
            
            logger.info("Payment completed successfully for booking reference: {}", paymentRequestDTO.getBookingReference());
        } else {
            // Record failed payment attempt
            Payment payment = new Payment();
            payment.setBookingReference(paymentRequestDTO.getBookingReference());
            payment.setAmount(paymentRequestDTO.getAmount());
            payment.setPaymentStatus("FAILED");
            payment.setPaymentMethod(paymentRequestDTO.getPaymentMethod());
            payment.setCardLastFour(paymentRequestDTO.getCardLastFour());
            payment.setErrorMessage(paymentResponse.getMessage());
            payment.setPaymentGateway("STRIPE"); // Example gateway
            payment.setPaymentDate(LocalDateTime.now());
            payment.setCustomer(customer);
            
            paymentRepository.save(payment);
            
            logger.error("Payment failed for booking reference: {}", paymentRequestDTO.getBookingReference());
        }
        
        return paymentResponse;
    }
    
    /**
     * Simulate processing with a payment gateway
     * In a real application, this would integrate with a real payment gateway API like Stripe, PayPal, etc.
     */
    private PaymentResponseDTO processWithPaymentGateway(PaymentRequestDTO paymentRequestDTO) {
        // This is a simulation of a payment gateway integration
        // In a real application, you would integrate with an actual payment gateway API
        
        PaymentResponseDTO response = new PaymentResponseDTO();
        response.setBookingReference(paymentRequestDTO.getBookingReference());
        response.setAmount(paymentRequestDTO.getAmount());
        response.setPaymentMethod(paymentRequestDTO.getPaymentMethod());
        response.setCardLastFour(paymentRequestDTO.getCardLastFour());
        response.setPaymentDate(LocalDateTime.now());
        
        // Generate a transaction ID
        String transactionId = "TX-" + UUID.randomUUID().toString().substring(0, 8);
        response.setTransactionId(transactionId);
        
        // Simulate payment processing
        // In a real application, this would involve calling the payment gateway API
        // For demo purposes, we'll randomly succeed or fail based on card number
        // Cards ending in odd numbers succeed, even numbers fail (just a simple rule for demo)
        String lastDigit = paymentRequestDTO.getCardNumber().substring(paymentRequestDTO.getCardNumber().length() - 1);
        boolean isSuccess = Integer.parseInt(lastDigit) % 2 != 0;
        
        if (isSuccess) {
            response.setPaymentStatus("COMPLETED");
            response.setMessage("Payment processed successfully");
        } else {
            response.setPaymentStatus("FAILED");
            response.setMessage("Payment declined by issuing bank");
        }
        
        return response;
    }
    
    /**
     * Get payment by booking reference
     */
    public Optional<Payment> getPaymentByBookingReference(String bookingReference) {
        return paymentRepository.findByBookingReference(bookingReference);
    }
    
    /**
     * Get all payments for a customer
     */
    public List<Payment> getPaymentsByCustomer(Customer customer) {
        return paymentRepository.findByCustomer(customer);
    }
    
    /**
     * Get all payments
     */
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }
}