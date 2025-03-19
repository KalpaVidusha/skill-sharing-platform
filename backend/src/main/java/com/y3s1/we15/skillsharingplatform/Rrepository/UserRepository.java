package com.y3s1.we15.skillsharingplatform.Rrepository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.y3s1.we15.skillsharingplatform.Models.UserModel;

public interface UserRepository extends MongoRepository<UserModel, Integer>{
    
}
