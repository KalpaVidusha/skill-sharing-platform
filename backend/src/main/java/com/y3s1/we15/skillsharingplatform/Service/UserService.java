package com.y3s1.we15.skillsharingplatform.Service;

import java.util.List;

import com.y3s1.we15.skillsharingplatform.Models.UserModel;

public interface UserService {
    
    List<UserModel> getAllUsers();
    UserModel getUserById(Integer id);
    UserModel createUser(UserModel user);
    UserModel updateUser(UserModel id, UserModel userDetails);
    boolean deleteUser(Integer id);
    UserModel findByEmail(String email);
    UserModel findByUsername(String username);
}
