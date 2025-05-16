package com.y3s1.we15.skillsharingplatform.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Service.UserService;
import com.y3s1.we15.skillsharingplatform.Security.JwtUtils;
import com.y3s1.we15.skillsharingplatform.Security.payload.JwtResponse;
import com.y3s1.we15.skillsharingplatform.Security.payload.LoginRequest;
import com.y3s1.we15.skillsharingplatform.Security.payload.MessageResponse;
import com.y3s1.we15.skillsharingplatform.Security.payload.SignupRequest;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    @Autowired
    private UserService userService;
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userService.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userService.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account with encoded password
        UserModel user = new UserModel(
                signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                passwordEncoder.encode(signUpRequest.getPassword()), // Encode password
                signUpRequest.getFirstName(),
                signUpRequest.getLastName(),
                signUpRequest.getSkills());

        Set<String> strRoles = signUpRequest.getRole();
        Set<String> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            roles.add("USER");
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        roles.add("ROLE_ADMIN");
                        break;
                    case "mod":
                        roles.add("ROLE_MODERATOR");
                        break;
                    default:
                        roles.add("USER");
                }
            });
        }

        user.setRole(roles);
        userService.createUser(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication;
            
            if (loginRequest.getUsername() != null && !loginRequest.getUsername().isEmpty()) {
                // Login by username
                authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                loginRequest.getUsername(), 
                                loginRequest.getPassword()));
            } else if (loginRequest.getEmail() != null && !loginRequest.getEmail().isEmpty()) {
                // For email login, first get the username from email
                UserModel user = userService.findByEmail(loginRequest.getEmail());
                if (user == null) {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(new MessageResponse("User not found with email: " + loginRequest.getEmail()));
                }
                
                authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(
                                user.getUsername(), 
                                loginRequest.getPassword()));
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new MessageResponse("Either username or email must be provided"));
            }
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            UserModel user = userService.findByUsername(userDetails.getUsername());
            
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Authentication failed: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserModel user) {
        try {
            if (user.getUsername() == null || user.getUsername().isEmpty() ||
                user.getEmail() == null || user.getEmail().isEmpty() ||
                user.getPassword() == null || user.getPassword().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Username, email, and password are required fields");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            
            // Encode the password before storing
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            
            UserModel createdUser = userService.createUser(user);
            return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public List<UserModel> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        try {
            Optional<UserModel> user = userService.getUserById(id);
            if (user.isPresent()) {
                return new ResponseEntity<>(user.get(), HttpStatus.OK);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found with id: " + id);
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody UserModel userDetails) {
        try {
            Optional<UserModel> userOptional = userService.getUserById(id);
            if (userOptional.isPresent()) {
                UserModel user = userOptional.get();
                if (userDetails.getUsername() != null) user.setUsername(userDetails.getUsername());
                if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
                
                // If password is being updated, encode it
                if (userDetails.getPassword() != null) {
                    user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
                }
                
                if (userDetails.getFirstName() != null) user.setFirstName(userDetails.getFirstName());
                if (userDetails.getLastName() != null) user.setLastName(userDetails.getLastName());
                if (userDetails.getContactNumber() != null) user.setContactNumber(userDetails.getContactNumber());
                if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
                if (userDetails.getProfilePicture() != null) user.setProfilePicture(userDetails.getProfilePicture());
                if (userDetails.getSkills() != null) user.setSkills(userDetails.getSkills());
                if (userDetails.getLocation() != null) user.setLocation(userDetails.getLocation());
                if (userDetails.getSocialLinks() != null) user.setSocialLinks(userDetails.getSocialLinks());
                UserModel updatedUser = userService.updateUser(user);
                return new ResponseEntity<>(updatedUser, HttpStatus.OK);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found with id: " + id);
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            Optional<UserModel> user = userService.getUserById(id);
            if (user.isPresent()) {
                userService.deleteUser(id);
                Map<String, String> response = new HashMap<>();
                response.put("message", "User deleted successfully");
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "User not found with id: " + id);
                return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserModel> getUserByUsername(@PathVariable String username) {
        UserModel user = userService.findByUsername(username);
        if (user != null) {
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Object principal = authentication.getPrincipal();
            
            String username;
            if (principal instanceof UserDetails) {
                username = ((UserDetails) principal).getUsername();
            } else {
                username = principal.toString();
            }
            
            UserModel user = userService.findByUsername(username);
            if (user != null) {
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(401).body("User not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Authentication error: " + e.getMessage());
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserModel> getUserByEmail(@PathVariable String email) {
        UserModel user = userService.findByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    // This method is kept for backward compatibility but is now deprecated
    // Use /api/auth/signin instead
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginData, HttpSession session) {
        String username = loginData.get("username");
        String email = loginData.get("email");
        String password = loginData.get("password");
        
        try { 
            Authentication authentication;
            if (username != null && !username.isEmpty()) {
                authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password));
            } else if (email != null && !email.isEmpty()) {
                UserModel user = userService.findByEmail(email);
                if (user != null) {
                    authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(user.getUsername(), password));
                } else {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Invalid credentials");
                    return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
                }
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Username or email is required");
                return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
            }
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            UserModel user = userService.findByUsername(userDetails.getUsername());
            
            // Set user in session for backward compatibility
            session.setAttribute("user", user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("token", jwt);
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid credentials");
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }
    }

    @PostMapping("/{userId}/follow/{userToFollowId}")
    public ResponseEntity<?> followUser(@PathVariable String userId, @PathVariable String userToFollowId) {
        try {
            UserModel user = userService.followUser(userId, userToFollowId);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
    
    @PostMapping("/{userId}/unfollow/{userToUnfollowId}")
    public ResponseEntity<?> unfollowUser(@PathVariable String userId, @PathVariable String userToUnfollowId) {
        try {
            UserModel user = userService.unfollowUser(userId, userToUnfollowId);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
    
    @GetMapping("/{userId}/followers")
    public ResponseEntity<?> getFollowers(@PathVariable String userId) {
        try {
            List<UserModel> followers = userService.getFollowers(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("followers", followers);
            response.put("count", followers.size());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
    
    @GetMapping("/{userId}/following")
    public ResponseEntity<?> getFollowing(@PathVariable String userId) {
        try {
            List<UserModel> following = userService.getFollowing(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("following", following);
            response.put("count", following.size());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            List<UserModel> users = userService.searchUsers(query, page, size);
            Map<String, Object> response = new HashMap<>();
            response.put("users", users);
            response.put("currentPage", page);
            response.put("pageSize", size);
            response.put("totalItems", users.size());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/{userId}/verify-password")
    public ResponseEntity<?> verifyPassword(
            @PathVariable String userId, 
            @RequestBody Map<String, String> passwordData) {
        try {
            // Get the current password from request body
            String currentPassword = passwordData.get("password");
            if (currentPassword == null || currentPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new MessageResponse("Password is required"));
            }
            
            // Get the user by ID
            Optional<UserModel> userOpt = userService.getUserById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new MessageResponse("User not found"));
            }
            
            // Verify the password
            UserModel user = userOpt.get();
            boolean passwordMatches = passwordEncoder.matches(currentPassword, user.getPassword());
            
            if (passwordMatches) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Password verified successfully");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new MessageResponse("Current password is incorrect"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new MessageResponse("Error verifying password: " + e.getMessage()));
        }
    }
    
    @PostMapping("/{userId}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable String userId, 
            @RequestBody Map<String, String> passwordData) {
        try {
            // Get current and new passwords from request body
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            
            // Validate input
            if (currentPassword == null || currentPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new MessageResponse("Current password is required"));
            }
            
            if (newPassword == null || newPassword.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    new MessageResponse("New password is required"));
            }
            
            // Get the user by ID
            Optional<UserModel> userOpt = userService.getUserById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new MessageResponse("User not found"));
            }
            
            // Verify the current password
            UserModel user = userOpt.get();
            boolean passwordMatches = passwordEncoder.matches(currentPassword, user.getPassword());
            
            if (!passwordMatches) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    new MessageResponse("Current password is incorrect"));
            }
            
            // Update to the new password
            user.setPassword(passwordEncoder.encode(newPassword));
            userService.updateUser(user);
            
            return ResponseEntity.ok(new MessageResponse("Password changed successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new MessageResponse("Error changing password: " + e.getMessage()));
        }
    }
}