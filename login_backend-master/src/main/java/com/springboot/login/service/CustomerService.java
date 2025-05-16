package com.springboot.login.service;

import com.springboot.login.dto.CustomerSignupDTO;
import com.springboot.login.dto.CustomerLoginDTO;
import com.springboot.login.entity.Customer;
import com.springboot.login.entity.Admin;
import com.springboot.login.entity.HotelManager;
import com.springboot.login.repository.CustomerRepository;
import com.springboot.login.repository.AdminRepository;
import com.springboot.login.repository.HotelManagerRepository;
import com.springboot.login.repository.ManagerRepository;
import com.springboot.login.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.HashMap;
import java.util.Map;

@Service
public class CustomerService {

    private static final Logger logger = LoggerFactory.getLogger(CustomerService.class);

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private HotelManagerRepository managerRepository;

    @Autowired
    private ManagerRepository regularManagerRepository;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public String registerCustomer(CustomerSignupDTO dto) {
        logger.debug("Attempting to register customer with email: {}", dto.getEmail());
        
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            logger.debug("Password mismatch for email: {}", dto.getEmail());
            return "Password and Confirm Password do not match.";
        }

        if (customerRepository.existsByEmail(dto.getEmail())) {
            logger.debug("Email already exists: {}", dto.getEmail());
            return "Email is already registered.";
        }

        if (customerRepository.existsByUsername(dto.getUsername())) {
            logger.debug("Username already exists: {}", dto.getUsername());
            return "Username is already taken.";
        }

        try {
            Customer customer = new Customer();
            customer.setUsername(dto.getUsername());
            customer.setEmail(dto.getEmail());
            
            String rawPassword = dto.getPassword();
            logger.debug("Raw password during registration: {}", rawPassword);
            logger.debug("Raw password length during registration: {}", rawPassword.length());
            
            try {
                String hashedPassword = passwordEncoder.encode(rawPassword);
                logger.debug("Hashed password: {}", hashedPassword);
                logger.debug("Hashed password length: {}", hashedPassword.length());
                
                // Verify the hash can be matched
                boolean verifyHash = passwordEncoder.matches(rawPassword, hashedPassword);
                logger.debug("Hash verification result: {}", verifyHash);
                
                if (!verifyHash) {
                    logger.error("Hash verification failed during registration");
                    return "Error during password processing. Please try again.";
                }
                
                customer.setPassword(hashedPassword);
                customerRepository.save(customer);
                logger.info("Successfully registered customer: {}", dto.getEmail());
                return "Signup successful!";
            } catch (Exception e) {
                logger.error("Error during password hashing: {}", e.getMessage(), e);
                return "Error during password processing. Please try again.";
            }
        } catch (Exception e) {
            logger.error("Error registering customer: {}", e.getMessage(), e);
            return "Registration failed. Please try again.";
        }
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public ResponseEntity<?> loginCustomer(CustomerLoginDTO loginDTO) {
        logger.debug("Attempting login for email: {}", loginDTO.getEmail());
        
        // Check for null or empty email
        if (loginDTO.getEmail() == null || loginDTO.getEmail().trim().isEmpty()) {
            logger.debug("Email is null or empty");
            return ResponseEntity.badRequest().body("Email is required");
        }

        // Check for null or empty password
        if (loginDTO.getPassword() == null || loginDTO.getPassword().trim().isEmpty()) {
            logger.debug("Password is null or empty");
            return ResponseEntity.badRequest().body("Password is required");
        }

        try {
            // First try to find customer
            Customer customer = customerRepository.findByEmail(loginDTO.getEmail().trim())
                .orElse(null);
            
            // If customer not found, try to find admin
            Admin admin = null;
            if (customer == null) {
                admin = adminRepository.findByEmail(loginDTO.getEmail().trim())
                    .orElse(null);
            }
            
            // If neither customer nor admin found, try to find manager
            HotelManager manager = null;
            if (customer == null && admin == null) {
                manager = managerRepository.findByEmail(loginDTO.getEmail().trim())
                    .orElse(null);
            }

            // If no user found at all
            if (customer == null && admin == null && manager == null) {
                logger.debug("No user found with email: {}", loginDTO.getEmail());
                return ResponseEntity.badRequest().body("User not found. Please register first.");
            }

            // Check password based on user type
            String storedPassword = null;
            String username = null;
            String role = null;

            if (customer != null) {
                storedPassword = customer.getPassword();
                username = customer.getUsername();
                role = "customer";
            } else if (admin != null) {
                storedPassword = admin.getPassword();
                username = admin.getUsername();
                role = "admin";
            } else if (manager != null) {
                storedPassword = manager.getPassword();
                username = manager.getUsername();
                role = "hotel_manager";
            }

            logger.debug("Found user with role: {}", role);
            logger.debug("Stored hashed password: {}", storedPassword);

            String rawPassword = loginDTO.getPassword().trim();
            logger.debug("Raw password: {}", rawPassword);
            logger.debug("Raw password length: {}", rawPassword.length());

            String newHash = passwordEncoder.encode(rawPassword);
            logger.debug("New hash for comparison: {}", newHash);

            boolean passwordMatches = passwordEncoder.matches(rawPassword, storedPassword);
            logger.debug("Password match result: {}", passwordMatches);

            if (!passwordMatches) {
                logger.debug("Password does not match for user: {}", loginDTO.getEmail());
                return ResponseEntity.badRequest().body("Incorrect password. Please try again.");
            }

            // Generate JWT token
            String token = jwtTokenUtil.generateToken(loginDTO.getEmail().trim(), role);
            logger.debug("Generated JWT token for user: {}", loginDTO.getEmail());

            // Return success response with token and user info
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("email", loginDTO.getEmail().trim());
            response.put("username", username);
            response.put("role", role);
            response.put("message", "Login successful!");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error during login: ", e);
            return ResponseEntity.badRequest().body("Login failed. Please try again.");
        }
    }

