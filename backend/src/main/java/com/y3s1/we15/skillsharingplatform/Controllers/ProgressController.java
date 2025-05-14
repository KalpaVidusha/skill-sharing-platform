package com.y3s1.we15.skillsharingplatform.Controllers;

import com.y3s1.we15.skillsharingplatform.Models.Progress;
import com.y3s1.we15.skillsharingplatform.Models.ProgressComment;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Models.Notification;
import com.y3s1.we15.skillsharingplatform.Service.ProgressService;
import com.y3s1.we15.skillsharingplatform.Service.ProgressCommentService;
import com.y3s1.we15.skillsharingplatform.Service.UserService;
import com.y3s1.we15.skillsharingplatform.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ProgressController {

    private final ProgressService progressService;
    private final UserService userService;
    private final ProgressCommentService progressCommentService;
    private final NotificationService notificationService;

    @Autowired
    public ProgressController(ProgressService progressService, UserService userService, 
                              ProgressCommentService progressCommentService, 
                              NotificationService notificationService) {
        this.progressService = progressService;
        this.userService = userService;
        this.progressCommentService = progressCommentService;
        this.notificationService = notificationService;
    }

    // GET all progress updates or filtered by user
    @GetMapping
    public ResponseEntity<?> getAllProgress(@RequestParam(required = false) String userId) {
        try {
            List<Progress> progressList;
            
            if (userId != null && !userId.isEmpty()) {
                progressList = progressService.getProgressByUserId(userId);
            } else {
                progressList = progressService.getAllProgress();
            }
            
            return ResponseEntity.ok(progressList);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching progress updates: " + e.getMessage());
        }
    }

    // GET a specific progress update by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getProgressById(@PathVariable String id) {
        try {
            Optional<Progress> progress = progressService.getProgressById(id);
            if (progress.isPresent()) {
                return ResponseEntity.ok(progress.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Progress update not found with ID: " + id);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching progress update: " + e.getMessage());
        }
    }

    // POST create a new progress update
    @PostMapping
    public ResponseEntity<?> createProgress(@RequestBody Progress progress) {
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required");
            }
            
            String username = authentication.getName();
            UserModel user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            // Set the user and create the progress update
            progress.setUser(user);
            
            // The mediaUrl will be handled in the service:
            // - If provided by user, it will be kept
            // - If not provided for eligible templates, a random GIF will be assigned
            Progress createdProgress = progressService.createProgress(progress);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProgress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating progress update: " + e.getMessage());
        }
    }

    // PUT update an existing progress update
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProgress(@PathVariable String id, @RequestBody Progress progress) {
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required");
            }
            
            // Check if progress exists
            Optional<Progress> existingProgress = progressService.getProgressById(id);
            if (existingProgress.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Progress update not found with ID: " + id);
            }
            
            // Check if the authenticated user owns this progress update
            String username = authentication.getName();
            UserModel user = userService.findByUsername(username);
            
            Progress currentProgress = existingProgress.get();
            if (!currentProgress.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You don't have permission to update this progress update");
            }
            
            // Update the progress
            Progress updatedProgress = progressService.updateProgress(id, progress);
            return ResponseEntity.ok(updatedProgress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating progress update: " + e.getMessage());
        }
    }

    // DELETE a progress update
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgress(@PathVariable String id) {
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required");
            }
            
            // Check if progress exists
            Optional<Progress> existingProgress = progressService.getProgressById(id);
            if (existingProgress.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Progress update not found with ID: " + id);
            }
            
            // Check if the authenticated user owns this progress update
            String username = authentication.getName();
            UserModel user = userService.findByUsername(username);
            
            Progress currentProgress = existingProgress.get();
            if (!currentProgress.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You don't have permission to delete this progress update");
            }
            
            // Delete the progress
            progressService.deleteProgress(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting progress update: " + e.getMessage());
        }
    }
    
    // GET available template types
    @GetMapping("/templates")
    public ResponseEntity<?> getTemplateTypes() {
        try {
            Map<String, Object> templates = new HashMap<>();
            
            // Template 1: Completed Tutorial
            Map<String, Object> completedTutorial = new HashMap<>();
            completedTutorial.put("title", "Completed Tutorial");
            completedTutorial.put("format", "✅ I completed {tutorialName} today!");
            completedTutorial.put("fields", Collections.singletonList("tutorialName"));
            
            // Template 2: Learned New Skill
            Map<String, Object> newSkill = new HashMap<>();
            newSkill.put("title", "Learned New Skill");
            newSkill.put("format", "🎯 Today I learned about {skillName}");
            newSkill.put("fields", Collections.singletonList("skillName"));
            
            // Template 3: Set Learning Goal
            Map<String, Object> learningGoal = new HashMap<>();
            learningGoal.put("title", "Set Learning Goal");
            learningGoal.put("format", "📅 I aim to finish {goalName} by {targetDate}");
            learningGoal.put("fields", Arrays.asList("goalName", "targetDate"));
            
            templates.put("completed_tutorial", completedTutorial);
            templates.put("new_skill", newSkill);
            templates.put("learning_goal", learningGoal);
            
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching template types: " + e.getMessage());
        }
    }
    
    // Like a progress update
    @PostMapping("/{progressId}/like")
    public ResponseEntity<?> likeProgress(@PathVariable String progressId) {
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required");
            }
            
            String username = authentication.getName();
            UserModel user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            // Add like
            Progress progress = progressService.addLike(progressId, user.getId());
            if (progress == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Progress update not found with ID: " + progressId);
            }
            
            // Send notification to progress owner if the liker is not the owner
            if (!progress.getUser().getId().equals(user.getId())) {
                String content = String.format("%s liked your progress update", user.getUsername());
                notificationService.createNotification(
                    progress.getUser().getId(),  // recipient (progress owner)
                    user.getId(),                // sender (user who liked)
                    progressId,                  // progress ID
                    Notification.NotificationType.LIKE,
                    content
                );
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("likes", progress.getLikes());
            response.put("likeCount", progress.getLikes().size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error liking progress update: " + e.getMessage());
        }
    }
    
    // Unlike a progress update
    @DeleteMapping("/{progressId}/like")
    public ResponseEntity<?> unlikeProgress(@PathVariable String progressId) {
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required");
            }
            
            String username = authentication.getName();
            UserModel user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            // Remove like
            Progress progress = progressService.removeLike(progressId, user.getId());
            if (progress == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Progress update not found with ID: " + progressId);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("likes", progress.getLikes());
            response.put("likeCount", progress.getLikes().size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error unliking progress update: " + e.getMessage());
        }
    }
    
    // Get comments for a progress update - accessible to all users (no authentication required)
    @GetMapping("/{progressId}/comments")
    public ResponseEntity<?> getProgressComments(@PathVariable String progressId) {
        try {
            // Check if progress exists first
            Optional<Progress> existingProgress = progressService.getProgressById(progressId);
            if (existingProgress.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Progress update not found with ID: " + progressId);
            }
            
            List<ProgressComment> comments = progressCommentService.getCommentsByProgressId(progressId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching comments: " + e.getMessage());
        }
    }
    
    // Add a comment to a progress update
    @PostMapping("/{progressId}/comments")
    public ResponseEntity<?> addProgressComment(@PathVariable String progressId, @RequestBody Map<String, String> commentData) {
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required");
            }
            
            String username = authentication.getName();
            UserModel user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            // Check if progress exists
            Optional<Progress> existingProgress = progressService.getProgressById(progressId);
            if (existingProgress.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Progress update not found with ID: " + progressId);
            }
            
            Progress progress = existingProgress.get();
            
            // Create and save the comment
            String content = commentData.getOrDefault("content", "").trim();
            if (content.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Comment content cannot be empty");
            }
            
            ProgressComment comment = new ProgressComment(
                progressId,
                user.getId(),
                user.getFirstName() + " " + user.getLastName(),
                content
            );
            
            ProgressComment savedComment = progressCommentService.createComment(comment);
            
            // Send notification to progress owner if the commenter is not the owner
            if (!progress.getUser().getId().equals(user.getId())) {
                String notificationContent = String.format("%s commented on your progress update: %s", 
                    user.getFirstName() + " " + user.getLastName(), 
                    content.length() > 50 ? content.substring(0, 47) + "..." : content);
                
                notificationService.createNotification(
                    progress.getUser().getId(),  // recipient (progress owner)
                    user.getId(),                // sender (user who commented)
                    progressId,                  // progress ID
                    Notification.NotificationType.COMMENT,
                    notificationContent
                );
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedComment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding comment: " + e.getMessage());
        }
    }
    
    // Add a reply to an existing comment
    @PostMapping("/comments/{commentId}/replies")
    public ResponseEntity<?> addReplyToComment(@PathVariable String commentId, @RequestBody Map<String, String> commentData) {
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required");
            }
            
            String username = authentication.getName();
            UserModel user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            // Check if parent comment exists
            Optional<ProgressComment> parentCommentOpt = progressCommentService.getCommentById(commentId);
            if (parentCommentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Parent comment not found with ID: " + commentId);
            }
            
            ProgressComment parentComment = parentCommentOpt.get();
            String progressId = parentComment.getProgressId();
            
            // Check if progress exists
            Optional<Progress> existingProgress = progressService.getProgressById(progressId);
            if (existingProgress.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Progress update not found with ID: " + progressId);
            }
            
            Progress progress = existingProgress.get();
            
            // Create and save the reply
            String content = commentData.getOrDefault("content", "").trim();
            if (content.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Reply content cannot be empty");
            }
            
            ProgressComment reply = new ProgressComment(
                progressId,
                user.getId(),
                user.getFirstName() + " " + user.getLastName(),
                content,
                commentId  // Set the parent comment ID
            );
            
            ProgressComment savedReply = progressCommentService.createReply(reply);
            if (savedReply == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Failed to create reply - parent comment may not exist");
            }
            
            // Send notification to the parent comment owner if the replier is not the comment owner
            if (!parentComment.getUserId().equals(user.getId())) {
                String notificationContent = String.format("%s replied to your comment: %s", 
                    user.getFirstName() + " " + user.getLastName(), 
                    content.length() > 50 ? content.substring(0, 47) + "..." : content);
                
                notificationService.createNotification(
                    parentComment.getUserId(),   // recipient (comment owner)
                    user.getId(),                // sender (user who replied)
                    progressId,                  // progress ID 
                    Notification.NotificationType.COMMENT,
                    notificationContent
                );
            }
            
            // Also notify the progress owner if different from comment owner and replier
            if (!progress.getUser().getId().equals(user.getId()) && 
                !progress.getUser().getId().equals(parentComment.getUserId())) {
                
                String notificationContent = String.format("%s replied to a comment on your progress update", 
                    user.getFirstName() + " " + user.getLastName());
                
                notificationService.createNotification(
                    progress.getUser().getId(),  // recipient (progress owner)
                    user.getId(),                // sender (user who replied)
                    progressId,                  // progress ID
                    Notification.NotificationType.COMMENT,
                    notificationContent
                );
            }
            
            return ResponseEntity.status(HttpStatus.CREATED).body(savedReply);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding reply: " + e.getMessage());
        }
    }
    
    // Get replies to a specific comment
    @GetMapping("/comments/{commentId}/replies")
    public ResponseEntity<?> getCommentReplies(@PathVariable String commentId) {
        try {
            // Check if comment exists
            Optional<ProgressComment> commentOpt = progressCommentService.getCommentById(commentId);
            if (commentOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Comment not found with ID: " + commentId);
            }
            
            List<ProgressComment> replies = progressCommentService.getRepliesByCommentId(commentId);
            return ResponseEntity.ok(replies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching replies: " + e.getMessage());
        }
    }
    
    // Update a comment
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<?> updateProgressComment(@PathVariable String commentId, @RequestBody Map<String, String> commentData) {
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required");
            }
            
            String username = authentication.getName();
            UserModel user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            // Check if comment exists
            Optional<ProgressComment> existingComment = progressCommentService.getCommentById(commentId);
            if (existingComment.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Comment not found with ID: " + commentId);
            }
            
            // Check if the authenticated user owns this comment
            ProgressComment comment = existingComment.get();
            if (!comment.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You don't have permission to update this comment");
            }
            
            // Update the comment
            String content = commentData.getOrDefault("content", "").trim();
            if (content.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Comment content cannot be empty");
            }
            
            comment.setContent(content);
            ProgressComment updatedComment = progressCommentService.updateComment(commentId, comment);
            
            return ResponseEntity.ok(updatedComment);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating comment: " + e.getMessage());
        }
    }
    
    // Delete a comment
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteProgressComment(@PathVariable String commentId) {
        try {
            // Get authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required");
            }
            
            String username = authentication.getName();
            UserModel user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not found");
            }
            
            // Check if comment exists
            Optional<ProgressComment> existingComment = progressCommentService.getCommentById(commentId);
            if (existingComment.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Comment not found with ID: " + commentId);
            }
            
            // Check if the authenticated user owns this comment
            ProgressComment comment = existingComment.get();
            if (!comment.getUserId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("You don't have permission to delete this comment");
            }
            
            // Delete the comment
            progressCommentService.deleteComment(commentId);
            
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting comment: " + e.getMessage());
        }
    }
} 