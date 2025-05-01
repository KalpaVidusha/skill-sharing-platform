package com.y3s1.we15.skillsharingplatform.Repositories;

import com.y3s1.we15.skillsharingplatform.Models.ProgressComment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProgressCommentRepository extends MongoRepository<ProgressComment, String> {
    List<ProgressComment> findByProgressId(String progressId);
    List<ProgressComment> findByParentCommentId(String parentCommentId);
    long countByProgressId(String progressId);
    long countByProgressIdAndParentCommentIdIsNull(String progressId);
} 