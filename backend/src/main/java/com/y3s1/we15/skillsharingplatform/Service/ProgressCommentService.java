package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.Progress;
import com.y3s1.we15.skillsharingplatform.Models.ProgressComment;
import com.y3s1.we15.skillsharingplatform.Repositories.ProgressCommentRepository;
import com.y3s1.we15.skillsharingplatform.Repositories.ProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ProgressCommentService {

    private final ProgressCommentRepository progressCommentRepository;
    private final ProgressRepository progressRepository;

    @Autowired
    public ProgressCommentService(ProgressCommentRepository progressCommentRepository, ProgressRepository progressRepository) {
        this.progressCommentRepository = progressCommentRepository;
        this.progressRepository = progressRepository;
    }

    public List<ProgressComment> getCommentsByProgressId(String progressId) {
        return progressCommentRepository.findByProgressId(progressId);
    }

    public ProgressComment createComment(ProgressComment comment) {
        ProgressComment savedComment = progressCommentRepository.save(comment);
        
        // Update the comment count on the progress
        Optional<Progress> progressOptional = progressRepository.findById(comment.getProgressId());
        if (progressOptional.isPresent()) {
            Progress progress = progressOptional.get();
            int commentCount = (int) progressCommentRepository.countByProgressId(comment.getProgressId());
            progress.setCommentCount(commentCount);
            progressRepository.save(progress);
        }
        
        return savedComment;
    }

    public Optional<ProgressComment> getCommentById(String commentId) {
        return progressCommentRepository.findById(commentId);
    }

    public ProgressComment updateComment(String commentId, ProgressComment updatedComment) {
        Optional<ProgressComment> existingComment = progressCommentRepository.findById(commentId);
        if (existingComment.isPresent()) {
            ProgressComment comment = existingComment.get();
            comment.setContent(updatedComment.getContent());
            comment.setUpdatedAt(LocalDateTime.now());
            return progressCommentRepository.save(comment);
        }
        return null;
    }

    public void deleteComment(String commentId) {
        Optional<ProgressComment> commentOptional = progressCommentRepository.findById(commentId);
        if (commentOptional.isPresent()) {
            ProgressComment comment = commentOptional.get();
            String progressId = comment.getProgressId();
            
            // Delete the comment
            progressCommentRepository.deleteById(commentId);
            
            // Update the comment count on the progress
            Optional<Progress> progressOptional = progressRepository.findById(progressId);
            if (progressOptional.isPresent()) {
                Progress progress = progressOptional.get();
                int commentCount = (int) progressCommentRepository.countByProgressId(progressId);
                progress.setCommentCount(commentCount);
                progressRepository.save(progress);
            }
        }
    }
} 