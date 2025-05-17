package com.springboot.login.repository;

import com.springboot.login.entity.Booking;
import com.springboot.login.entity.Customer;
import com.springboot.login.entity.Hotel;
import com.springboot.login.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    List<Booking> findByCustomer(Customer customer);
    
    List<Booking> findByHotel(Hotel hotel);
    
    List<Booking> findByRoom(Room room);
    
    Optional<Booking> findByBookingReference(String bookingReference);
    
    List<Booking> findByStatus(String status);
    
    List<Booking> findByCustomerAndStatus(Customer customer, String status);
    
    List<Booking> findByHotelAndStatus(Hotel hotel, String status);
    
    List<Booking> findByCheckInBetween(LocalDate startDate, LocalDate endDate);
    
    boolean existsByBookingReference(String bookingReference);
}