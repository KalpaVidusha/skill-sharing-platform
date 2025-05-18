package com.y3s1.we15.skillsharingplatform.Controllers.monetizationAndReward; // Adjusted package

import com.y3s1.we15.skillsharingplatform.Models.MonetizationModel;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Service.MonetizationService;
import com.y3s1.we15.skillsharingplatform.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // For method-level security
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/monetization")
@CrossOrigin(origins = "http://localhost:3000") // Allow frontend access
public class MonetizationController {

    @Autowired
    private MonetizationService monetizationService; // Service for monetization logic

    @Autowired
    private UserService userService; // Service to get user details

    // Helper method to get the currently authenticated user
    private UserModel getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // Ensure the user is authenticated and not the anonymous user
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            // Handle cases where the principal might just be the username string
            username = principal.toString();
        }
        // Retrieve the full user details
        return userService.findByUsername(username);
    }

    // --- CREATE ---
@PostMapping
@PreAuthorize("isAuthenticated()")
public ResponseEntity<?> createMonetizationRequest(@Valid @RequestBody MonetizationModel requestData) {
    UserModel currentUser = getCurrentUser();
    if (currentUser == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
    }

    requestData.setUserId(currentUser.getId());
    requestData.setApproved(false); // Ensure default value is explicitly set

    try {
        MonetizationModel createdRequest = monetizationService.createRequest(requestData);
        return new ResponseEntity<>(createdRequest, HttpStatus.CREATED);
    } catch (Exception e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("error", "Failed to create monetization request: " + e.getMessage());
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

    // --- READ ---

    // Get all monetization requests belonging to the currently logged-in user
    @GetMapping("/my-requests")
    @PreAuthorize("isAuthenticated()") // Ensures a user is logged in (any role)
    public ResponseEntity<?> getMyMonetizationRequests() {
        UserModel currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }

        try {
            List<MonetizationModel> requests = monetizationService.getRequestsByUserId(currentUser.getId());
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve your monetization requests: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get a specific monetization request by its ID
    // Allows any logged-in user to view any request by ID.
    // Ownership/Admin check removed for viewing.
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // Ensures a user is logged in (any role)
    public ResponseEntity<?> getMonetizationRequestById(@PathVariable String id) {
        // We don't strictly need the currentUser object here anymore for authorization checks,
        // but @PreAuthorize handles the basic authentication check.

        try {
            Optional<MonetizationModel> requestOpt = monetizationService.getRequestById(id);
            if (requestOpt.isPresent()) {
                // Any authenticated user can view the request details
                return ResponseEntity.ok(requestOpt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Monetization request not found with id: " + id));
            }
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve monetization request: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping // 
    @PreAuthorize("isAuthenticated()") // Or your desired authorization
    public ResponseEntity<?> getAllMonetizationRequests() {
        try {
            List<MonetizationModel> requests = monetizationService.getAllRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve all monetization requests: " + e.getMessage());
            // Consider logging the exception here: log.error("Error fetching all requests", e);
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // --- UPDATE ---
    // Update a specific monetization request by its ID
    // IMPORTANT: Still restricted to the OWNER of the request for security.
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // Ensures a user is logged in (any role)
    public ResponseEntity<?> updateMonetizationRequest(@PathVariable String id, @Valid @RequestBody MonetizationModel updatedData) {
        UserModel currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }

        try {
            Optional<MonetizationModel> existingRequestOpt = monetizationService.getRequestById(id);
            if (existingRequestOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Monetization request not found with id: " + id));
            }

            MonetizationModel existingRequest = existingRequestOpt.get();

            // *** Security Check: Ensure the current user is the owner of the request ***
            // This check remains crucial to prevent users from modifying others' requests.
            if (!existingRequest.getUserId().equals(currentUser.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You are not authorized to update this request"));
            }

            // Update allowed fields (prevent changing userId implicitly)
            existingRequest.setContentType(updatedData.getContentType());
            existingRequest.setDescription(updatedData.getDescription());
            existingRequest.setPlatform(updatedData.getPlatform());
            existingRequest.setExpectedEarnings(updatedData.getExpectedEarnings());
            // userId remains unchanged

            MonetizationModel savedRequest = monetizationService.updateRequest(existingRequest); // Service method should handle the save
            return ResponseEntity.ok(savedRequest);

        } catch (IllegalArgumentException e) { // Catch specific exception from service update check
             return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update monetization request: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    // --- DELETE ---
    // Delete a specific monetization request by its ID
    // IMPORTANT: Still restricted to the OWNER or an ADMIN for security.
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()") // Ensures a user is logged in (any role)
    public ResponseEntity<?> deleteMonetizationRequest(@PathVariable String id) {
        UserModel currentUser = getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
        }

        try {
            Optional<MonetizationModel> requestOpt = monetizationService.getRequestById(id);
            if (requestOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Monetization request not found with id: " + id));
            }

            MonetizationModel requestToDelete = requestOpt.get();

            // *** Security Check: Ensure the current user owns the request OR is an admin ***
            // This check remains crucial. Allows owner or admin to delete.
            // Assumes 'ROLE_ADMIN' is the name of your admin role. Adjust if needed.
            boolean isAdmin = currentUser.getRole() != null && currentUser.getRole().stream().anyMatch(role -> role.equalsIgnoreCase("ROLE_ADMIN"));

            if (!requestToDelete.getUserId().equals(currentUser.getId()) && !isAdmin) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "You are not authorized to delete this request"));
            }

            // Proceed with deletion
            boolean deleted = monetizationService.deleteRequest(id);
            if (deleted) {
                 return ResponseEntity.ok(Map.of("message", "Monetization request deleted successfully"));
            } else {
                 // This might occur if the item was deleted between the check and the delete call,
                 // or if deleteRequest returns false for other reasons.
                 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to delete monetization request after check"));
            }

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete monetization request: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


//     @PatchMapping("/{id}/approve")
// // @PreAuthorize("hasRole('ADMIN')") // Optional: restrict to admin or reviewers
// @PreAuthorize("isAuthenticated()") // Ensures a user is logged in (any role)
// public ResponseEntity<?> updateApprovalStatus(
//         @PathVariable String id,
//         @RequestParam boolean isApproved) {

//     Optional<MonetizationModel> optionalRequest = monetizationService.getRequestById(id);

//     if (optionalRequest.isEmpty()) {
//         return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                 .body(Map.of("error", "Monetization request not found"));
//     }

//     MonetizationModel request = optionalRequest.get();
//     request.setApproved(isApproved);

//     try {
//         MonetizationModel updatedRequest = monetizationService.saveRequest(request);
//         return ResponseEntity.ok(updatedRequest);
//     } catch (Exception e) {
//         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(Map.of("error", "Failed to update approval status: " + e.getMessage()));
//     }
// }



@PatchMapping("/{id}/approve")
@PreAuthorize("isAuthenticated()") // Ensures a user is logged in (any role)
public ResponseEntity<?> updateApprovalStatus(
        @PathVariable String id,
        @RequestParam(required = false) String isApproved) {

    if (isApproved == null) {
        return ResponseEntity.badRequest().body(Map.of("error", "Missing 'isApproved' parameter"));
    }

    Boolean approvalStatus;
    try {
        approvalStatus = Boolean.parseBoolean(isApproved.toLowerCase());
    } catch (Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", "'isApproved' must be 'true' or 'false'"));
    }

    Optional<MonetizationModel> optionalRequest = monetizationService.getRequestById(id);
    if (optionalRequest.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Request not found"));
    }

    MonetizationModel request = optionalRequest.get();
    request.setApproved(approvalStatus);

    MonetizationModel updatedRequest = monetizationService.saveRequest(request);
    return ResponseEntity.ok(updatedRequest);
}


@GetMapping("/user/{userId}")
    public ResponseEntity<?> getRequestsByUserId(@PathVariable String userId) {
        List<MonetizationModel> requests = monetizationService.getRequestsByUserId(userId);
        
        if (requests.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                 .body(Map.of("error", "No monetization requests found for userId: " + userId));
        }

        return ResponseEntity.ok(requests);
    }
}