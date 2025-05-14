package com.y3s1.we15.skillsharingplatform.Service;

import org.springframework.http.ResponseEntity;

public interface AdminService {
    ResponseEntity<?> deleteAllPosts();
    ResponseEntity<?> deleteAllProgress();
    ResponseEntity<?> deleteAllComments();
    ResponseEntity<?> deleteUser(String userId);
    ResponseEntity<?> getAllUsers();
    ResponseEntity<?> promoteUserToAdmin(String userId);
    ResponseEntity<?> demoteAdminToUser(String userId);
    
    // Individual item management
    ResponseEntity<?> deletePost(String postId);
    ResponseEntity<?> deleteProgress(String progressId);
    ResponseEntity<?> deleteComment(String commentId);
} 