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
import java.util.stream.Collectors;

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
        List<ProgressComment> allComments = progressCommentRepository.findByProgressId(progressId);
        
        // Filter to return only root-level comments (comments with no parent)
        return allComments.stream()
            .filter(comment -> comment.getParentCommentId() == null)
            .collect(Collectors.toList());
    }
    
    public List<ProgressComment> getRepliesByCommentId(String commentId) {
        return progressCommentRepository.findByParentCommentId(commentId);
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
    
    public ProgressComment createReply(ProgressComment reply) {
        // Validate that parent comment exists
        Optional<ProgressComment> parentComment = progressCommentRepository.findById(reply.getParentCommentId());
        if (!parentComment.isPresent()) {
            return null; // Parent comment doesn't exist
        }
        
        return createComment(reply);
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
            
            // Delete all replies to this comment first
            List<ProgressComment> replies = progressCommentRepository.findByParentCommentId(commentId);
            for (ProgressComment reply : replies) {
                progressCommentRepository.deleteById(reply.getId());
            }
            
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