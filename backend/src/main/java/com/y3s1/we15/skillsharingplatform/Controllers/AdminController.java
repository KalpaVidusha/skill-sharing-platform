package com.y3s1.we15.skillsharingplatform.Controllers;

import com.y3s1.we15.skillsharingplatform.Service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private AdminService adminService;

    /**
     * Delete all posts in the system
     * @return Response message
     */
    @DeleteMapping("/posts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAllPosts() {
        return adminService.deleteAllPosts();
    }

    /**
     * Delete all progress records in the system
     * @return Response message
     */
    @DeleteMapping("/progress")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAllProgress() {
        return adminService.deleteAllProgress();
    }

    /**
     * Delete all comments in the system
     * @return Response message
     */
    @DeleteMapping("/comments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAllComments() {
        return adminService.deleteAllComments();
    }

    /**
     * Delete a specific user
     * @param userId The ID of the user to delete
     * @return Response message
     */
    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable String userId) {
        return adminService.deleteUser(userId);
    }

    /**
     * Get all users in the system
     * @return List of users
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers() {
        return adminService.getAllUsers();
    }

    /**
     * Promote a user to admin role
     * @param userId The ID of the user to promote
     * @return Response message
     */
    @PutMapping("/users/{userId}/promote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> promoteUserToAdmin(@PathVariable String userId) {
        return adminService.promoteUserToAdmin(userId);
    }

    /**
     * Demote an admin to regular user role
     * @param userId The ID of the admin to demote
     * @return Response message
     */
    @PutMapping("/users/{userId}/demote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> demoteAdminToUser(@PathVariable String userId) {
        return adminService.demoteAdminToUser(userId);
    }
    
    /**
     * Delete a specific post
     * @param postId The ID of the post to delete
     * @return Response message
     */
    @DeleteMapping("/posts/{postId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePost(@PathVariable String postId) {
        return adminService.deletePost(postId);
    }
    
    /**
     * Delete a specific progress record
     * @param progressId The ID of the progress record to delete
     * @return Response message
     */
    @DeleteMapping("/progress/{progressId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProgress(@PathVariable String progressId) {
        return adminService.deleteProgress(progressId);
    }
    
    /**
     * Delete a specific comment
     * @param commentId The ID of the comment to delete
     * @return Response message
     */
    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteComment(@PathVariable String commentId) {
        return adminService.deleteComment(commentId);
    }
} 