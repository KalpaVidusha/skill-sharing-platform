package com.y3s1.we15.skillsharingplatform.Controllers;



import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.y3s1.we15.skillsharingplatform.Service.LikeService;

import java.util.Map;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "http://localhost:3000")
public class LikeController {
    @Autowired
    private LikeService likeService;

    @PostMapping
    public void likePost(@RequestBody Map<String, String> body) {
        likeService.likePost(body.get("postId"), body.get("userId"));
    }

    @GetMapping("/count/{postId}")
    public long countLikes(@PathVariable String postId) {
        return likeService.countLikes(postId);
    }

    @PostMapping("/unlike")
    public void unlikePost(@RequestBody Map<String, String> body) {
        likeService.unlikePost(body.get("postId"), body.get("userId"));
    }
}

