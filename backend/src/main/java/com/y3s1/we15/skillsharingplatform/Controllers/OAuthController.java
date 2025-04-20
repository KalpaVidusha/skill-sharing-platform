package com.y3s1.we15.skillsharingplatform.Controllers;

import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Security.JwtUtils;
import com.y3s1.we15.skillsharingplatform.Security.payload.JwtResponse;
import com.y3s1.we15.skillsharingplatform.Security.payload.MessageResponse;
import com.y3s1.we15.skillsharingplatform.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class OAuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${google.client.id}")
    private String googleClientId;

    @Value("${google.client.secret}")
    private String googleClientSecret;
    
    @Value("${google.callback.url}")
    private String googleCallbackUrl;
    
    // Initiate Google OAuth2 authentication
    @GetMapping("/auth/google")
    public void googleAuth(HttpServletResponse response) throws IOException {
        String redirectUrl = "https://accounts.google.com/o/oauth2/auth" +
                "?client_id=" + googleClientId +
                "&redirect_uri=http://localhost:8081/api/auth/google/callback" +
                "&response_type=code" +
                "&scope=email%20profile" +
                "&access_type=offline";
        
        response.sendRedirect(redirectUrl);
    }

    @PostMapping("/oauth/google")
    public ResponseEntity<?> handleGoogleAuth(@RequestBody Map<String, String> authData) {
        String idToken = authData.get("idToken");
        
        // Verify the ID token with Google
        // In a real implementation, you'd use Google's API client library for validation
        
        // Extract info from token (simplified for demonstration)
        String email = authData.get("email");
        String name = authData.get("name");
        String googleId = authData.get("googleId");
        
        if (email == null || googleId == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Missing email or Google ID"));
        }
        
        try {
            // Check if user exists
            UserModel user = userService.findByEmail(email);
            
            if (user == null) {
                // Create new user with name as username
                // Replace spaces with underscores and make lowercase for username
                String username = name.toLowerCase().replaceAll("\\s+", "_");
                
                // Check if username already exists
                if (userService.existsByUsername(username)) {
                    // If username exists, only then add a small random suffix
                    username = username + "_" + UUID.randomUUID().toString().substring(0, 3);
                }
                
                // Generate a random password and encode it
                String randomPassword = UUID.randomUUID().toString();
                String encodedPassword = passwordEncoder.encode(randomPassword);
                
                user = new UserModel(
                    username,
                    email,
                    encodedPassword,
                    name,            // First name from Google profile
                    "",              // Last name (could be parsed from full name)
                    new ArrayList<>()
                );
                
                // Set Google auth ID
                Map<String, String> oauthIds = new HashMap<>();
                oauthIds.put("google", googleId);
                user.setOauthIds(oauthIds);
                
                // Set role
                Set<String> roles = new HashSet<>();
                roles.add("USER");
                user.setRole(roles);
                
                // Save user
                userService.createUser(user);
            } else {
                // Update existing user's Google ID if not present
                Map<String, String> oauthIds = user.getOauthIds();
                if (oauthIds == null) {
                    oauthIds = new HashMap<>();
                }
                
                oauthIds.put("google", googleId);
                user.setOauthIds(oauthIds);
                userService.updateUser(user);
            }
            
            // Generate JWT token
            String jwt = jwtUtils.generateJwtToken(user.getUsername());
            
            // Get role list
            List<String> roles = user.getRole() != null ? 
                    new ArrayList<>(user.getRole()) : 
                    Collections.singletonList("USER");
            
            return ResponseEntity.ok(new JwtResponse(
                    jwt,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    roles));
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error during Google authentication: " + e.getMessage()));
        }
    }
    
    // Callback endpoint for OAuth2 redirect
    @GetMapping("/auth/google/callback")
    public void handleGoogleCallback(
            @RequestParam("code") String code,
            @RequestParam(value = "state", required = false) String state,
            HttpServletResponse response) throws IOException {
        
        try {
            // 1. Exchange the authorization code for an access token
            RestTemplate restTemplate = new RestTemplate();
            String redirectUri = "http://localhost:8081/api/auth/google/callback";
            
            // Prepare token request
            String tokenUrl = "https://oauth2.googleapis.com/token";
            String tokenRequestParams = "code=" + code +
                    "&client_id=" + googleClientId +
                    "&client_secret=" + googleClientSecret +
                    "&redirect_uri=" + redirectUri +
                    "&grant_type=authorization_code";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);
            
            org.springframework.http.HttpEntity<String> tokenRequest = 
                new org.springframework.http.HttpEntity<>(tokenRequestParams, headers);
            
            // Exchange code for token
            Map<String, Object> tokenResponse = restTemplate.postForObject(
                    tokenUrl, tokenRequest, Map.class);
            
            if (tokenResponse == null || !tokenResponse.containsKey("access_token")) {
                throw new RuntimeException("Failed to obtain access token");
            }
            
            String accessToken = (String) tokenResponse.get("access_token");
            
            // 2. Use the access token to get user info
            String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";
            headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            
            org.springframework.http.HttpEntity<String> userInfoRequest = 
                new org.springframework.http.HttpEntity<>(headers);
            
            Map<String, Object> userInfo = restTemplate.exchange(
                    userInfoUrl, org.springframework.http.HttpMethod.GET, userInfoRequest, Map.class).getBody();
            
            if (userInfo == null) {
                throw new RuntimeException("Failed to retrieve user information");
            }
            
            // Extract user details
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String googleId = (String) userInfo.get("sub");
            
            // 3. Check if user exists or create new user
            UserModel user = userService.findByEmail(email);
            
            if (user == null) {
                // Create new user with name as username
                // Replace spaces with underscores and make lowercase for username
                String username = name.toLowerCase().replaceAll("\\s+", "_");
                
                // Check if username already exists
                if (userService.existsByUsername(username)) {
                    // If username exists, only then add a small random suffix
                    username = username + "_" + UUID.randomUUID().toString().substring(0, 3);
                }
                
                // Generate a random password and encode it
                String randomPassword = UUID.randomUUID().toString();
                String encodedPassword = passwordEncoder.encode(randomPassword);
                
                user = new UserModel(
                    username,
                    email,
                    encodedPassword,
                    name,            // First name from Google profile
                    "",              // Last name (could be parsed from full name)
                    new ArrayList<>()
                );
                
                // Set Google auth ID
                Map<String, String> oauthIds = new HashMap<>();
                oauthIds.put("google", googleId);
                user.setOauthIds(oauthIds);
                
                // Set role
                Set<String> roles = new HashSet<>();
                roles.add("USER");
                user.setRole(roles);
                
                // Save user
                userService.createUser(user);
                System.out.println("Created new user: " + user.getUsername() + " with email: " + user.getEmail());
            } else {
                // Update existing user's Google ID
                Map<String, String> oauthIds = user.getOauthIds();
                if (oauthIds == null) {
                    oauthIds = new HashMap<>();
                }
                
                oauthIds.put("google", googleId);
                user.setOauthIds(oauthIds);
                userService.updateUser(user);
                System.out.println("Updated existing user: " + user.getUsername() + " with email: " + user.getEmail());
            }
            
            // 4. Generate JWT token
            String jwt = null;
            try {
                jwt = jwtUtils.generateJwtToken(user.getUsername());
            } catch (Exception e) {
                System.err.println("Error generating JWT token: " + e.getMessage());
                // Continue without the token - we'll create a simple token instead
                jwt = "google-" + UUID.randomUUID().toString();
            }
            
            // 5. Redirect to frontend with token and user info
            String redirectUrl = "http://localhost:3000/oauth-success" +
                    "?token=" + jwt +
                    "&userId=" + user.getId() +
                    "&username=" + user.getUsername() +
                    "&email=" + user.getEmail() +
                    "&provider=google";
            
            response.sendRedirect(redirectUrl);
            
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("OAuth error: " + e.getMessage());
            response.sendRedirect("http://localhost:3000/login?error=google_auth_failed");
        }
    }
} 