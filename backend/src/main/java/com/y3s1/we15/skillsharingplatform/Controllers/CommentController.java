package com.y3s1.we15.skillsharingplatform.Controllers;

import com.y3s1.we15.skillsharingplatform.Models.Comment;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Service.CommentService;
import com.y3s1.we15.skillsharingplatform.Service.PostService;
import com.y3s1.we15.skillsharingplatform.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:3000")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private PostService postService;
    
    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody Comment comment, HttpSession session) {
        // Get user from security context instead of session
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body("User must be logged in to add comments");
        }
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        UserModel user = userService.findByUsername(userDetails.getUsername());
        
        if (user == null) {
            return ResponseEntity.status(401).body("User not found");
        }
        
        comment.setUserId(user.getId());
        return ResponseEntity.ok(commentService.addComment(comment));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getCommentsByPost(@PathVariable String postId, HttpSession session) {
        List<Comment> comments = commentService.getCommentsByPost(postId);
        
        // If there are no comments, just return an empty list
        if (comments.isEmpty()) {
            return ResponseEntity.ok(comments);
        }
        
        try {
            // Get user from security context
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getPrincipal().equals("anonymousUser")) {
                
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                UserModel user = userService.findByUsername(userDetails.getUsername());
                
                if (user != null) {
                    // If user is logged in and is the post owner, return all comments with full details
                    Optional<Comment> firstComment = comments.stream().findFirst();
                    if (firstComment.isPresent()) {
                        try {
                            String postUserId = firstComment.get().getPostId();
                            if (postService.isPostOwner(postUserId, user.getId())) {
                                return ResponseEntity.ok(comments);
                            }
                        } catch (Exception e) {
                            // If there's any error checking post ownership, just continue
                            // and return the comments as a regular user
                        }
                    }
                }
            }
        } catch (Exception e) {
            // If there's any error in authentication check, log it but still return comments
            System.err.println("Error checking authentication for comments: " + e.getMessage());
        }
        
        // For anonymous users or non-post owners, still return the comments
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCommentById(@PathVariable String id, HttpSession session) {
        // Get user from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserModel user = null;
        
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getPrincipal().equals("anonymousUser")) {
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            user = userService.findByUsername(userDetails.getUsername());
        }
        
        Optional<Comment> comment = commentService.getCommentById(id);
        
        if (comment.isPresent()) {
            // If user is logged in and is either the comment owner or post owner
            if (user != null && (comment.get().getUserId().equals(user.getId()) || 
                postService.isPostOwner(comment.get().getPostId(), user.getId()))) {
                return ResponseEntity.ok(comment.get());
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@PathVariable String id, @RequestBody Comment updatedComment, HttpSession session) {
        // Get user from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body("User must be logged in to update comments");
        }
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        UserModel user = userService.findByUsername(userDetails.getUsername());
        
        if (user == null) {
            return ResponseEntity.status(401).body("User not found");
        }

        Optional<Comment> existingComment = commentService.getCommentById(id);
        if (existingComment.isPresent()) {
            Comment comment = existingComment.get();
            // Only allow update if user is the comment owner
            if (comment.getUserId().equals(user.getId())) {
                comment.setContent(updatedComment.getContent());
                return ResponseEntity.ok(commentService.updateComment(id, comment));
            }
            return ResponseEntity.status(403).body("You can only update your own comments");
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable String id, HttpSession session) {
        // Get user from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(401).body("User must be logged in to delete comments");
        }
        
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        UserModel user = userService.findByUsername(userDetails.getUsername());
        
        if (user == null) {
            return ResponseEntity.status(401).body("User not found");
        }

        Optional<Comment> comment = commentService.getCommentById(id);
        if (comment.isPresent()) {
            // Allow deletion if user is either the comment owner or post owner
            if (comment.get().getUserId().equals(user.getId()) || 
                postService.isPostOwner(comment.get().getPostId(), user.getId())) {
                commentService.deleteComment(id);
                return ResponseEntity.ok().build();
            }
            return ResponseEntity.status(403).body("You can only delete your own comments or comments on your posts");
        }
        return ResponseEntity.notFound().build();
    }
}

