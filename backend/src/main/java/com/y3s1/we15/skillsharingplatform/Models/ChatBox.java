package com.y3s1.we15.skillsharingplatform.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;

@Document(collection = "chat_messages")
@Data
public class ChatBox {
    @Id
    private String id;

    private UserModel sender;
    private UserModel recipient;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ChatBox() {
        this.createdAt = LocalDateTime.now();
    }

    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
} 