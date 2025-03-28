package com.y3s1.we15.skillsharingplatform.Service;



import com.y3s1.we15.skillsharingplatform.Models.Like;
import com.y3s1.we15.skillsharingplatform.Repositories.LikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class LikeService {
    @Autowired
    private LikeRepository likeRepository;

    public void likePost(String postId, String userId) {
        if (!likeRepository.findByPostIdAndUserId(postId, userId).isPresent()) {
            Like like = new Like();
            like.setPostId(postId);
            like.setUserId(userId);
            like.setLikedAt(LocalDateTime.now());
            likeRepository.save(like);
        }
    }

    public long countLikes(String postId) {
        return likeRepository.countByPostId(postId);
    }

    public void unlikePost(String postId, String userId) {
        Optional<Like> like = likeRepository.findByPostIdAndUserId(postId, userId);
        like.ifPresent(value -> likeRepository.deleteById(value.getId()));
    }
}

