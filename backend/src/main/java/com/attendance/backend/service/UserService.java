package com.attendance.backend.service;

import com.attendance.backend.entity.User;
import com.attendance.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public User saveUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword())); // 🔥
        user.setCreatedAt(new java.sql.Timestamp(System.currentTimeMillis()));
        return userRepository.save(user);
    }

    public boolean matchPassword(String raw, String encoded) {
        return passwordEncoder.matches(raw, encoded);
    }
}