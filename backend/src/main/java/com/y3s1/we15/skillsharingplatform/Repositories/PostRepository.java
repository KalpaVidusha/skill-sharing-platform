package com.y3s1.we15.skillsharingplatform.Repositories;

import com.y3s1.we15.skillsharingplatform.Models.Post;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PostRepository extends MongoRepository<Post, String> {
    List<Post> findByCategory(String category);
    List<Post> findByTitleContainingIgnoreCase(String title);
    List<Post> findByUserId(String userId);
    List<Post> findByUser(UserModel user);
}