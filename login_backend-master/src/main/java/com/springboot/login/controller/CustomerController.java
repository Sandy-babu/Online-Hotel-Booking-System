package com.springboot.login.controller;

import com.springboot.login.dto.CustomerSignupDTO;
import com.springboot.login.dto.CustomerLoginDTO;
import com.springboot.login.entity.Customer;
import com.springboot.login.entity.Hotel;
import com.springboot.login.entity.Room;
import com.springboot.login.entity.Admin;
import com.springboot.login.entity.HotelManager;
import com.springboot.login.repository.CustomerRepository;
import com.springboot.login.repository.HotelRepository;
import com.springboot.login.repository.RoomRepository;
import com.springboot.login.repository.AdminRepository;
import com.springboot.login.repository.HotelManagerRepository;
import com.springboot.login.service.CustomerService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Base64;

@RestController
@RequestMapping("/customer")
public class CustomerController {

    private static final Logger logger = LoggerFactory.getLogger(CustomerController.class);

    @Autowired
    private CustomerService customerService;
    
    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private HotelManagerRepository managerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public String signup(@RequestBody CustomerSignupDTO signupDTO) {
        return customerService.registerCustomer(signupDTO);
    }

    @GetMapping("/all")
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> loginCustomer(@Valid @RequestBody CustomerLoginDTO loginDTO) {
        logger.debug("Received login request for email: {}", loginDTO.getEmail());
        return customerService.loginCustomer(loginDTO);
    }
    private boolean isCustomerValid(String email) {
        return customerRepository.findByEmail(email).isPresent();
    }

    // View All Hotels
    @GetMapping("/hotels")
    public ResponseEntity<?> viewHotels(@RequestParam String email) {
        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Customer email not found!");
        }

        List<Hotel> hotels = hotelRepository.findAll();
        List<Map<String, Object>> response = hotels.stream().map(hotel -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", hotel.getId());
            data.put("name", hotel.getName());
            data.put("address", hotel.getAddress());
            data.put("contact", hotel.getContact());
            data.put("description", hotel.getDescription());
            data.put("amenities", hotel.getAmenities());
            // Add image as base64 string
            if (hotel.getImage() != null) {
                data.put("image", "data:image/jpeg;base64," + java.util.Base64.getEncoder().encodeToString(hotel.getImage()));
            } else {
                data.put("image", null);
            }
            List<Map<String, Object>> roomList = hotel.getRooms().stream().map(room -> {
                Map<String, Object> roomData = new HashMap<>();
                roomData.put("id", room.getId());
                roomData.put("roomNumber", room.getRoomNumber());
                roomData.put("type", room.getType());
                roomData.put("price", room.getPrice());
                roomData.put("available", room.getAvailable());
                return roomData;
            }).toList();
            data.put("rooms", roomList);
            return data;
        }).toList();
        return ResponseEntity.ok(response);
    }

    // Get Hotel Details by ID
    @GetMapping("/hotels/{id}")
    public ResponseEntity<?> getHotelDetails(@PathVariable Long id, @RequestParam String email) {
        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Customer email not found!");
        }

        Optional<Hotel> hotelOpt = hotelRepository.findById(id);
        if (hotelOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Hotel not found!");
        }

        Hotel hotel = hotelOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("id", hotel.getId());
        response.put("name", hotel.getName());
        response.put("address", hotel.getAddress());
        response.put("contact", hotel.getContact());
        response.put("description", hotel.getDescription());
        response.put("amenities", hotel.getAmenities());
        // Add image as base64 string
        if (hotel.getImage() != null) {
            response.put("image", "data:image/jpeg;base64," + java.util.Base64.getEncoder().encodeToString(hotel.getImage()));
        } else {
            response.put("image", null);
        }
        // Map rooms to include id
        List<Map<String, Object>> roomList = hotel.getRooms().stream().map(room -> {
            Map<String, Object> roomData = new HashMap<>();
            roomData.put("id", room.getId());
            roomData.put("roomNumber", room.getRoomNumber());
            roomData.put("type", room.getType());
            roomData.put("price", room.getPrice());
            roomData.put("available", room.getAvailable());
            return roomData;
        }).toList();
        response.put("rooms", roomList);
        return ResponseEntity.ok(response);
    }

    // View Rooms in a Hotel
