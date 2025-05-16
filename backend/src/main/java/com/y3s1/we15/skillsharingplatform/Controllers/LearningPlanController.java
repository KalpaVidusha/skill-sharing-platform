package com.y3s1.we15.skillsharingplatform.Controllers;

import com.y3s1.we15.skillsharingplatform.Models.LearningPlan;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Repositories.UserRepository;
import com.y3s1.we15.skillsharingplatform.Service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/learning-plans")
public class LearningPlanController {
    @Autowired
    private LearningPlanService learningPlanService;
    @Autowired
    private UserRepository userRepository;

    @PostMapping("")
    public ResponseEntity<?> createPlan(@RequestBody LearningPlan plan, @RequestParam String userId) {
        Optional<UserModel> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found");
        plan.setUser(userOpt.get());
        return ResponseEntity.ok(learningPlanService.createLearningPlan(plan));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPlansByUser(@PathVariable String userId) {
        Optional<UserModel> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return ResponseEntity.badRequest().body("User not found");
        List<LearningPlan> plans = learningPlanService.getPlansByUser(userOpt.get());
        return ResponseEntity.ok(plans);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPlanById(@PathVariable String id) {
        Optional<LearningPlan> planOpt = learningPlanService.getPlanById(id);
        return planOpt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable String id, @RequestBody LearningPlan plan) {
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required");
            }
            
            // Check if plan exists
            Optional<LearningPlan> existingPlan = learningPlanService.getPlanById(id);
            if (existingPlan.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Learning plan not found with ID: " + id);
            }
            
            // Check if the authenticated user owns this learning plan
            String username = authentication.getName();
            Optional<UserModel> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            UserModel user = userOpt.get();
            
            LearningPlan currentPlan = existingPlan.get();
            if (!currentPlan.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You don't have permission to update this learning plan");
            }
            
            // Set ID and update the plan
            plan.setId(id);
            // Preserve the original user
            plan.setUser(currentPlan.getUser());
            return ResponseEntity.ok(learningPlanService.updateLearningPlan(plan));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating learning plan: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable String id) {
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required");
            }
            
            // Check if plan exists
            Optional<LearningPlan> existingPlan = learningPlanService.getPlanById(id);
            if (existingPlan.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Learning plan not found with ID: " + id);
            }
            
            // Check if the authenticated user owns this learning plan
            String username = authentication.getName();
            Optional<UserModel> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            UserModel user = userOpt.get();
            
            LearningPlan currentPlan = existingPlan.get();
            if (!currentPlan.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You don't have permission to delete this learning plan");
            }
            
            // Delete the plan
            learningPlanService.deleteLearningPlan(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting learning plan: " + e.getMessage());
        }
    }
} 