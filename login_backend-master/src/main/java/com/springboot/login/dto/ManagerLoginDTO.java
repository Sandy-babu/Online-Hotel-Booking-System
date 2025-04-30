package com.springboot.login.dto;

public class ManagerLoginDTO {

    private String email;
    private String password;

    // Constructors
    public ManagerLoginDTO() {}

    public ManagerLoginDTO(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
