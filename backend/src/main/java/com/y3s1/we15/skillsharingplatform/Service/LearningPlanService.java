package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.LearningPlan;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Repositories.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LearningPlanService {
    private final LearningPlanRepository learningPlanRepository;

    @Autowired
    public LearningPlanService(LearningPlanRepository learningPlanRepository) {
        this.learningPlanRepository = learningPlanRepository;
    }

    public LearningPlan createLearningPlan(LearningPlan plan) {
        plan.setCreatedAt(LocalDateTime.now());
        plan.setUpdatedAt(LocalDateTime.now());
        return learningPlanRepository.save(plan);
    }

    public List<LearningPlan> getPlansByUser(UserModel user) {
        return learningPlanRepository.findByUser(user);
    }

    public Optional<LearningPlan> getPlanById(String id) {
        return learningPlanRepository.findById(id);
    }

    public LearningPlan updateLearningPlan(LearningPlan plan) {
        plan.setUpdatedAt(LocalDateTime.now());
        return learningPlanRepository.save(plan);
    }

    public void deleteLearningPlan(String id) {
        learningPlanRepository.deleteById(id);
    }
} 