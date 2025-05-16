package com.springboot.login.service;

import com.springboot.login.dto.ManagerLoginDTO;
import com.springboot.login.dto.ManagerSignupDTO;
import com.springboot.login.entity.HotelManager;
import com.springboot.login.entity.Manager;
import com.springboot.login.repository.HotelManagerRepository;
import com.springboot.login.repository.ManagerRepository;
import com.springboot.login.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ManagerService {
    private static final Logger logger = LoggerFactory.getLogger(ManagerService.class);
    private static final String MANAGER_ROLE = "hotel_manager";

    @Autowired
    private HotelManagerRepository hotelManagerRepository;

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    public ResponseEntity<?> registerManager(ManagerSignupDTO signupDTO) {
        logger.debug("Attempting to register manager with email: {}", signupDTO.getEmail());
        
        if (hotelManagerRepository.existsByEmail(signupDTO.getEmail()) || 
            managerRepository.existsByEmail(signupDTO.getEmail())) {
            logger.debug("Email already registered: {}", signupDTO.getEmail());
            return ResponseEntity.badRequest().body("Email already registered!");
        }

        if (hotelManagerRepository.existsByUsername(signupDTO.getUsername()) || 
            managerRepository.existsByUsername(signupDTO.getUsername())) {
            logger.debug("Username already taken: {}", signupDTO.getUsername());
            return ResponseEntity.badRequest().body("Username already taken!");
        }

        HotelManager manager = new HotelManager();
        manager.setUsername(signupDTO.getUsername());
        manager.setEmail(signupDTO.getEmail());
        manager.setPassword(passwordEncoder.encode(signupDTO.getPassword()));
        manager.setHotelName(signupDTO.getHotelName());
        manager.setHotelAddress(signupDTO.getHotelAddress());
        manager.setPhoneNumber(signupDTO.getPhoneNumber());
        manager.setRole(MANAGER_ROLE);

        hotelManagerRepository.save(manager);
        logger.debug("Manager registered successfully: {}", manager.getEmail());

        return ResponseEntity.ok("Manager registered successfully!");
    }

    public ResponseEntity<?> loginManager(ManagerLoginDTO loginDTO) {
        logger.debug("Attempting login for manager with email: {}", loginDTO.getEmail());
        
        if (loginDTO.getEmail() == null || loginDTO.getEmail().trim().isEmpty()) {
            logger.debug("Email is null or empty");
            return ResponseEntity.badRequest().body("Email is required");
        }

        if (loginDTO.getPassword() == null || loginDTO.getPassword().trim().isEmpty()) {
            logger.debug("Password is null or empty");
            return ResponseEntity.badRequest().body("Password is required");
        }

        String email = loginDTO.getEmail().trim();
        String password = loginDTO.getPassword().trim();

        try {
            // First try to find in hotel_managers table
            HotelManager hotelManager = hotelManagerRepository.findByEmail(email)
                    .orElse(null);

            if (hotelManager != null) {
                logger.debug("Found manager in hotel_managers table: {}", email);
                boolean passwordMatches = passwordEncoder.matches(password, hotelManager.getPassword());
                logger.debug("Password match result for hotel manager: {}", passwordMatches);
                
                if (passwordMatches) {
                    String role = hotelManager.getRole() != null ? hotelManager.getRole() : MANAGER_ROLE;
                    String token = jwtTokenUtil.generateToken(email, role);
                    logger.debug("Generated JWT token for hotel manager: {}", email);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("token", token);
                    response.put("email", email);
                    response.put("username", hotelManager.getUsername());
                    response.put("role", role);
                    response.put("message", "Manager Login Successful!");
                    return ResponseEntity.ok(response);
                }
            }

            // If not found or password doesn't match, try managers table
            Manager manager = managerRepository.findByEmail(email)
                    .orElse(null);

            if (manager != null) {
                logger.debug("Found manager in managers table: {}", email);
                boolean passwordMatches = passwordEncoder.matches(password, manager.getPassword());
                logger.debug("Password match result for manager: {}", passwordMatches);
                
                if (passwordMatches) {
                    String role = manager.getRole() != null ? manager.getRole() : MANAGER_ROLE;
                    String token = jwtTokenUtil.generateToken(email, role);
                    logger.debug("Generated JWT token for manager: {}", email);
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("token", token);
                    response.put("email", email);
                    response.put("username", manager.getUsername());
                    response.put("role", role);
                    response.put("message", "Manager Login Successful!");
                    return ResponseEntity.ok(response);
                }
            }

            logger.debug("No manager found or password doesn't match for email: {}", email);
            return ResponseEntity.badRequest().body("Invalid email or password!");
        } catch (Exception e) {
            logger.error("Error during manager login: ", e);
            return ResponseEntity.badRequest().body("An error occurred during login. Please try again.");
        }
    }

    public List<HotelManager> getAllManagers() {
        return hotelManagerRepository.findAll();
    }
}


