package com.y3s1.we15.skillsharingplatform.Controllers;

import com.y3s1.we15.skillsharingplatform.Models.ChatBox;
import com.y3s1.we15.skillsharingplatform.Service.ChatBoxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatBoxController {
    
    @Autowired
    private ChatBoxService chatBoxService;
    
    @GetMapping("/messages/{userId}")
    public ResponseEntity<List<ChatBox>> getMessagesBetweenUsers(
            @PathVariable String userId,
            @RequestParam String otherUserId) {
        return ResponseEntity.ok(chatBoxService.getMessagesBetweenUsers(userId, otherUserId));
    }
    
    @PostMapping("/messages")
    public ResponseEntity<ChatBox> sendMessage(
            @RequestParam String senderId,
            @RequestParam String recipientId,
            @RequestParam String content) {
        return ResponseEntity.ok(chatBoxService.sendMessage(senderId, recipientId, content));
    }
    
    @PutMapping("/messages/{messageId}")
    public ResponseEntity<ChatBox> editMessage(
            @PathVariable String messageId,
            @RequestParam String content) {
        return ResponseEntity.ok(chatBoxService.editMessage(messageId, content));
    }
    
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable String messageId) {
        chatBoxService.deleteMessage(messageId);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/users/{userId}/messages")
    public ResponseEntity<List<ChatBox>> getUserMessages(@PathVariable String userId) {
        return ResponseEntity.ok(chatBoxService.getUserMessages(userId));
    }
    
    @GetMapping("/users/{userId}/recent")
    public ResponseEntity<List<Map<String, Object>>> getRecentChats(@PathVariable String userId) {
        return ResponseEntity.ok(chatBoxService.getRecentChats(userId));
    }
} 