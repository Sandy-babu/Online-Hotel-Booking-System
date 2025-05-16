package com.springboot.login.controller;

import com.springboot.login.dto.ManagerLoginDTO;
import com.springboot.login.dto.ManagerSignupDTO;
import com.springboot.login.entity.HotelManager;
import com.springboot.login.service.ManagerService;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/manager")
public class ManagerController {

    @Autowired
    private ManagerService managerService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody ManagerSignupDTO signupDTO) {
        return managerService.registerManager(signupDTO);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody ManagerLoginDTO loginDTO) {
        return managerService.loginManager(loginDTO);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<HotelManager>> getAllManagers() {
        return ResponseEntity.ok(managerService.getAllManagers());
    }
}
