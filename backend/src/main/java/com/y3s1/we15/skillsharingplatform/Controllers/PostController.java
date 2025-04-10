package com.y3s1.we15.skillsharingplatform.Controllers;

import com.y3s1.we15.skillsharingplatform.Models.Post;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Service.PostService;
import com.y3s1.we15.skillsharingplatform.Service.UserService;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PostController {

    private final PostService postService;
    private final UserService userService;

    @Autowired
    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable String id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Like toggle endpoint
    @PostMapping("/{postId}/like")
    public ResponseEntity<?> toggleLike(@PathVariable String postId, HttpSession session) {
        UserModel user = (UserModel) session.getAttribute("user");
        if (user == null) {
            return ResponseEntity.status(401).body("Login required");
        }

        Optional<Post> optionalPost = postService.getPostById(postId);
        if (optionalPost.isEmpty()) {
            return ResponseEntity.status(404).body("Post not found");
        }

        Post post = optionalPost.get();
        String userId = user.getId();

        if (post.getLikedUserIds().contains(userId)) {
            post.getLikedUserIds().remove(userId);
        } else {
            post.getLikedUserIds().add(userId);
        }

        post.setLikeCount(post.getLikedUserIds().size());
        postService.save(post);

        Map<String, Object> res = new HashMap<>();
        res.put("likeCount", post.getLikeCount());
        res.put("likedByCurrentUser", post.getLikedUserIds().contains(userId));

        return ResponseEntity.ok(res);
    }
}
