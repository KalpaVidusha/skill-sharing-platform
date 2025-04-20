package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

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
}