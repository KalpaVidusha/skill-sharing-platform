package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.Progress;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Repositories.ProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;

    @Autowired
    public ProgressService(ProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    public Progress createProgress(Progress progress) {
        return progressRepository.save(progress);
    }

    public List<Progress> getAllProgress() {
        return progressRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Progress> getProgressByUser(UserModel user) {
        return progressRepository.findByUser(user);
    }

    public List<Progress> getProgressByUserId(String userId) {
        return progressRepository.findByUserId(userId);
    }

    public Optional<Progress> getProgressById(String id) {
        return progressRepository.findById(id);
    }

    public Progress updateProgress(String id, Progress updatedProgress) {
        Optional<Progress> existingProgress = progressRepository.findById(id);
        if (existingProgress.isPresent()) {
            Progress progress = existingProgress.get();
            progress.setTemplateType(updatedProgress.getTemplateType());
            progress.setContent(updatedProgress.getContent());
            progress.setUpdatedAt(LocalDateTime.now());
            return progressRepository.save(progress);
        }
        return null;
    }

    public void deleteProgress(String id) {
        progressRepository.deleteById(id);
    }
} 