package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.Post;
import com.y3s1.we15.skillsharingplatform.Repositories.PostRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {
    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public Post createPost(Post post) {
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Optional<Post> getPostById(String id) {
        return postRepository.findById(id);
    }

    public List<Post> getPostsByCategory(String category) {
        return postRepository.findByCategory(category);
    }

    public List<Post> searchPosts(String title) {
        return postRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Post> getPostsByUserId(String userId) {
        return postRepository.findByUserId(userId);
    }

    public void deletePost(String id) {
        postRepository.deleteById(id);
    }
}