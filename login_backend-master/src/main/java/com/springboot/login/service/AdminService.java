package com.springboot.login.service;

import com.springboot.login.dto.AdminLoginDTO;
import com.springboot.login.dto.AdminSignupDTO;
import com.springboot.login.dto.ManagerSignupDTO;
import com.springboot.login.entity.Admin;
import com.springboot.login.entity.Manager;
import com.springboot.login.repository.AdminRepository;
import com.springboot.login.repository.ManagerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private ManagerRepository managerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Add this line

    public String createManager(ManagerSignupDTO dto) {
        // Check if password and confirmPassword match
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            return "Password and Confirm Password do not match.";
        }

        // Check if email already exists
        if (managerRepository.existsByEmail(dto.getEmail())) {
            return "Email is already registered.";
        }

        // Check if username already exists
        if (managerRepository.existsByUsername(dto.getUsername())) {
            return "Username is already taken.";
        }

        // Create Manager entity and save
        Manager manager = new Manager();
        manager.setUsername(dto.getUsername());
        manager.setEmail(dto.getEmail());
        manager.setPassword(passwordEncoder.encode(dto.getPassword())); // Encode password

        managerRepository.save(manager);

        return "Manager created successfully by Admin.";
    }
    
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

    public String loginAdmin(AdminLoginDTO loginDTO) {
        Optional<Admin> adminOptional = adminRepository.findByEmail(loginDTO.getEmail());
        
        if (adminOptional.isEmpty()) {
            return "Admin not found!";
        }

        Admin admin = adminOptional.get(); 

        boolean passwordMatches = passwordEncoder.matches(loginDTO.getPassword(), admin.getPassword());

        if (passwordMatches) {
            return "Admin Login Successful!";
        } else {
            return "Invalid password!";
        }
    }
    
    public List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }
}
