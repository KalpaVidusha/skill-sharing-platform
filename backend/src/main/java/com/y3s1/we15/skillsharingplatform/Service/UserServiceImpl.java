package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository userRepository;

    @Override
    public UserModel createUser(UserModel user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        // Password encoding is now handled at the controller level
        return userRepository.save(user);
    }

    @Override
    public List<UserModel> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<UserModel> getUserById(String id) {
        return userRepository.findById(id);
    }

    @Override
    public UserModel updateUser(UserModel user) {
        return userRepository.save(user);
    }

    @Override
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public UserModel findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    @Override
    public UserModel findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public UserModel login(String username, String email, String password) {
        // This method is deprecated and should not be used directly.
        // Authentication is now handled by the Spring Security AuthenticationManager
        if (username != null && !username.isEmpty()) {
            UserModel user = findByUsername(username);
            return user; // Password verification is now handled by AuthenticationProvider
        } else if (email != null && !email.isEmpty()) {
            UserModel user = findByEmail(email);
            return user; // Password verification is now handled by AuthenticationProvider
        }
        return null;
    }

    @Override
    public UserModel loginByUsername(String username, String password) {
        // This method is deprecated and should not be used directly.
        // Authentication is now handled by the Spring Security AuthenticationManager
        return findByUsername(username);
    }

    @Override
    public UserModel loginByEmail(String email, String password) {
        // This method is deprecated and should not be used directly.
        // Authentication is now handled by the Spring Security AuthenticationManager
        return findByEmail(email);
    }

    @Override
    public UserModel followUser(String userId, String userToFollowId) {
        if (userId.equals(userToFollowId)) {
            throw new RuntimeException("Users cannot follow themselves");
        }
        
        Optional<UserModel> currentUserOpt = userRepository.findById(userId);
        Optional<UserModel> userToFollowOpt = userRepository.findById(userToFollowId);
        
        if (currentUserOpt.isPresent() && userToFollowOpt.isPresent()) {
            UserModel currentUser = currentUserOpt.get();
            UserModel userToFollow = userToFollowOpt.get();
            
            // Add to following list of current user
            currentUser.addFollowing(userToFollowId);
            
            // Add to followers list of the user being followed
            userToFollow.addFollower(userId);
            
            // Save both users
            userRepository.save(userToFollow);
            return userRepository.save(currentUser);
        } else {
            throw new RuntimeException("One or both users not found");
        }
    }
    
    @Override
    public UserModel unfollowUser(String userId, String userToUnfollowId) {
        Optional<UserModel> currentUserOpt = userRepository.findById(userId);
        Optional<UserModel> userToUnfollowOpt = userRepository.findById(userToUnfollowId);
        
        if (currentUserOpt.isPresent() && userToUnfollowOpt.isPresent()) {
            UserModel currentUser = currentUserOpt.get();
            UserModel userToUnfollow = userToUnfollowOpt.get();
            
            // Remove from following list of current user
            currentUser.removeFollowing(userToUnfollowId);
            
            // Remove from followers list of the user being unfollowed
            userToUnfollow.removeFollower(userId);
            
            // Save both users
            userRepository.save(userToUnfollow);
            return userRepository.save(currentUser);
        } else {
            throw new RuntimeException("One or both users not found");
        }
    }
    
    @Override
    public List<UserModel> getFollowers(String userId) {
        Optional<UserModel> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            UserModel user = userOpt.get();
            List<UserModel> followers = new ArrayList<>();
            
            for (String followerId : user.getFollowers()) {
                userRepository.findById(followerId).ifPresent(followers::add);
            }
            
            return followers;
        } else {
            throw new RuntimeException("User not found");
        }
    }
    
    @Override
    public List<UserModel> getFollowing(String userId) {
        Optional<UserModel> userOpt = userRepository.findById(userId);
        
        if (userOpt.isPresent()) {
            UserModel user = userOpt.get();
            List<UserModel> following = new ArrayList<>();
            
            for (String followingId : user.getFollowing()) {
                userRepository.findById(followingId).ifPresent(following::add);
            }
            
            return following;
        } else {
            throw new RuntimeException("User not found");
        }
    }
    
    @Override
    public List<UserModel> searchUsers(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        List<UserModel> allUsers = userRepository.findAll();
        
        // Filter users based on the query (case-insensitive)
        String lowercaseQuery = query.toLowerCase();
        return allUsers.stream()
            .filter(user -> 
                (user.getUsername() != null && user.getUsername().toLowerCase().contains(lowercaseQuery)) ||
                (user.getFirstName() != null && user.getFirstName().toLowerCase().contains(lowercaseQuery)) ||
                (user.getLastName() != null && user.getLastName().toLowerCase().contains(lowercaseQuery)))
            .skip(pageable.getOffset())
            .limit(pageable.getPageSize())
            .collect(Collectors.toList());
    }

    @Override
    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            UserModel user = findByUsername(username);
            if (user != null) {
                return user.getId();
            }
        }
        throw new RuntimeException("User not authenticated");
    }
}