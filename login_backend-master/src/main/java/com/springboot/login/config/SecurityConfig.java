package com.springboot.login.config;

import com.springboot.login.security.JwtRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
	        .csrf(csrf -> csrf.disable())
	        .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
	        .authorizeHttpRequests(auth -> auth
	            .requestMatchers(
	                "/customer/signup",
	                "/customer/login",
                    "/customer/check-email",
	                "/admin/login",
	                "/admin/signup",
	                "/manager/login",
	                "/admin/create-manager",
	                "/customer/all",
	                "/admin/all",
	                "/manager/all",
	                "/admin/create-manager",
	                "/customer/hotels",
	                "/customer/hotels/search",
	                "/customer/hotels/rooms",
                    "/customer/hotels/rooms/filter",
                    "/customer/hotels/{id}",
                    "/error"
	            ).permitAll()
	            .requestMatchers(
	                "/manager/hotel/add",
	                "/manager/hotel/view",
	                "/manager/hotel/update/by-id/**",
	                "/manager/hotel/update/by-name",
	                "/manager/hotel/delete/by-id/**",
	                "/manager/hotel/delete/by-name",
	                "/manager/hotel/all",
	                "/manager/room/add",
	                "/manager/room/view",
	                "/manager/room/update/**",
	                "/manager/room/delete/**"
	            ).hasRole("HOTEL_MANAGER")
	            .anyRequest().authenticated()
            )
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }	

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        logger.debug("Initializing BCryptPasswordEncoder with strength 10");
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);
        // Test the encoder
        String testPassword = "test123";
        String hashedPassword = encoder.encode(testPassword);
        boolean matches = encoder.matches(testPassword, hashedPassword);
        logger.debug("Password encoder test - matches: {}", matches);
        return encoder;
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        config.setExposedHeaders(Arrays.asList("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}