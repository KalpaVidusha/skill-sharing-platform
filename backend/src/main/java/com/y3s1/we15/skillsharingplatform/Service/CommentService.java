package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.Comment;
import com.y3s1.we15.skillsharingplatform.Repositories.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    public Comment addComment(Comment comment) {
        comment.setCreatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public List<Comment> getCommentsByPost(String postId) {
        return commentRepository.findByPostId(postId);
    }

    public Optional<Comment> getCommentById(String id) {
        return commentRepository.findById(id);
    }

    public Comment updateComment(String id, Comment updatedComment) {
        Optional<Comment> existing = commentRepository.findById(id);
        if (existing.isPresent()) {
            Comment comment = existing.get();
            comment.setContent(updatedComment.getContent());
            return commentRepository.save(comment);
        }
        return null;
    }

    public void deleteComment(String id) {
        commentRepository.deleteById(id);
    }
}
