package com.y3s1.we15.skillsharingplatform.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Document(collection = "progress")
public class Progress {
    @Id
    private String id;
    
    @DBRef
    private UserModel user;
    
    private String templateType; // "completed_tutorial", "new_skill", "learning_goal"
    private Map<String, String> content; // Flexible content based on template type
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<String> likes; // List of user IDs who liked this progress
    private int commentCount; // Number of comments on this progress

    public Progress() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.likes = new ArrayList<>();
        this.commentCount = 0;
    }

    public Progress(UserModel user, String templateType, Map<String, String> content) {
        this();
        this.user = user;
        this.templateType = templateType;
        this.content = content;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public UserModel getUser() {
        return user;
    }

    public void setUser(UserModel user) {
        this.user = user;
    }

    public String getTemplateType() {
        return templateType;
    }

    public void setTemplateType(String templateType) {
        this.templateType = templateType;
    }

    public Map<String, String> getContent() {
        return content;
    }

    public void setContent(Map<String, String> content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<String> getLikes() {
        return likes;
    }
    
    public void setLikes(List<String> likes) {
        this.likes = likes;
    }
    
    public int getCommentCount() {
        return commentCount;
    }
    
    public void setCommentCount(int commentCount) {
        this.commentCount = commentCount;
    }
} 