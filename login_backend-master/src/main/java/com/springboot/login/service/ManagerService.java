package com.springboot.login.service;

import com.springboot.login.dto.ManagerLoginDTO;
import com.springboot.login.entity.Manager;
import com.springboot.login.repository.ManagerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ManagerService {

    @Autowired
    private ManagerRepository managerRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

//    public String loginManager(String email, String password) {
//        Optional<Manager> manager = managerRepository.findByEmail(email);
//        if (manager.isPresent() && manager.get().getPassword().equals(password)) {
//            return "Manager login successful.";
//        } else {
//            return "Invalid credentials.";
//        }
//    }
    
    public String loginManager(ManagerLoginDTO loginDTO) {
        Optional<Manager> managerOptional = managerRepository.findByEmail(loginDTO.getEmail());

        if (managerOptional.isEmpty()) {
            return "Manager not found!";
        }

        Manager manager = managerOptional.get();

        boolean passwordMatches = passwordEncoder.matches(loginDTO.getPassword(), manager.getPassword());

        if (passwordMatches) {
            return "Manager Login Successful!";
        } else {
            return "Invalid password!";
        }
    }
    
    public List<Manager> getAllManagers() {
        return managerRepository.findAll();
    }
}


