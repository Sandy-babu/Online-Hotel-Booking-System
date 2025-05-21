package com.springboot.login.controller;

import com.springboot.login.entity.Hotel;
import com.springboot.login.entity.Manager;
import com.springboot.login.entity.HotelManager;
import com.springboot.login.repository.HotelRepository;
import com.springboot.login.repository.ManagerRepository;
import com.springboot.login.repository.HotelManagerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.Base64;
import com.springboot.login.dto.HotelDTO;

@RestController
@RequestMapping("/manager/hotel")
public class HotelController {
    private static final Logger logger = LoggerFactory.getLogger(HotelController.class);

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private HotelManagerRepository hotelManagerRepository;

    // Create Hotel
    @PostMapping("/add")
    public String addHotel(@RequestBody HotelDTO hotelDTO, @RequestParam String email) {
        Optional<Manager> managerOpt = managerRepository.findByEmail(email);
        if (managerOpt.isEmpty()) return "Manager not found!";

        // Check if a hotel with the same name already exists
        if (hotelRepository.findByName(hotelDTO.getName()).isPresent()) {
            return "Hotel name already exists!";
        }

        Hotel hotel = new Hotel();
        hotel.setName(hotelDTO.getName());
        hotel.setAddress(hotelDTO.getAddress());
        hotel.setContact(hotelDTO.getContact());
        hotel.setDescription(hotelDTO.getDescription());
        hotel.setAmenities(hotelDTO.getAmenities());
        hotel.setManager(managerOpt.get());
        // Handle image as base64 string
        if (hotelDTO.getImage() != null && !hotelDTO.getImage().isEmpty()) {
            try {
                String base64Data = hotelDTO.getImage();
                if (base64Data.startsWith("data:image")) {
                    base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
                }
                hotel.setImage(Base64.getDecoder().decode(base64Data));
            } catch (Exception e) {
                // Ignore, keep as is
            }
        }
        hotelRepository.save(hotel);
        return "Hotel added successfully!";
    }

    // View Hotels by Manager
    @GetMapping("/view")
    public ResponseEntity<?> viewHotels(@RequestParam String email) {
        try {
            logger.info("Attempting to fetch hotels for manager email: {}", email);
            
            // First try to find in managers table
            Optional<Manager> managerOpt = managerRepository.findByEmail(email);
            if (managerOpt.isPresent()) {
                logger.info("Found manager in managers table: {}", email);
                List<Hotel> hotels = hotelRepository.findByManager(managerOpt.get());
                logger.info("Found {} hotels for manager {}", hotels.size(), email);
                // Map image to base64 string
                List<java.util.Map<String, Object>> response = hotels.stream().map(hotel -> {
                    java.util.Map<String, Object> data = new java.util.HashMap<>();
                    data.put("id", hotel.getId());
                    data.put("name", hotel.getName());
                    data.put("address", hotel.getAddress());
                    data.put("contact", hotel.getContact());
                    data.put("description", hotel.getDescription());
                    data.put("amenities", hotel.getAmenities());
                    if (hotel.getImage() != null) {
                        data.put("image", "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(hotel.getImage()));
                    } else {
                        data.put("image", null);
                    }
                    return data;
                }).toList();
                return ResponseEntity.ok(response);
            }

            // If not found, try hotel_managers table
            Optional<HotelManager> hotelManagerOpt = hotelManagerRepository.findByEmail(email);
            if (hotelManagerOpt.isPresent()) {
                logger.info("Found manager in hotel_managers table: {}", email);
                // For hotel managers, we need to find hotels by name
                List<Hotel> hotels = hotelRepository.findByNameContainingIgnoreCase(hotelManagerOpt.get().getHotelName());
                logger.info("Found {} hotels for hotel manager {}", hotels.size(), email);
                return ResponseEntity.ok(hotels);
            }

            logger.warn("No manager found for email: {}", email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Manager not found with email: " + email);
        } catch (Exception e) {
            logger.error("Error fetching hotels for email {}: {}", email, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error fetching hotels: " + e.getMessage());
        }
    }

    @PutMapping("/update/by-id/{id}")
    public String updateHotelById(@PathVariable Long id, @RequestParam String email, @RequestBody HotelDTO updatedHotel) {
        Optional<Manager> managerOpt = managerRepository.findByEmail(email);
        if (managerOpt.isEmpty()) return "Manager not found!";

        Optional<Hotel> hotelOpt = hotelRepository.findById(id);
        if (hotelOpt.isEmpty()) return "Hotel not found!";

        Hotel hotel = hotelOpt.get();
        hotel.setName(updatedHotel.getName());
        hotel.setAddress(updatedHotel.getAddress());
        hotel.setContact(updatedHotel.getContact());
        hotel.setDescription(updatedHotel.getDescription());
        hotel.setAmenities(updatedHotel.getAmenities());
        // Handle image as base64 string
        if (updatedHotel.getImage() != null && !updatedHotel.getImage().isEmpty()) {
            try {
                String base64Data = updatedHotel.getImage();
                if (base64Data.startsWith("data:image")) {
                    base64Data = base64Data.substring(base64Data.indexOf(",") + 1);
                }
                hotel.setImage(Base64.getDecoder().decode(base64Data));
            } catch (Exception e) {
                // Ignore, keep as is
            }
        }
        hotelRepository.save(hotel);
        return "Hotel updated successfully!";
    }

    @PutMapping("/update/by-name")
    public String updateHotelByName(@RequestParam String name, @RequestParam String email, @RequestBody Hotel updatedHotel) {
        Optional<Manager> managerOpt = managerRepository.findByEmail(email);
        if (managerOpt.isEmpty()) return "Manager not found!";

        Optional<Hotel> hotelOpt = hotelRepository.findByName(name);
        if (hotelOpt.isEmpty()) return "Hotel not found!";

        Hotel hotel = hotelOpt.get();
        hotel.setName(updatedHotel.getName());
        hotel.setAddress(updatedHotel.getAddress());
        hotel.setContact(updatedHotel.getContact());
        hotel.setDescription(updatedHotel.getDescription());
        hotel.setAmenities(updatedHotel.getAmenities());
        hotelRepository.save(hotel);

        return "Hotel updated successfully!";
    }

    @DeleteMapping("/delete/by-id/{id}")
    public String deleteHotelById(@PathVariable Long id, @RequestParam String email) {
        Optional<Manager> managerOpt = managerRepository.findByEmail(email);
        if (managerOpt.isEmpty()) return "Manager not found!";

        if (!hotelRepository.existsById(id)) return "Hotel not found!";

        hotelRepository.deleteById(id);
        return "Hotel deleted successfully!";
    }

    @DeleteMapping("/delete/by-name")
    public String deleteHotelByName(@RequestParam String name, @RequestParam String email) {
        Optional<Manager> managerOpt = managerRepository.findByEmail(email);
        if (managerOpt.isEmpty()) return "Manager not found!";

        Optional<Hotel> hotelOpt = hotelRepository.findByName(name);
        if (hotelOpt.isEmpty()) return "Hotel not found!";

        hotelRepository.delete(hotelOpt.get());
        return "Hotel deleted successfully!";
    }
    
    @GetMapping("/all")
    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }
}
