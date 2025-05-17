package com.y3s1.we15.skillsharingplatform.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "monetization_requests")
public class MonetizationModel {
    @Id
    private String id;
    private String userId;
    private String contentType;
    private String description;
    private String platform;
    private String expectedEarnings;

    public MonetizationModel() {}

    public MonetizationModel(String userId, String contentType, String description, String platform, String expectedEarnings) {
        this.userId = userId;
        this.contentType = contentType;
        this.description = description;
        this.platform = platform;
        this.expectedEarnings = expectedEarnings;
    }

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getExpectedEarnings() { return expectedEarnings; }
    public void setExpectedEarnings(String expectedEarnings) { this.expectedEarnings = expectedEarnings; }
}
