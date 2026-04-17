package com.attendance.backend.controller;

import com.attendance.backend.entity.User;
import com.attendance.backend.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

import com.attendance.backend.config.JwtUtil;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    // ✅ REGISTER API (ADD THIS)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {

        User savedUser = userService.saveUser(user);

        return ResponseEntity.ok(
                Map.of(
                        "message", "User registered successfully",
                        "username", savedUser.getUsername(),
                        "role", savedUser.getRole()
                )
        );
    }

    // ✅ LOGIN API (already correct)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {

        Optional<User> existingUser =
                userService.findByUsername(user.getUsername());

        if (existingUser.isPresent() &&
                userService.matchPassword(
                        user.getPassword(),
                        existingUser.get().getPassword()
                )) {

            String token = jwtUtil.generateToken(
                    existingUser.get().getUsername(),
                    existingUser.get().getRole()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "token", token,
                            "username", existingUser.get().getUsername(),
                            "role", existingUser.get().getRole()
                    )
            );
        }

        return ResponseEntity.status(401).body(
                Map.of("message", "Invalid Credentials")
        );
    }
}