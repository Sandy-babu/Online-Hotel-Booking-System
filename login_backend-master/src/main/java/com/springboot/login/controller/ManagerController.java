package com.springboot.login.controller;

import com.springboot.login.dto.ManagerLoginDTO;
import com.springboot.login.entity.Manager;
import com.springboot.login.service.ManagerService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/manager")
public class ManagerController {

    @Autowired
    private ManagerService managerService;

    @PostMapping("/login")
    public String login(@RequestBody ManagerLoginDTO loginDTO) {
        return managerService.loginManager(loginDTO);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<Manager>> getAllManagers() {
        List<Manager> managers = managerService.getAllManagers();
        return ResponseEntity.ok(managers);
    }
}
