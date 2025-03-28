package com.y3s1.we15.skillsharingplatform.Repositories;



import com.y3s1.we15.skillsharingplatform.Models.Like;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface LikeRepository extends MongoRepository<Like, String> {
    long countByPostId(String postId);
    Optional<Like> findByPostIdAndUserId(String postId, String userId);
}
