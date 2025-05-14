package com.y3s1.we15.skillsharingplatform.Repositories;

import com.y3s1.we15.skillsharingplatform.Models.ChatBox;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatBoxRepository extends MongoRepository<ChatBox, String> {
    List<ChatBox> findBySenderAndRecipientOrRecipientAndSenderOrderByCreatedAtAsc(
        UserModel sender, UserModel recipient, UserModel recipient2, UserModel sender2);
} 