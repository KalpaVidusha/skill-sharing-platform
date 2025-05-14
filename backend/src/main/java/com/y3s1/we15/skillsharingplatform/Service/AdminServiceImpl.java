package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.Role;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Repositories.CommentRepository;
import com.y3s1.we15.skillsharingplatform.Repositories.PostRepository;
import com.y3s1.we15.skillsharingplatform.Repositories.ProgressCommentRepository;
import com.y3s1.we15.skillsharingplatform.Repositories.ProgressRepository;
import com.y3s1.we15.skillsharingplatform.Repositories.UserRepository;
import com.y3s1.we15.skillsharingplatform.Security.payload.MessageResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private ProgressRepository progressRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private ProgressCommentRepository progressCommentRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Override
    public ResponseEntity<?> deleteAllPosts() {
        try {
            postRepository.deleteAll();
            return ResponseEntity.ok(new MessageResponse("All posts have been deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<?> deleteAllProgress() {
        try {
            // Delete all progress comments first
            progressCommentRepository.deleteAll();
            // Then delete all progress records
            progressRepository.deleteAll();
            return ResponseEntity.ok(new MessageResponse("All progress records have been deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<?> deleteAllComments() {
        try {
            // Delete all post comments
            commentRepository.deleteAll();
            // Delete all progress comments
            progressCommentRepository.deleteAll();
            return ResponseEntity.ok(new MessageResponse("All comments have been deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<?> deleteUser(String userId) {
        try {
            Optional<UserModel> userOptional = userRepository.findById(userId);
            
            if (userOptional.isPresent()) {
                UserModel user = userOptional.get();
                
                // Check if the user is an admin and if there are other admins
                if (user.getRole() != null && user.getRole().contains(Role.ROLE_ADMIN.name())) {
                    long adminCount = userRepository.findAll().stream()
                            .filter(u -> u.getRole() != null && u.getRole().contains(Role.ROLE_ADMIN.name()))
                            .count();
                    
                    if (adminCount <= 1) {
                        return ResponseEntity.badRequest().body(new MessageResponse("Error: Cannot delete the last admin user"));
                    }
                }
                
                userRepository.delete(user);
                return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserModel> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<?> promoteUserToAdmin(String userId) {
        try {
            Optional<UserModel> userOptional = userRepository.findById(userId);
            
            if (userOptional.isPresent()) {
                UserModel user = userOptional.get();
                
                Set<String> roles = user.getRole();
                if (roles == null) {
                    roles = new HashSet<>();
                }
                
                if (!roles.contains(Role.ROLE_ADMIN.name())) {
                    roles.add(Role.ROLE_ADMIN.name());
                    user.setRole(roles);
                    userRepository.save(user);
                    return ResponseEntity.ok(new MessageResponse("User promoted to admin successfully"));
                } else {
                    return ResponseEntity.badRequest().body(new MessageResponse("User is already an admin"));
                }
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<?> demoteAdminToUser(String userId) {
        try {
            Optional<UserModel> userOptional = userRepository.findById(userId);
            
            if (userOptional.isPresent()) {
                UserModel user = userOptional.get();
                
                // Check if there are other admins
                long adminCount = userRepository.findAll().stream()
                        .filter(u -> u.getRole() != null && u.getRole().contains(Role.ROLE_ADMIN.name()))
                        .count();
                
                if (adminCount <= 1 && user.getRole() != null && user.getRole().contains(Role.ROLE_ADMIN.name())) {
                    return ResponseEntity.badRequest().body(new MessageResponse("Error: Cannot demote the last admin user"));
                }
                
                Set<String> roles = user.getRole();
                if (roles != null && roles.contains(Role.ROLE_ADMIN.name())) {
                    roles.remove(Role.ROLE_ADMIN.name());
                    if (roles.isEmpty()) {
                        roles.add(Role.ROLE_USER.name());
                    }
                    user.setRole(roles);
                    userRepository.save(user);
                    return ResponseEntity.ok(new MessageResponse("Admin demoted to user successfully"));
                } else {
                    return ResponseEntity.badRequest().body(new MessageResponse("User is not an admin"));
                }
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    @Override
    public ResponseEntity<?> deletePost(String postId) {
        try {
            if (postRepository.existsById(postId)) {
                postRepository.deleteById(postId);
                return ResponseEntity.ok(new MessageResponse("Post deleted successfully"));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Post not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @Override
    public ResponseEntity<?> deleteProgress(String progressId) {
        try {
            if (progressRepository.existsById(progressId)) {
                // Delete progress comments first
                progressCommentRepository.deleteByProgressId(progressId);
                // Then delete the progress
                progressRepository.deleteById(progressId);
                return ResponseEntity.ok(new MessageResponse("Progress record deleted successfully"));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Progress record not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
    
    @Override
    public ResponseEntity<?> deleteComment(String commentId) {
        try {
            if (commentRepository.existsById(commentId)) {
                commentRepository.deleteById(commentId);
                return ResponseEntity.ok(new MessageResponse("Comment deleted successfully"));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Comment not found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
} 