package com.y3s1.we15.skillsharingplatform.Controllers;

import com.y3s1.we15.skillsharingplatform.Models.LearningPlan;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Repositories.UserRepository;
import com.y3s1.we15.skillsharingplatform.Service.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
        plan.setId(id);
        return ResponseEntity.ok(learningPlanService.updateLearningPlan(plan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable String id) {
        learningPlanService.deleteLearningPlan(id);
        return ResponseEntity.ok().build();
    }
} 