package com.springboot.login.controller;

import com.springboot.login.dto.CustomerSignupDTO;
import com.springboot.login.dto.CustomerLoginDTO;
import com.springboot.login.entity.Customer;
import com.springboot.login.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customer")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @PostMapping("/signup")
    public String signup(@RequestBody CustomerSignupDTO signupDTO) {
        return customerService.registerCustomer(signupDTO);
    }

    @GetMapping("/all")
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }
    
    @PostMapping("/login")
    public String login(@RequestBody CustomerLoginDTO loginDTO) {
        return customerService.loginCustomer(loginDTO);
    }
}

