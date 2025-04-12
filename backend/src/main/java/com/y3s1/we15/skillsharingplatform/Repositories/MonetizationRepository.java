package com.y3s1.we15.skillsharingplatform.Repositories;

import com.y3s1.we15.skillsharingplatform.Models.MonetizationModel;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MonetizationRepository extends MongoRepository<MonetizationModel, String> {
}
