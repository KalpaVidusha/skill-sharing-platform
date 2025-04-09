package com.y3s1.we15.skillsharingplatform.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Service.UserService;
import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    @Autowired
    private UserService userService;

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
                if (userDetails.getPassword() != null) user.setPassword(userDetails.getPassword());
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
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserModel> getUserByEmail(@PathVariable String email) {
        UserModel user = userService.findByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String email = loginData.get("email");
        String password = loginData.get("password");
        UserModel user = null;

        // Check if login is by username
        if (username != null && !username.isEmpty()) {
            user = userService.loginByUsername(username, password);
        } 
        // Otherwise, check if login is by email
        else if (email != null && !email.isEmpty()) {
            user = userService.loginByEmail(email, password);
        }

        if (user != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid credentials");
            return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
        }
    }
}