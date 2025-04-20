package com.y3s1.we15.skillsharingplatform.Security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import javax.crypto.SecretKey;

@Component
public class JwtUtils {

    @Value("${jwt.secret:X8CjAJsli47GbNMjI6AlDtGgBkuwZIyZ8DcKzlG2o9JaBTDnfn5AuKQdmYGTGc6L}")
    private String jwtSecret;

    @Value("${jwt.expirationMs:86400000}") // Default: 24 hours
    private int jwtExpirationMs;
    
    private SecretKey cachedSigningKey;

    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        
        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateJwtToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getUsernameFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(authToken);
            return true;
        } catch (SignatureException e) {
            System.err.println("Invalid JWT signature: " + e.getMessage());
        } catch (MalformedJwtException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.err.println("JWT token is expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("JWT token is unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("JWT claims string is empty: " + e.getMessage());
        }

        return false;
    }
    
    private SecretKey getSigningKey() {
        // Use cached key if available
        if (cachedSigningKey != null) {
            return cachedSigningKey;
        }
        
        try {
            // Check if the provided key is long enough
            byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
            
            if (keyBytes.length < 32) { // 256 bits = 32 bytes
                System.out.println("WARNING: JWT secret is less than 256 bits. Generating a secure key instead.");
                cachedSigningKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            } else {
                cachedSigningKey = Keys.hmacShaKeyFor(keyBytes);
            }
            
            return cachedSigningKey;
        } catch (Exception e) {
            System.err.println("Error creating JWT signing key: " + e.getMessage());
            // Fallback to a secure randomly generated key
            System.out.println("Falling back to a secure randomly generated key");
            cachedSigningKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            return cachedSigningKey;
        }
    }
} 