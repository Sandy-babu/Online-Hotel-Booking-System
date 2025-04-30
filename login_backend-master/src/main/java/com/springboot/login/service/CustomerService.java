package com.springboot.login.service;

import com.springboot.login.dto.CustomerSignupDTO;
import com.springboot.login.dto.CustomerLoginDTO;
import com.springboot.login.entity.Customer;
import com.springboot.login.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public String registerCustomer(CustomerSignupDTO dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            return "Password and Confirm Password do not match.";
        }

        if (customerRepository.existsByEmail(dto.getEmail())) {
            return "Email is already registered.";
        }

        if (customerRepository.existsByUsername(dto.getUsername())) {
            return "Username is already taken.";
        }

        Customer customer = new Customer();
        customer.setUsername(dto.getUsername());
        customer.setEmail(dto.getEmail());
        customer.setPassword(passwordEncoder.encode(dto.getPassword()));
        customerRepository.save(customer);

        return "Signup successful!";
    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    public String loginCustomer(CustomerLoginDTO loginDTO) {
        Optional<Customer> optionalCustomer = customerRepository.findByEmail(loginDTO.getEmail());

        if (optionalCustomer.isPresent()) {
            Customer customer = optionalCustomer.get();
            if (passwordEncoder.matches(loginDTO.getPassword(), customer.getPassword())) {
                return "Login successful!";
            } else {
                return "Invalid password.";
            }
        } else {
            return "Email not registered.";
        }
    }
}
