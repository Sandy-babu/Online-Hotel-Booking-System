package com.springboot.login.controller;

import com.springboot.login.entity.Customer;
import com.springboot.login.entity.Admin;
import com.springboot.login.entity.HotelManager;
import com.springboot.login.entity.Manager;
import com.springboot.login.repository.CustomerRepository;
import com.springboot.login.repository.AdminRepository;
import com.springboot.login.repository.HotelManagerRepository;
import com.springboot.login.repository.ManagerRepository;
import com.springboot.login.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private HotelManagerRepository hotelManagerRepository;

    @Autowired
    private ManagerRepository managerRepository;

    // Removed the managerLogin method to resolve endpoint conflict
} 