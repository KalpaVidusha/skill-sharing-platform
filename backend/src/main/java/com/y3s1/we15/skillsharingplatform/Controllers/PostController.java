package com.y3s1.we15.skillsharingplatform.Controllers; // Package name lowercase

import com.y3s1.we15.skillsharingplatform.Models.Post;
import com.y3s1.we15.skillsharingplatform.services.PostService;
import com.y3s1.we15.skillsharingplatform.dto.PostRequest; // Add missing DTO import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController { // Single class definition

    private final PostService postService;

    @Autowired // Constructor injection preferred over field injection
    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Post> createPost(
            @RequestBody PostRequest postRequest,
            Principal principal
    ) {
        Post post = postService.createPost(postRequest, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(post);
    }

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }
}