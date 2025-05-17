package com.springboot.login.service;

import com.springboot.login.dto.BookingRequestDTO;
import com.springboot.login.entity.Booking;
import com.springboot.login.entity.Customer;
import com.springboot.login.entity.Hotel;
import com.springboot.login.entity.Room;
import com.springboot.login.repository.BookingRepository;
import com.springboot.login.repository.CustomerRepository;
import com.springboot.login.repository.HotelRepository;
import com.springboot.login.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private CustomerRepository customerRepository;
    
    @Autowired
    private HotelRepository hotelRepository;
    
    @Autowired
    private RoomRepository roomRepository;
    
    /**
     * Create a new booking
     */
    @Transactional
    public Booking createBooking(BookingRequestDTO bookingRequestDTO, String customerEmail) {
        logger.info("Creating booking for customer email: {}", customerEmail);
        
        // 1. Find the customer
        Optional<Customer> customerOpt = customerRepository.findByEmail(customerEmail);
        if (customerOpt.isEmpty()) {
            logger.error("Customer not found with email: {}", customerEmail);
            throw new RuntimeException("Customer not found");
        }
        
        Customer customer = customerOpt.get();
        
        // 2. Find the hotel
        Optional<Hotel> hotelOpt = hotelRepository.findById(bookingRequestDTO.getHotelId());
        if (hotelOpt.isEmpty()) {
            logger.error("Hotel not found with ID: {}", bookingRequestDTO.getHotelId());
            throw new RuntimeException("Hotel not found");
        }
        
        Hotel hotel = hotelOpt.get();
        
        // 3. Find the room
        Optional<Room> roomOpt = roomRepository.findById(bookingRequestDTO.getRoomId());
        if (roomOpt.isEmpty()) {
            logger.error("Room not found with ID: {}", bookingRequestDTO.getRoomId());
            throw new RuntimeException("Room not found");
        }
        
        Room room = roomOpt.get();
        
        // 4. Validate booking dates
        LocalDate checkIn = bookingRequestDTO.getCheckIn();
        LocalDate checkOut = bookingRequestDTO.getCheckOut();
        
        if (checkIn.isEqual(checkOut) || checkIn.isAfter(checkOut)) {
            logger.error("Invalid booking dates: check-in date must be before check-out date");
            throw new RuntimeException("Check-in date must be before check-out date");
        }
        
        if (checkIn.isBefore(LocalDate.now())) {
            logger.error("Invalid booking dates: check-in date cannot be in the past");
            throw new RuntimeException("Check-in date cannot be in the past");
        }
        
        // 5. Check if room is available for the requested dates
        if (!isRoomAvailableForDates(room.getId(), checkIn, checkOut)) {
            logger.error("Room is not available for the requested dates");
            throw new RuntimeException("Room is not available for the requested dates");
        }
        
        // 6. Generate booking reference if not provided
        String bookingReference = bookingRequestDTO.getBookingReference();
        if (bookingReference == null || bookingReference.isEmpty()) {
            // Generate a unique booking reference
            String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
            String randomStr = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
            bookingReference = "HB-" + timestamp + "-" + randomStr;
        }
        
        // 7. Create the booking
        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setHotel(hotel);
        booking.setRoom(room);
        booking.setCheckIn(checkIn);
        booking.setCheckOut(checkOut);
        booking.setGuests(bookingRequestDTO.getGuests());
        booking.setTotalPrice(bookingRequestDTO.getTotalPrice());
        booking.setBookingReference(bookingReference);
        booking.setStatus("PENDING"); // Initial status is PENDING until payment is made
        booking.setBookingDate(LocalDateTime.now());
        booking.setIsPaid(false);
        booking.setSpecialRequests(bookingRequestDTO.getSpecialRequests());
        
        Booking savedBooking = bookingRepository.save(booking);
        logger.info("Booking created successfully with reference: {}", savedBooking.getBookingReference());
        
        return savedBooking;
    }
    
    /**
     * Check if a room is available for the specified dates
     */
    private boolean isRoomAvailableForDates(Long roomId, LocalDate checkIn, LocalDate checkOut) {
        // Get all confirmed bookings for this room
        List<Booking> existingBookings = bookingRepository.findByRoom(roomRepository.findById(roomId).get());
        
        // Filter for bookings with status CONFIRMED or PENDING that overlap with the requested dates
        for (Booking booking : existingBookings) {
            if (("CONFIRMED".equals(booking.getStatus()) || "PENDING".equals(booking.getStatus())) && 
                    datesOverlap(booking.getCheckIn(), booking.getCheckOut(), checkIn, checkOut)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check if two date ranges overlap
     */
    private boolean datesOverlap(LocalDate existingCheckIn, LocalDate existingCheckOut, 
                               LocalDate newCheckIn, LocalDate newCheckOut) {
        return newCheckIn.isBefore(existingCheckOut) && newCheckOut.isAfter(existingCheckIn);
    }
    
    /**
     * Get booking by reference
     */
    public Optional<Booking> getBookingByReference(String bookingReference) {
        return bookingRepository.findByBookingReference(bookingReference);
    }
    
    /**
     * Get bookings for a customer
     */
    public List<Booking> getBookingsByCustomer(String customerEmail) {
        Optional<Customer> customerOpt = customerRepository.findByEmail(customerEmail);
        if (customerOpt.isEmpty()) {
            logger.error("Customer not found with email: {}", customerEmail);
            throw new RuntimeException("Customer not found");
        }
        
        return bookingRepository.findByCustomer(customerOpt.get());
    }
    
    /**
     * Cancel a booking
     */
    @Transactional
    public Booking cancelBooking(String bookingReference, String customerEmail) {
        Optional<Customer> customerOpt = customerRepository.findByEmail(customerEmail);
        if (customerOpt.isEmpty()) {
            logger.error("Customer not found with email: {}", customerEmail);
            throw new RuntimeException("Customer not found");
        }
        
        Optional<Booking> bookingOpt = bookingRepository.findByBookingReference(bookingReference);
        if (bookingOpt.isEmpty()) {
            logger.error("Booking not found with reference: {}", bookingReference);
            throw new RuntimeException("Booking not found");
        }
        
        Booking booking = bookingOpt.get();
        
        // Validate that the booking belongs to the customer
        if (!booking.getCustomer().getId().equals(customerOpt.get().getId())) {
            logger.error("Booking does not belong to customer: {}", customerEmail);
            throw new RuntimeException("You are not authorized to cancel this booking");
        }
        
        // Check if booking can be cancelled (e.g., not already cancelled, not in the past)
        if ("CANCELLED".equals(booking.getStatus())) {
            logger.error("Booking is already cancelled: {}", bookingReference);
            throw new RuntimeException("Booking is already cancelled");
        }
        
        if (LocalDate.now().isAfter(booking.getCheckIn())) {
            logger.error("Booking cannot be cancelled after check-in date: {}", bookingReference);
            throw new RuntimeException("Booking cannot be cancelled after check-in date");
        }
        
        // Update booking status
        booking.setStatus("CANCELLED");
        return bookingRepository.save(booking);
    }
    
    /**
     * Get all bookings for a hotel
     */
    public List<Booking> getBookingsByHotel(Long hotelId) {
        Optional<Hotel> hotelOpt = hotelRepository.findById(hotelId);
        if (hotelOpt.isEmpty()) {
            logger.error("Hotel not found with ID: {}", hotelId);
            throw new RuntimeException("Hotel not found");
        }
        
        return bookingRepository.findByHotel(hotelOpt.get());
    }
    
    /**
     * Get all bookings
     */
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}