    public ResponseEntity<?> checkEmail(String email) {
        logger.debug("Checking email existence for: {}", email);
        
        if (email == null || email.trim().isEmpty()) {
            logger.debug("Email is null or empty");
            return ResponseEntity.badRequest().body(Map.of(
                "exists", false,
                "role", null,
                "message", "Email is required"
            ));
        }

        String trimmedEmail = email.trim();
        logger.debug("Trimmed email: {}", trimmedEmail);
        
        try {
            // Check in customer table
            logger.debug("Checking customer table for email: {}", trimmedEmail);
            boolean existsInCustomer = customerRepository.existsByEmail(trimmedEmail);
            logger.debug("Email exists in customer table: {}", existsInCustomer);
            if (existsInCustomer) {
                logger.debug("Found email in customer table");
                return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "role", "customer"
                ));
            }
            
            // Check in admin table
            logger.debug("Checking admin table for email: {}", trimmedEmail);
            boolean existsInAdmin = adminRepository.existsByEmail(trimmedEmail);
            logger.debug("Email exists in admin table: {}", existsInAdmin);
            if (existsInAdmin) {
                logger.debug("Found email in admin table");
                return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "role", "admin"
                ));
            }
            
            // First check in hotel_managers table
            logger.debug("Checking hotel_managers table for email: {}", trimmedEmail);
            boolean existsInHotelManager = managerRepository.existsByEmail(trimmedEmail);
            logger.debug("Email exists in hotel_managers table: {}", existsInHotelManager);
            if (existsInHotelManager) {
                logger.debug("Found email in hotel_managers table");
                return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "role", "hotel_manager"
                ));
            }
            
            // Then check in managers table
            logger.debug("Checking managers table for email: {}", trimmedEmail);
            boolean existsInManager = regularManagerRepository.existsByEmail(trimmedEmail);
            logger.debug("Email exists in managers table: {}", existsInManager);
            if (existsInManager) {
                logger.debug("Found email in managers table");
                return ResponseEntity.ok(Map.of(
                    "exists", true,
                    "role", "hotel_manager"
                ));
            }
            
            logger.debug("Email not found in any table");
            return ResponseEntity.ok(Map.of(
                "exists", false,
                "role", null,
                "message", "Email not found"
            ));
        } catch (Exception e) {
            logger.error("Error checking email existence: ", e);
            return ResponseEntity.ok(Map.of(
                "exists", false,
                "role", null,
                "message", "Error checking email: " + e.getMessage()
            ));
        }
    }
}
