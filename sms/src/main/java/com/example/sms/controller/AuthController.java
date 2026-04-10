package com.example.sms.controller;

import com.example.sms.dto.ApiResponse;
import com.example.sms.dto.ChangePasswordRequest;
import com.example.sms.security.JwtUtil;
import com.example.sms.entity.User;
import com.example.sms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. REGISTER ENDPOINT (Updated to Enterprise ApiResponse format)
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody User user) {
        // Encrypt the password before saving!
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return new ResponseEntity<>(new ApiResponse<>(HttpStatus.CREATED.value(), "User created successfully!"),
                HttpStatus.CREATED);
    }

    // 2. LOGIN ENDPOINT (Updated to Enterprise ApiResponse format)
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        // The Bouncer checks the credentials here.
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));

        // If correct, find the user and print the wristband!
        User user = userRepository.findByUsername(username).orElseThrow();
        String token = jwtUtil.generateToken(username, user.getRole().name());

        // Send the token and role back to React/Postman
        Map<String, String> responseData = new HashMap<>();
        responseData.put("token", token);
        responseData.put("role", user.getRole().name());

        // Send the Student ID if they are a student
        if (user.getStudent() != null) {
            responseData.put("studentId", String.valueOf(user.getStudent().getId()));
        }

        return new ResponseEntity<>(new ApiResponse<>(HttpStatus.OK.value(), "Login successful", responseData),
                HttpStatus.OK);
    }

    // --- NEW: Change Password Endpoint (For logged-in users) ---
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@RequestBody ChangePasswordRequest request,
            Principal principal) {
        if (principal == null) {
            return new ResponseEntity<>(
                    new ApiResponse<>(HttpStatus.UNAUTHORIZED.value(), "You must be logged in to change your password"),
                    HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findByUsername(principal.getName()).orElseThrow();

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return new ResponseEntity<>(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Incorrect old password"),
                    HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        return new ResponseEntity<>(new ApiResponse<>(HttpStatus.OK.value(), "Password updated successfully"),
                HttpStatus.OK);
    }

    // --- NEW: Step 1 of Forgot Password (Generate Token & "Send Email") ---
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            // Security Best Practice: Don't reveal if a username exists or not
            return new ResponseEntity<>(new ApiResponse<>(HttpStatus.OK.value(),
                    "If that account exists, a reset link has been generated."), HttpStatus.OK);
        }

        // Generate a random, secure token
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        userRepository.save(user);

        // Simulate sending an email by printing to the server console
        System.out.println("\n=======================================================");
        System.out.println("EMAIL SIMULATION - TO: " + username);
        System.out.println("We heard you forgot your password. Click the link below to reset it:");
        System.out.println("http://localhost:3000/reset-password/" + token);
        System.out.println("=======================================================\n");

        return new ResponseEntity<>(
                new ApiResponse<>(HttpStatus.OK.value(),
                        "If that account exists, a reset link has been generated. (Check Spring Boot Console!)"),
                HttpStatus.OK);
    }

    // --- NEW: Step 2 of Forgot Password (Verify Token & Save New Password) ---
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        User user = userRepository.findByResetToken(token).orElse(null);

        if (user == null) {
            return new ResponseEntity<>(
                    new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Invalid or expired reset token!"),
                    HttpStatus.BAD_REQUEST);
        }

        // Encrypt the new password and clear the token so it can't be used twice!
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        userRepository.save(user);

        return new ResponseEntity<>(
                new ApiResponse<>(HttpStatus.OK.value(), "Password successfully reset! You can now log in."),
                HttpStatus.OK);
    }
}