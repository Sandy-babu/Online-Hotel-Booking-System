package com.springboot.login.service;

import com.springboot.login.dto.AdminLoginDTO;
import com.springboot.login.dto.AdminSignupDTO;
import com.springboot.login.dto.ManagerSignupDTO;
import com.springboot.login.entity.Admin;
import com.springboot.login.entity.Manager;
import com.springboot.login.repository.AdminRepository;
import com.springboot.login.repository.ManagerRepository;
import com.springboot.login.security.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminService {
    private static final Logger logger = LoggerFactory.getLogger(AdminService.class);
    private static final String MANAGER_ROLE = "hotel_manager";

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;
    
    public String registerAdmin(AdminSignupDTO dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            return "Password and Confirm Password do not match.";
        }

        if (adminRepository.existsByEmail(dto.getEmail())) {
            return "Email is already registered.";
        }

        if (adminRepository.existsByUsername(dto.getUsername())) {
            return "Username is already taken.";
        }

        Admin admin = new Admin();
        admin.setUsername(dto.getUsername());
        admin.setEmail(dto.getEmail());
        admin.setPassword(passwordEncoder.encode(dto.getPassword()));

        adminRepository.save(admin);

        return "Admin registered successfully.";
    }

    public Map<String, String> loginAdmin(AdminLoginDTO loginDTO) {
        Map<String, String> response = new HashMap<>();
        Optional<Admin> adminOptional = adminRepository.findByEmail(loginDTO.getEmail());
        
        if (adminOptional.isEmpty()) {
            response.put("message", "Admin not found!");
            return response;
        }

        Admin admin = adminOptional.get(); 
        boolean passwordMatches = passwordEncoder.matches(loginDTO.getPassword(), admin.getPassword());

        if (passwordMatches) {
            String token = jwtTokenUtil.generateToken(admin.getEmail(), "admin");
            response.put("message", "Admin Login Successful!");
            response.put("token", token);
            response.put("email", admin.getEmail());
            response.put("username", admin.getUsername());
            response.put("role", "admin");
            return response;
        } else {
            response.put("message", "Invalid password!");
            return response;
        }
    }
    
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    public String createManager(ManagerSignupDTO dto) {
        logger.debug("Attempting to create manager with email: {}", dto.getEmail());
        
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            logger.debug("Password and confirm password do not match");
            return "Password and Confirm Password do not match.";
        }

        if (managerRepository.existsByEmail(dto.getEmail())) {
            logger.debug("Email already registered: {}", dto.getEmail());
            return "Email is already registered.";
        }

        if (managerRepository.existsByUsername(dto.getUsername())) {
            logger.debug("Username already taken: {}", dto.getUsername());
            return "Username is already taken.";
        }

        try {
            Manager manager = new Manager();
            manager.setUsername(dto.getUsername());
            manager.setEmail(dto.getEmail());
            manager.setPassword(passwordEncoder.encode(dto.getPassword()));
            manager.setRole(MANAGER_ROLE);

            managerRepository.save(manager);
            logger.debug("Manager created successfully: {}", manager.getEmail());
            return "Manager created successfully by Admin.";
        } catch (Exception e) {
            logger.error("Error creating manager: {}", e.getMessage());
            return "Error creating manager: " + e.getMessage();
        }
    }
}
