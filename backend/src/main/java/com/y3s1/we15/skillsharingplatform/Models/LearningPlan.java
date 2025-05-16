package com.y3s1.we15.skillsharingplatform.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "learning_plans")
public class LearningPlan {
    @Id
    private String id;

    @DBRef
    private UserModel user;

    private String title;
    private String description;
    private List<Topic> topics;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static class Topic {
        private String name;
        private String resources;
        private String timeline;
        private boolean completed;

        public Topic() {}
        public Topic(String name, String resources, String timeline, boolean completed) {
            this.name = name;
            this.resources = resources;
            this.timeline = timeline;
            this.completed = completed;
        }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getResources() { return resources; }
        public void setResources(String resources) { this.resources = resources; }
        public String getTimeline() { return timeline; }
        public void setTimeline(String timeline) { this.timeline = timeline; }
        public boolean isCompleted() { return completed; }
        public void setCompleted(boolean completed) { this.completed = completed; }
    }

    public LearningPlan() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public UserModel getUser() { return user; }
    public void setUser(UserModel user) { this.user = user; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<Topic> getTopics() { return topics; }
    public void setTopics(List<Topic> topics) { this.topics = topics; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
} 