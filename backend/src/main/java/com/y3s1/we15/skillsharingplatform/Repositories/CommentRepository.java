package com.y3s1.we15.skillsharingplatform.Repositories;



import com.y3s1.we15.skillsharingplatform.Models.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByPostId(String postId);
}

