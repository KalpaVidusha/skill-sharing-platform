package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.Progress;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Repositories.ProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final String progressGifPath = "frontend/public/Progress_gif/";
    private final Random random = new Random();

    @Autowired
    public ProgressService(ProgressRepository progressRepository) {
        this.progressRepository = progressRepository;
    }

    public Progress createProgress(Progress progress) {
        // Set timestamps
        progress.setCreatedAt(LocalDateTime.now());
        progress.setUpdatedAt(LocalDateTime.now());
        
        // For completed_tutorial and new_skill templates with no mediaUrl, assign a random GIF
        if ((progress.getTemplateType().equals("completed_tutorial") || 
             progress.getTemplateType().equals("new_skill")) && 
            (progress.getMediaUrl() == null || progress.getMediaUrl().isEmpty())) {
            String randomGif = getRandomGifFilename();
            String gifUrl = "/Progress_gif/" + randomGif;
            progress.setMediaUrl(gifUrl);
        }
        
        return progressRepository.save(progress);
    }

    public List<Progress> getAllProgress() {
        return progressRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Progress> getProgressByUser(UserModel user) {
        return progressRepository.findByUser(user);
    }

    public List<Progress> getProgressByUserId(String userId) {
        return progressRepository.findByUserIdOrderByCreatedAtDesc(userId);
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
            
            // Update mediaUrl if provided
            if (updatedProgress.getMediaUrl() != null) {
                progress.setMediaUrl(updatedProgress.getMediaUrl());
            }
            
            return progressRepository.save(progress);
        }
        return null;
    }

    public void deleteProgress(String id) {
        progressRepository.deleteById(id);
    }
    
    public Progress addLike(String progressId, String userId) {
        Optional<Progress> existingProgress = progressRepository.findById(progressId);
        if (existingProgress.isPresent()) {
            Progress progress = existingProgress.get();
            List<String> likes = progress.getLikes();
            if (likes == null) {
                likes = new ArrayList<>();
            }
            
            // Only add if not already liked
            if (!likes.contains(userId)) {
                likes.add(userId);
                progress.setLikes(likes);
                return progressRepository.save(progress);
            }
            return progress;
        }
        return null;
    }
    
    public Progress removeLike(String progressId, String userId) {
        Optional<Progress> existingProgress = progressRepository.findById(progressId);
        if (existingProgress.isPresent()) {
            Progress progress = existingProgress.get();
            List<String> likes = progress.getLikes();
            if (likes != null && likes.contains(userId)) {
                likes.remove(userId);
                progress.setLikes(likes);
                return progressRepository.save(progress);
            }
            return progress;
        }
        return null;
    }
    
    public String getRandomGifFilename() {
        File folder = new File(progressGifPath);
        File[] files = folder.listFiles((dir, name) -> name.toLowerCase().endsWith(".gif"));
        
        if (files == null || files.length == 0) {
            // Default GIFs if directory is empty or not found
            String[] defaultGifs = {"Achievement .gif", "Happy Boys.gif", "Happy Son.gif"};
            return defaultGifs[random.nextInt(defaultGifs.length)];
        }
        
        // Return a random GIF filename
        return files[random.nextInt(files.length)].getName();
    }
} 