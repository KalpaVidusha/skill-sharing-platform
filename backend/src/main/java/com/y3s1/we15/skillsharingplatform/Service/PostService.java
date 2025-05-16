package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.Post;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Repositories.PostRepository;
import com.y3s1.we15.skillsharingplatform.Repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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
        if (post.getCreatedAt() == null) {
            post.setCreatedAt(LocalDateTime.now());
        }
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Optional<Post> getPostById(String id) {
        return postRepository.findById(id);
    }

    public Post updatePost(Post post) {
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public List<Post> getPostsByCategory(String category) {
        return postRepository.findByCategory(category);
    }

    public List<Post> searchPosts(String title) {
        return postRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Post> getPostsByUserId(String userId) {
        Optional<UserModel> user = userRepository.findById(userId);
        return user.map(postRepository::findByUser).orElse(List.of());
    }

    public void deletePost(String id) {
        postRepository.deleteById(id);
    }

    /**
     * Check if the user is the owner of the post
     * 
     * @param postId the post ID
     * @param userId the user ID
     * @return true if the user is the owner, false otherwise
     */
    public boolean isPostOwner(String postId, String userId) {
        return postRepository.findById(postId)
                .map(post -> {
                    UserModel user = post.getUser();
                    return user != null && userId.equals(user.getId());
                })
                .orElse(false);
    }

    public Post save(Post post) {
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }
}