package com.y3s1.we15.skillsharingplatform.Controllers;

import com.y3s1.we15.skillsharingplatform.Models.Post;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Models.Notification;
import com.y3s1.we15.skillsharingplatform.Service.PostService;
import com.y3s1.we15.skillsharingplatform.Service.UserService;
import com.y3s1.we15.skillsharingplatform.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import java.util.*;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PostController {

    private final PostService postService;
    private final UserService userService;
    private final NotificationService notificationService;

    @Autowired
    public PostController(PostService postService, UserService userService, NotificationService notificationService) {
        this.postService = postService;
        this.userService = userService;
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        Optional<UserModel> user = userService.getUserById(post.getUser().getId());
        if (user.isPresent()) {
            post.setUser(user.get());
            Post createdPost = postService.createPost(post);
            return ResponseEntity.ok(createdPost);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable String id) {
        return postService.getPostById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable String id, @RequestBody Post postDetails) {
        Optional<Post> optionalPost = postService.getPostById(id);
        if (!optionalPost.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Post post = optionalPost.get();

        post.setTitle(postDetails.getTitle());
        post.setDescription(postDetails.getDescription());
        post.setCategory(postDetails.getCategory());
        post.setMediaUrls(postDetails.getMediaUrls());
        
        Post updatedPost = postService.updatePost(post);
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        Optional<Post> optionalPost = postService.getPostById(id);
        if (!optionalPost.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/category/{category}")
    public List<Post> getPostsByCategory(@PathVariable String category) {
        return postService.getPostsByCategory(category);
    }

    @GetMapping("/search")
    public List<Post> searchPosts(@RequestParam String title) {
        return postService.searchPosts(title);
    }

    @GetMapping("/user/{userId}")
    public List<Post> getPostsByUser(@PathVariable String userId) {
        return postService.getPostsByUserId(userId);
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<?> toggleLike(@PathVariable String postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Login required");
        }
        
        String username = authentication.getName();
        UserModel user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.status(401).body("User not found");
        }

        Optional<Post> optionalPost = postService.getPostById(postId);
        if (!optionalPost.isPresent()) {
            return ResponseEntity.status(404).body("Post not found with id: " + postId);
        }
        Post post = optionalPost.get();
                

        boolean wasLiked = post.getLikedUserIds().contains(userId);
        if (wasLiked) {
            post.getLikedUserIds().remove(userId);
        } else {
            post.getLikedUserIds().add(userId);
            // Send notification to post owner when someone likes their post
            if (!post.getUser().getId().equals(userId)) { // Don't send notification if user likes their own post
                String content = String.format("%s %s liked your post: %s", 
                    user.getFirstName(), user.getLastName(), post.getTitle());
                notificationService.createNotification(
                    post.getUser().getId(),
                    userId,
                    postId,
                    Notification.NotificationType.LIKE,
                    content
                );
            }
        }

        post.setLikeCount(post.getLikedUserIds().size());
        Post updatedPost = postService.updatePost(post);

        Map<String, Object> res = new HashMap<>();
        res.put("likeCount", updatedPost.getLikeCount());
        res.put("likedByCurrentUser", updatedPost.getLikedUserIds().contains(userId));
        return ResponseEntity.ok(res);
    }
}