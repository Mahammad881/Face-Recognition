package com.attendance.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final String SECRET_KEY = "secret123secret123secret123secret123"; 
    // ⚠️ must be at least 32 chars for HS256

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    // ✅ Generate Token
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 10))
                .signWith(getSigningKey()) // ✅ FIXED
                .compact();
    }

    // ✅ Extract username
    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    // ✅ Extract role
    public String extractRole(String token) {
        return (String) extractClaims(token).get("role");
    }

    // ✅ Extract all claims
    private Claims extractClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey()) // ✅ FIXED
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ Validate token
    public boolean validateToken(String token, String username) {
        return username.equals(extractUsername(token));
    }
}