//    @GetMapping("/hotels/{hotelId}/rooms")
//    public ResponseEntity<?> getRoomsByHotel(@PathVariable Long hotelId, @RequestParam String email) {
//        if (!isCustomerValid(email)) {
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Customer email not found!");
//        }
//
//        Optional<Hotel> hotelOpt = hotelRepository.findById(hotelId);
//        if (hotelOpt.isEmpty()) {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Hotel not found!");
//        }
//
//        List<Room> rooms = roomRepository.findByHotel(hotelOpt.get());
//        return ResponseEntity.ok(rooms);
//    }
    
    // find rooms by hotel name
    @GetMapping("/hotels/rooms")
    public ResponseEntity<?> getRoomsByHotelName(
            @RequestParam String name,
            @RequestParam String email) {

        if (!isCustomerValid(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Customer email not found!");
        }

        Optional<Hotel> hotelOpt = hotelRepository.findFirstByNameContainingIgnoreCase(name);
        if (hotelOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Hotel not found!");
        }

        List<Room> rooms = roomRepository.findByHotel(hotelOpt.get());
        return ResponseEntity.ok(rooms);
    }


    // Search Hotels by keyword
    @GetMapping("/hotels/search")
    public ResponseEntity<?> searchHotels(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String address,
            @RequestParam String email) {
        logger.debug("Searching hotels with name: {}, address: {}, email: {}", name, address, email);
        if (!isCustomerValid(email)) {
            logger.warn("Invalid customer email: {}", email);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Customer email not found!");
        }
        List<Hotel> hotels;
        try {
            if (name != null && address != null && name.equals(address)) {
                hotels = hotelRepository.findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(name, name);
            } else if (name != null && address != null) {
                hotels = hotelRepository.findByNameContainingIgnoreCaseAndAddressContainingIgnoreCase(name, address);
            } else if (name != null) {
                hotels = hotelRepository.findByNameContainingIgnoreCase(name);
            } else if (address != null) {
                hotels = hotelRepository.findByAddressContainingIgnoreCase(address);
            } else {
                hotels = hotelRepository.findAll();
            }
            logger.info("Search params: name={}, address={}, found {} hotels", name, address, hotels.size());
            List<Map<String, Object>> response = hotels.stream().map(hotel -> {
                Map<String, Object> data = new HashMap<>();
                data.put("id", hotel.getId());
                data.put("name", hotel.getName());
                data.put("address", hotel.getAddress());
                data.put("contact", hotel.getContact());
                data.put("description", hotel.getDescription());
                data.put("amenities", hotel.getAmenities());
                // Add image as base64 string
                if (hotel.getImage() != null) {
                    data.put("image", "data:image/jpeg;base64," + java.util.Base64.getEncoder().encodeToString(hotel.getImage()));
                } else {
                    data.put("image", null);
                }
                List<Map<String, Object>> roomList = hotel.getRooms().stream().map(room -> {
                    Map<String, Object> roomData = new HashMap<>();
                    roomData.put("id", room.getId());
                    roomData.put("roomNumber", room.getRoomNumber());
                    roomData.put("type", room.getType());
                    roomData.put("price", room.getPrice());
                    roomData.put("available", room.getAvailable());
                    return roomData;
                }).toList();
                data.put("rooms", roomList);
                return data;
            }).toList();
            logger.debug("Found {} hotels matching search criteria", response.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error searching hotels", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while searching hotels. Please try again later.");
        }
    }

    // Filter Rooms by type and availability
//    @GetMapping("/hotels/{hotelId}/rooms/filter")
//    public List<Room> filterRooms(
//            @PathVariable Long hotelId,
//            @RequestParam(required = false) String type,
//            @RequestParam(required = false) Boolean available,
//            @RequestParam String email
//    ) {
//        if (!isCustomerValid(email)) return List.of();
//
//        Optional<Hotel> hotelOpt = hotelRepository.findById(hotelId);
//        if (hotelOpt.isEmpty()) return List.of();
//
//        List<Room> rooms = roomRepository.findByHotel(hotelOpt.get());
//
//        if (type != null) rooms = rooms.stream().filter(r -> r.getType().equalsIgnoreCase(type)).toList();
//        if (available != null) rooms = rooms.stream().filter(r -> r.getAvailable().equals(available)).toList();
//
//        return rooms;
//    }
    
    @GetMapping("/hotels/rooms/filter")
    public ResponseEntity<?> filterRoomsByHotelName(
            @RequestParam String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam String email
    ) {
        if (!isCustomerValid(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Customer email not found!");
        }

        Optional<Hotel> hotelOpt = hotelRepository.findFirstByNameContainingIgnoreCase(name);
        if (hotelOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No matching hotel found!");
        }

        List<Room> rooms = roomRepository.findByHotel(hotelOpt.get());

        if (type != null) {
            rooms = rooms.stream()
                    .filter(r -> r.getType().equalsIgnoreCase(type))
                    .toList();
        }

        if (available != null) {
            rooms = rooms.stream()
                    .filter(r -> r.getAvailable().equals(available))
                    .toList();
        }

        if (minPrice != null) {
            rooms = rooms.stream()
                    .filter(r -> r.getPrice() >= minPrice)
                    .toList();
        }

        if (maxPrice != null) {
            rooms = rooms.stream()
                    .filter(r -> r.getPrice() <= maxPrice)
                    .toList();
        }

        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestParam String email) {
        logger.debug("Checking if email exists: {}", email);
        
        // Check in all repositories
        boolean existsInCustomer = customerRepository.existsByEmail(email);
        boolean existsInAdmin = adminRepository.existsByEmail(email);
        boolean existsInManager = managerRepository.existsByEmail(email);
        
        boolean exists = existsInCustomer || existsInAdmin || existsInManager;
        
        Map<String, Object> response = new HashMap<>();
        response.put("exists", exists);
        
        if (exists) {
            // Get user details based on where the email was found
            if (existsInCustomer) {
                Optional<Customer> customer = customerRepository.findByEmail(email);
                customer.ifPresent(c -> {
                    response.put("username", c.getUsername());
                    response.put("role", "customer");
                    response.put("createdAt", c.getCreatedAt());
                });
            } else if (existsInAdmin) {
                Optional<Admin> admin = adminRepository.findByEmail(email);
                admin.ifPresent(a -> {
                    response.put("username", a.getUsername());
                    response.put("role", "admin");
                    response.put("createdAt", a.getCreatedAt());
                });
            } else if (existsInManager) {
                Optional<HotelManager> manager = managerRepository.findByEmail(email);
                manager.ifPresent(m -> {
                    response.put("username", m.getUsername());
                    response.put("role", "hotel_manager");
                    response.put("createdAt", m.getCreatedAt());
                });
            }
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String email) {
        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found!");
        }
        Customer customer = customerOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("id", customer.getId());
        response.put("username", customer.getUsername());
        response.put("name", customer.getUsername()); // or customer.getName() if you have a name field
        response.put("email", customer.getEmail());
        response.put("phoneNumber", customer.getPhoneNumber());
        // Encode byte[] to base64 string for frontend
        response.put("profilePicture", customer.getProfilePicture() != null ? "data:image/*;base64," + Base64.getEncoder().encodeToString(customer.getProfilePicture()) : null);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(
            @RequestParam String email,
            @RequestBody Map<String, Object> updates) {
        try {
            logger.debug("Updating profile for email: {}", email);
            Optional<Customer> customerOpt = customerRepository.findByEmail(email);
            if (customerOpt.isEmpty()) {
                logger.warn("Customer not found for email: {}", email);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found!");
            }
            Customer customer = customerOpt.get();
            // Handle name/username update
            if (updates.containsKey("name")) {
                String newUsername = (String) updates.get("name");
                logger.debug("Updating username from {} to {}", customer.getUsername(), newUsername);
                if (!newUsername.equals(customer.getUsername())) {
                    if (customerRepository.existsByUsername(newUsername)) {
                        logger.warn("Username {} is already taken", newUsername);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Username is already taken. Please choose a different one.");
                    }
                    customer.setUsername(newUsername);
                }
            }
            // Handle phone number update
            if (updates.containsKey("phoneNumber")) {
                String newPhoneNumber = (String) updates.get("phoneNumber");
                logger.debug("Updating phone number from {} to {}", customer.getPhoneNumber(), newPhoneNumber);
                customer.setPhoneNumber(newPhoneNumber);
            }
            // Handle profile picture update
            if (updates.containsKey("profilePicture")) {
                String newProfilePicture = (String) updates.get("profilePicture");
                logger.debug("Updating profile picture. New picture length: {}", 
                    newProfilePicture != null ? newProfilePicture.length() : 0);
                if (newProfilePicture != null && !newProfilePicture.isEmpty()) {
                    if (!newProfilePicture.startsWith("data:image/")) {
                        logger.warn("Invalid profile picture format");
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Invalid profile picture format. Please upload a valid image.");
                    }
                    // Remove the data URL prefix before decoding
                    String base64Data = newProfilePicture.substring(newProfilePicture.indexOf(",") + 1);
                    byte[] imageBytes = Base64.getDecoder().decode(base64Data);
                    // Check if the image is too large (max 16MB for MEDIUMBLOB)
                    if (imageBytes.length > 16 * 1024 * 1024) {
                        logger.warn("Profile picture too large: {} bytes", imageBytes.length);
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body("Profile picture is too large. Please choose an image smaller than 16MB.");
                    }
                    customer.setProfilePicture(imageBytes);
                }
            }
            try {
                customerRepository.save(customer);
                logger.info("Profile updated successfully for email: {}", email);
                return ResponseEntity.ok("Profile updated successfully!");
            } catch (Exception e) {
                logger.error("Error saving customer profile: ", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving profile. Please try again.");
            }
        } catch (Exception e) {
            logger.error("Error updating profile: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred while updating the profile. Please try again.");
        }
    }

    @PutMapping("/profile/change-password")
    public ResponseEntity<?> changePassword(
            @RequestParam String email,
            @RequestBody Map<String, String> passwords) {
        Optional<Customer> customerOpt = customerRepository.findByEmail(email);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found!");
        }
        Customer customer = customerOpt.get();
        String currentPassword = passwords.get("currentPassword");
        String newPassword = passwords.get("newPassword");
        // Use BCrypt for password check
        if (!passwordEncoder.matches(currentPassword, customer.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Current password is incorrect!");
        }
        customer.setPassword(passwordEncoder.encode(newPassword));
        customerRepository.save(customer);
        return ResponseEntity.ok("Password updated successfully!");
    }
}

