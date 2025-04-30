package com.springboot.login.controller;

import com.springboot.login.dto.AdminLoginDTO;
import com.springboot.login.dto.AdminSignupDTO;
import com.springboot.login.dto.ManagerSignupDTO;
import com.springboot.login.entity.Admin;
import org.springframework.web.bind.annotation.RequestBody;
import com.springboot.login.entity.Manager;
import com.springboot.login.service.AdminService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @PostMapping("/signup")
    public String signup(@RequestBody AdminSignupDTO signupDTO) {
        return adminService.registerAdmin(signupDTO);
    }

    @PostMapping("/login")
    public String login(@RequestBody AdminLoginDTO loginDTO) {
        return adminService.loginAdmin(loginDTO);
    }

    @PostMapping("/create-manager")
    public String createManager(@RequestBody ManagerSignupDTO managerSignupDTO) {
        return adminService.createManager(managerSignupDTO);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<Admin>> getAllAdmins() {
        List<Admin> admins = adminService.getAllAdmins();
        return ResponseEntity.ok(admins);
    }
}
