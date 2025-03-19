package com.y3s1.we15.skillsharingplatform.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "posts")
public class Post {
    @Id
    private String id;
    private String userId;          // ID of the user who created the post
    private String description;
    private List<Media> media;      // Embedded list of media files
    private List<String> likedBy;   // List of user IDs who liked the post
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Nested class for media files
    public static class Media {
        private String url;        // URL of the uploaded file
        private String type;       // "image" or "video"
        private Integer duration;  // Duration in seconds (for videos)
    }
}