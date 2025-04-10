package com.y3s1.we15.skillsharingplatform.Controllers;

import com.y3s1.we15.skillsharingplatform.Models.Comment;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Service.CommentService;
import com.y3s1.we15.skillsharingplatform.Service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody Comment comment, HttpSession session) {
        UserModel user = (UserModel) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body("User must be logged in to add comments");
        }
        comment.setUserId(user.getId());
        return ResponseEntity.ok(commentService.addComment(comment));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getCommentsByPost(@PathVariable String postId, HttpSession session) {
        UserModel user = (UserModel) session.getAttribute("user");
        List<Comment> comments = commentService.getCommentsByPost(postId);
        
        // If user is logged in and is the post owner, return all comments
        if (user != null) {
            Optional<Comment> firstComment = comments.stream().findFirst();
            if (firstComment.isPresent()) {
                String postUserId = firstComment.get().getPostId();
                if (postService.isPostOwner(postUserId, user.getId())) {
                    return ResponseEntity.ok(comments);
                }
            }
        }
        
        // For non-owners, return comments with limited information
        return ResponseEntity.ok(comments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCommentById(@PathVariable String id, HttpSession session) {
        UserModel user = (UserModel) session.getAttribute("user");
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
        UserModel user = (UserModel) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body("User must be logged in to update comments");
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
        UserModel user = (UserModel) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body("User must be logged in to delete comments");
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
