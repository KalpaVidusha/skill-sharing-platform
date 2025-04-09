package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.Post;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Repositories.PostRepository;
import com.y3s1.we15.skillsharingplatform.Repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public Post createPost(Post post) {
        // Ensure created and updated timestamps are set
        if (post.getCreatedAt() == null) {
            post.setCreatedAt(java.time.LocalDateTime.now());
        }
        post.setUpdatedAt(java.time.LocalDateTime.now());
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
        Optional<UserModel> user = userRepository.findById(userId);
        if (user.isPresent()) {
            return postRepository.findByUser(user.get());
        }
        return List.of(); // Return empty list if user not found
    }

    public void deletePost(String id) {
        postRepository.deleteById(id);
    }
}