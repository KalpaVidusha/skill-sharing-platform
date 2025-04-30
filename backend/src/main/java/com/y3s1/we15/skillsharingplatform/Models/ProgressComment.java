package com.y3s1.we15.skillsharingplatform.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "progress_comments")
public class ProgressComment {

    @Id
    private String id;

    private String progressId;
    private String userId;
    private String userName;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProgressComment() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public ProgressComment(String progressId, String userId, String userName, String content) {
        this();
        this.progressId = progressId;
        this.userId = userId;
        this.userName = userName;
        this.content = content;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getProgressId() {
        return progressId;
    }

    public String getUserId() {
        return userId;
    }
    
    public String getUserName() {
        return userName;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setProgressId(String progressId) {
        this.progressId = progressId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
} 