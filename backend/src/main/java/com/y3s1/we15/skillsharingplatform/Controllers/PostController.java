package com.y3s1.we15.skillsharingplatform.Controllers;

import com.y3s1.we15.skillsharingplatform.Models.Post;
import com.y3s1.we15.skillsharingplatform.Models.UserModel; // Import UserModel
import com.y3s1.we15.skillsharingplatform.Service.PostService;
import com.y3s1.we15.skillsharingplatform.Service.UserService; // Import UserService
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {
    private final PostService postService;
    private final UserService userService; // Add UserService

    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService; // Initialize UserService
    }

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        // Fetch the user by ID and set it in the post
        Optional<UserModel> user = userService.getUserById(post.getUser().getId());
        if (user.isPresent()) {
            post.setUser (user.get()); // Set the user in the post
            Post createdPost = postService.createPost(post);
            return ResponseEntity.ok(createdPost);
        } else {
            return ResponseEntity.badRequest().build(); // Return bad request if user not found
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

    @GetMapping("/category/{category}")
    public List<Post> getPostsByCategory(@PathVariable String category) {
        return postService.getPostsByCategory(category);
    }

    @GetMapping("/search")
    public List<Post> searchPosts(@RequestParam String title) {
        return postService.searchPosts(title);
    }

    @GetMapping("/user/{userId}")
    public List<Post> getPostsByUser (@PathVariable String userId) {
        return postService.getPostsByUserId(userId);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}