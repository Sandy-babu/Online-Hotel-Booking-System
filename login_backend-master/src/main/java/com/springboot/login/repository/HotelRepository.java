package com.springboot.login.repository;

import com.springboot.login.entity.Hotel;
import com.springboot.login.entity.Manager;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByManager(Manager manager);
    Optional<Hotel> findByName(String name);
    
    List<Hotel> findByNameContainingIgnoreCase(String name);
    List<Hotel> findByAddressContainingIgnoreCase(String address);
    List<Hotel> findByNameContainingIgnoreCaseAndAddressContainingIgnoreCase(String name, String address);
    Optional<Hotel> findFirstByNameContainingIgnoreCase(String name);
    List<Hotel> findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(String name, String address);
//    Optional<Hotel> findByNameIgnoreCase(String name);
//    List<Hotel> findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(String name, String address);
}
