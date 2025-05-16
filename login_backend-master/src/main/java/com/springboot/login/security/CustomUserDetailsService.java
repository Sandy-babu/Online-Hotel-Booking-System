package com.springboot.login.security;

import com.springboot.login.entity.Customer;
import com.springboot.login.entity.Admin;
import com.springboot.login.entity.HotelManager;
import com.springboot.login.entity.Manager;
import com.springboot.login.repository.CustomerRepository;
import com.springboot.login.repository.AdminRepository;
import com.springboot.login.repository.HotelManagerRepository;
import com.springboot.login.repository.ManagerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private HotelManagerRepository hotelManagerRepository;

    @Autowired
    private ManagerRepository managerRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        logger.debug("Loading user by email: {}", email);

        // Try to find user in each repository
        Customer customer = customerRepository.findByEmail(email).orElse(null);
        if (customer != null) {
            logger.debug("Found customer with email: {}", email);
            return new User(
                customer.getEmail(),
                customer.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
            );
        }

        Admin admin = adminRepository.findByEmail(email).orElse(null);
        if (admin != null) {
            logger.debug("Found admin with email: {}", email);
            return new User(
                admin.getEmail(),
                admin.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"))
            );
        }

        // Check hotel_managers table
        HotelManager hotelManager = hotelManagerRepository.findByEmail(email).orElse(null);
        if (hotelManager != null) {
            logger.debug("Found hotel manager with email: {}", email);
            return new User(
                hotelManager.getEmail(),
                hotelManager.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_HOTEL_MANAGER"))
            );
        }

        // Check managers table
        Manager manager = managerRepository.findByEmail(email).orElse(null);
        if (manager != null) {
            logger.debug("Found manager with email: {}", email);
            return new User(
                manager.getEmail(),
                manager.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_HOTEL_MANAGER"))
            );
        }

        logger.warn("No user found with email: {}", email);
        throw new UsernameNotFoundException("User not found with email: " + email);
    }
} 