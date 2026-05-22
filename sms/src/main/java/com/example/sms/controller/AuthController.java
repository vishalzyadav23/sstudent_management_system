package com.example.sms.controller;

import com.example.sms.dto.ApiResponse;
import com.example.sms.dto.ChangePasswordRequest;
import com.example.sms.security.JwtUtil;
import com.example.sms.entity.User;
import com.example.sms.repository.UserRepository;
import com.example.sms.service.EmailService;
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
    @Autowired
    private EmailService emailService;

    // 1. REGISTER ENDPOINT
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return new ResponseEntity<>(new ApiResponse<>(HttpStatus.CREATED.value(), "User created successfully!"),
                HttpStatus.CREATED);
    }

    // 2. LOGIN ENDPOINT
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));

        User user = userRepository.findByUsername(username).orElseThrow();
        String token = jwtUtil.generateToken(username, user.getRole().name());

        Map<String, String> responseData = new HashMap<>();
        responseData.put("token", token);
        responseData.put("role", user.getRole().name());

        if (user.getStudent() != null) {
            responseData.put("studentId", String.valueOf(user.getStudent().getId()));
        }

        return new ResponseEntity<>(new ApiResponse<>(HttpStatus.OK.value(), "Login successful", responseData),
                HttpStatus.OK);
    }

    // --- Change Password Endpoint ---
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

    // --- Step 1 of Forgot Password (PRODUCTION READY) ---
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isEmpty()) {
            return new ResponseEntity<>(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), "Email is required!"),
                    HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findByUsername(email).orElse(null);

        // Security Check: If user doesn't exist, stop here but don't tell the hacker!
        if (user == null) {
            return new ResponseEntity<>(
                    new ApiResponse<>(HttpStatus.OK.value(),
                            "If that account exists, a reset link has been sent to the associated email address."),
                    HttpStatus.OK);
        }

        // 1. Generate token and SAVE it to the existing user in the database
        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        userRepository.save(user);

        // 2. Generate link
        String resetLink = "http://localhost:3000/reset-password/" + token;

        try {
            // 3. Send Email
            emailService.sendPasswordResetEmail(email, resetLink);

            return new ResponseEntity<>(
                    new ApiResponse<>(HttpStatus.OK.value(),
                            "If that account exists, a reset link has been sent to the associated email address."),
                    HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("❌ SMTP ERROR: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(
                    new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Error sending email. Please check backend console or SMTP configuration."),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // --- Step 2 of Forgot Password ---
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

        // Encrypt new password, clear the token, and save
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        userRepository.save(user);

        return new ResponseEntity<>(
                new ApiResponse<>(HttpStatus.OK.value(), "Password successfully reset! You can now log in."),
                HttpStatus.OK);
    }
}