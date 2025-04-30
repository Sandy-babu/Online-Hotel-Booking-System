package com.springboot.login.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
	        .csrf(csrf -> csrf.disable())
	        .authorizeHttpRequests(auth -> auth
	            .requestMatchers(
	                "/customer/signup",
	                "/customer/login",
	                "/admin/login",
	                "/admin/signup",
	                "/manager/login",
	                "/admin/create-manager",
	                "/customer/all",
	                "/admin/all",
	                "/manager/all",
	                "/admin/create-manager" 
	            ).permitAll()
	            .anyRequest().authenticated()
	        );
        return http.build();
    }	
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();  // <<<<<< ADD THIS
    }
}
