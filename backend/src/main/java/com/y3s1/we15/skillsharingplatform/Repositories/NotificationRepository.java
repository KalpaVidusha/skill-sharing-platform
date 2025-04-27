package com.y3s1.we15.skillsharingplatform.Repositories;

import com.y3s1.we15.skillsharingplatform.Models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);
    List<Notification> findByRecipientIdAndIsReadFalseOrderByCreatedAtDesc(String recipientId);
    void deleteByPostId(String postId);
} 