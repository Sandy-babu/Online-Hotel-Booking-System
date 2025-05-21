package com.springboot.login.controller;

import com.springboot.login.dto.BookingRequestDTO;
import com.springboot.login.entity.Booking;
import com.springboot.login.service.BookingService;
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
@RequestMapping("/customer/booking")
public class BookingController {

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);
    
    @Autowired
    private BookingService bookingService;
    
    /**
     * Create a booking
     */
    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequestDTO bookingRequestDTO,
                                          @RequestParam String email) {
        logger.info("Booking creation request received for customer: {}", email);
        
        try {
            Booking booking = bookingService.createBooking(bookingRequestDTO, email);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            logger.error("Error creating booking: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Booking creation failed: " + e.getMessage());
        }
    }
    
    /**
     * Get booking by reference
     */
    @GetMapping("/{bookingReference}")
    public ResponseEntity<?> getBookingByReference(@PathVariable String bookingReference,
                                                 @RequestParam String email) {
        logger.info("Fetching booking with reference: {} for customer: {}", bookingReference, email);
        
        try {
            Optional<Booking> booking = bookingService.getBookingByReference(bookingReference);
            
            if (booking.isPresent()) {
                // Check if the booking belongs to the requesting customer or it's an admin request
                if (booking.get().getCustomer().getEmail().equals(email)) {
                    return ResponseEntity.ok(booking.get());
                } else {
                    logger.warn("Unauthorized access attempt to booking: {}", bookingReference);
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to view this booking");
                }
            } else {
                logger.warn("Booking not found with reference: {}", bookingReference);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error fetching booking: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching booking: " + e.getMessage());
        }
    }
    
    /**
     * Get all bookings for a customer
     */
    @GetMapping("/all")
    public ResponseEntity<?> getCustomerBookings(@RequestParam String email) {
        logger.info("Fetching all bookings for customer: {}", email);
        
        try {
            List<Booking> bookings = bookingService.getBookingsByCustomer(email);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error fetching customer bookings: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching bookings: " + e.getMessage());
        }
    }
    
    /**
     * Cancel a booking
     */
    @PutMapping("/{bookingReference}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String bookingReference,
                                          @RequestParam String email) {
        logger.info("Cancellation request for booking: {} from customer: {}", bookingReference, email);
        
        try {
            Booking cancelledBooking = bookingService.cancelBooking(bookingReference, email);
            return ResponseEntity.ok(cancelledBooking);
        } catch (Exception e) {
            logger.error("Error cancelling booking: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Booking cancellation failed: " + e.getMessage());
        }
    }
    
    /**
     * Get all bookings for a hotel (manager access)
     */
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<?> getHotelBookings(@PathVariable Long hotelId) {
        logger.info("Fetching all bookings for hotel: {}", hotelId);
        
        try {
            List<Booking> bookings = bookingService.getBookingsByHotel(hotelId);
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error fetching hotel bookings: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching hotel bookings: " + e.getMessage());
        }
    }
    
    /**
     * Admin endpoint to get all bookings (restricted to admin users)
     */
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllBookings() {
        logger.info("Admin request to fetch all bookings");
        
        try {
            List<Booking> bookings = bookingService.getAllBookings();
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            logger.error("Error fetching all bookings: {}", e.getMessage(), e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching bookings: " + e.getMessage());
        }
    }
}