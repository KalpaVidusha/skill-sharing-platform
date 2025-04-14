package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.MonetizationModel;
import com.y3s1.we15.skillsharingplatform.Repositories.MonetizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MonetizationService {

    @Autowired
    private MonetizationRepository monetizationRepository;

    public MonetizationModel createRequest(MonetizationModel request) {
        return monetizationRepository.save(request);
    }

    public List<MonetizationModel> getAllRequests() {
        return monetizationRepository.findAll();
    }
}
