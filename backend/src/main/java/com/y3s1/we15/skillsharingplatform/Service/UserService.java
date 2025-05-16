package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import java.util.List;
import java.util.Optional;

public interface UserService {
    UserModel createUser(UserModel user);
    List<UserModel> getAllUsers();
    Optional<UserModel> getUserById(String id);
    UserModel updateUser(UserModel user);
    void deleteUser(String id);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    UserModel findByUsername(String username);
    UserModel findByEmail(String email);
    UserModel login(String username, String email, String password);
    UserModel loginByUsername(String username, String password);
    UserModel loginByEmail(String email, String password);
    
    // Follow/Unfollow methods
    UserModel followUser(String userId, String userToFollowId);
    UserModel unfollowUser(String userId, String userToUnfollowId);
    List<UserModel> getFollowers(String userId);
    List<UserModel> getFollowing(String userId);
    List<UserModel> searchUsers(String query, int page, int size);
    
    // Get current user ID
    String getCurrentUserId();
}