package com.y3s1.we15.skillsharingplatform.Repositories;

import com.y3s1.we15.skillsharingplatform.Models.PostModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PostRepository extends MongoRepository<PostModel, String> {
    List<PostModel> findByUserId(String userId);
}
