package com.y3s1.we15.skillsharingplatform.Repositories;

import com.y3s1.we15.skillsharingplatform.Models.Progress;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgressRepository extends MongoRepository<Progress, String> {
    List<Progress> findByUser(UserModel user);
    List<Progress> findByUserId(String userId);
    List<Progress> findAllByOrderByCreatedAtDesc();
} 