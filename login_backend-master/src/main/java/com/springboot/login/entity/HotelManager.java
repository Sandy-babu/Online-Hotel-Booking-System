package com.springboot.login.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@Table(name = "hotel_managers")
public class HotelManager {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "manager_id")
    private Long id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @Column(name = "username", unique = true)
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(name = "email", unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    @Column(name = "password")
    private String password;

    @NotBlank(message = "Hotel name is required")
    @Column(name = "hotel_name")
    private String hotelName;

    @NotBlank(message = "Hotel address is required")
    @Column(name = "hotel_address")
    private String hotelAddress;

    @NotBlank(message = "Phone number is required")
    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "role")
    private String role = "hotel_manager";

    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt = new Date();
} 