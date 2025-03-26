package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.PostModel;
import com.y3s1.we15.skillsharingplatform.Repositories.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    public PostModel createPost(PostModel post) {
        return postRepository.save(post);
    }

    public List<PostModel> getAllPosts() {
        return postRepository.findAll();
    }

    public List<PostModel> getPostsByUserId(String userId) {
        return postRepository.findByUserId(userId);
    }

    public Optional<PostModel> getPostById(String id) {
        return postRepository.findById(id);
    }

    public void deletePost(String id) {
        postRepository.deleteById(id);
    }
}
