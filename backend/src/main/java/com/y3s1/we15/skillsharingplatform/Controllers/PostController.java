package com.y3s1.we15.skillsharingplatform.Controllers;

import com.y3s1.we15.skillsharingplatform.Models.PostModel;
import com.y3s1.we15.skillsharingplatform.Service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody PostModel post) {
        if (post.getMediaUrls() == null || post.getMediaUrls().size() == 0) {
            return ResponseEntity.badRequest().body("At least one media file is required.");
        }

        if (post.getMediaUrls().size() > 3) {
            return ResponseEntity.badRequest().body("Maximum of 3 media files allowed.");
        }

        if (post.getMediaTypes() != null) {
            for (String type : post.getMediaTypes()) {
                if (!type.equals("photo") && !type.equals("video")) {
                    return ResponseEntity.badRequest().body("Invalid media type: " + type);
                }
            }
        }

        PostModel created = postService.createPost(post);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<PostModel>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PostModel>> getPostsByUser(@PathVariable String userId) {
        return ResponseEntity.ok(postService.getPostsByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPostById(@PathVariable String id) {
        Optional<PostModel> post = postService.getPostById(id);
        return post.map(ResponseEntity::ok).orElseGet(() ->
                ResponseEntity.status(404).body(null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(@PathVariable String id) {
        postService.deletePost(id);
        return ResponseEntity.ok("Post deleted");
    }
}
