package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.ChatBox;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Repositories.ChatBoxRepository;
import com.y3s1.we15.skillsharingplatform.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class ChatBoxService {
    
    @Autowired
    private ChatBoxRepository chatBoxRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public List<ChatBox> getMessagesBetweenUsers(String userId1, String userId2) {
        UserModel user1 = userRepository.findById(userId1)
            .orElseThrow(() -> new RuntimeException("User not found"));
        UserModel user2 = userRepository.findById(userId2)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return chatBoxRepository.findBySenderAndRecipientOrRecipientAndSenderOrderByCreatedAtAsc(user1, user2, user1, user2);
    }
    
    public ChatBox sendMessage(String senderId, String recipientId, String content) {
        UserModel sender = userRepository.findById(senderId)
            .orElseThrow(() -> new RuntimeException("Sender not found"));
        UserModel recipient = userRepository.findById(recipientId)
            .orElseThrow(() -> new RuntimeException("Recipient not found"));
            
        ChatBox message = new ChatBox();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(content);
        
        return chatBoxRepository.save(message);
    }
    
    public ChatBox editMessage(String messageId, String newContent) {
        ChatBox message = chatBoxRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setContent(newContent);
        return chatBoxRepository.save(message);
    }
    
    public void deleteMessage(String messageId) {
        chatBoxRepository.deleteById(messageId);
    }
    
    public List<ChatBox> getUserMessages(String userId) {
        UserModel user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return chatBoxRepository.findBySenderAndRecipientOrRecipientAndSenderOrderByCreatedAtAsc(user, user, user, user);
    }
    
    public List<Map<String, Object>> getRecentChats(String userId) {
        UserModel currentUser = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
            
        // Get all messages where the user is either sender or recipient
        List<ChatBox> allMessages = chatBoxRepository.findBySenderAndRecipientOrRecipientAndSenderOrderByCreatedAtAsc(
            currentUser, currentUser, currentUser, currentUser);
            
        // Group messages by the other user (conversation partner)
        Map<String, List<ChatBox>> messagesByUser = new HashMap<>();
        
        for (ChatBox message : allMessages) {
            String otherUserId;
            if (message.getSender().getId().equals(userId)) {
                otherUserId = message.getRecipient().getId();
            } else {
                otherUserId = message.getSender().getId();
            }
            
            if (!messagesByUser.containsKey(otherUserId)) {
                messagesByUser.put(otherUserId, new ArrayList<>());
            }
            messagesByUser.get(otherUserId).add(message);
        }
        
        // For each conversation, get the most recent message and user details
        List<Map<String, Object>> recentChats = new ArrayList<>();
        
        for (Map.Entry<String, List<ChatBox>> entry : messagesByUser.entrySet()) {
            String otherUserId = entry.getKey();
            List<ChatBox> conversation = entry.getValue();
            
            // Sort by created timestamp descending to get the most recent message
            conversation.sort(Comparator.comparing(ChatBox::getCreatedAt).reversed());
            ChatBox latestMessage = conversation.get(0);
            
            // Get the other user details
            UserModel otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
            Map<String, Object> chatInfo = new HashMap<>();
            chatInfo.put("userId", otherUser.getId());
            chatInfo.put("username", otherUser.getUsername());
            chatInfo.put("firstName", otherUser.getFirstName());
            chatInfo.put("lastName", otherUser.getLastName());
            chatInfo.put("profilePicture", otherUser.getProfilePicture());
            chatInfo.put("lastMessage", latestMessage.getContent());
            chatInfo.put("timestamp", latestMessage.getCreatedAt());
            chatInfo.put("isRead", true); // Add logic for read status if needed
            
            recentChats.add(chatInfo);
        }
        
        // Sort recent chats by the timestamp of the last message (most recent first)
        recentChats.sort((a, b) -> {
            Date dateA = (Date) a.get("timestamp");
            Date dateB = (Date) b.get("timestamp");
            return dateB.compareTo(dateA);
        });
        
        return recentChats;
    }
} 