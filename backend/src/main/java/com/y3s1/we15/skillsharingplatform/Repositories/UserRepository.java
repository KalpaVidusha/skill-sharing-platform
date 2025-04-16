package com.y3s1.we15.skillsharingplatform.Repositories;

import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<UserModel, String> {
    Optional<UserModel> findByUsername(String username);
    Optional<UserModel> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}