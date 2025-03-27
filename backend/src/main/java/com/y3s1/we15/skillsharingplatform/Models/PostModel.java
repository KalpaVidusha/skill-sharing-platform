package com.y3s1.we15.skillsharingplatform.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "posts")
public class PostModel {

    @Id
    private String id;

    private String userId; // ID of the user who created the post

    private String description;

    // List of media URLs (could be S3, local path, etc.)
    private List<String> mediaUrls;

    // Type for each media file: photo or video
    private List<String> mediaTypes;

    private LocalDateTime createdAt;

    // Constructors
    public PostModel() {}

    public PostModel(String userId, String description, List<String> mediaUrls, List<String> mediaTypes) {
        this.userId = userId;
        this.description = description;
        this.mediaUrls = mediaUrls;
        this.mediaTypes = mediaTypes;
        this.createdAt = LocalDateTime.now();
    }

    // Getters & Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getMediaUrls() {
        return mediaUrls;
    }

    public void setMediaUrls(List<String> mediaUrls) {
        this.mediaUrls = mediaUrls;
    }

    public List<String> getMediaTypes() {
        return mediaTypes;
    }

    public void setMediaTypes(List<String> mediaTypes) {
        this.mediaTypes = mediaTypes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
