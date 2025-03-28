package com.y3s1.we15.skillsharingplatform.Models;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "likes")
public class Like {

    @Id
    private String id;
    private String postId;
    private String userId;
    private LocalDateTime likedAt;

    // Getters
    public String getId() {
        return id;
    }

    public String getPostId() {
        return postId;
    }

    public String getUserId() {
        return userId;
    }

    public LocalDateTime getLikedAt() {
        return likedAt;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setPostId(String postId) {
        this.postId = postId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setLikedAt(LocalDateTime likedAt) {
        this.likedAt = likedAt;
    }
}


