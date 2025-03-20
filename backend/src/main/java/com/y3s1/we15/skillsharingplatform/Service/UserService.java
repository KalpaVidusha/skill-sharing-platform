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
}
