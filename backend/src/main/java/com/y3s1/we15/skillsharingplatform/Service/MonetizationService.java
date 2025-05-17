// package com.y3s1.we15.skillsharingplatform.Service;

// import com.y3s1.we15.skillsharingplatform.Models.MonetizationModel;
// import com.y3s1.we15.skillsharingplatform.Repositories.MonetizationRepository;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import java.util.List;

// @Service
// public class MonetizationService {

//     @Autowired
//     private MonetizationRepository monetizationRepository;

//     public MonetizationModel createRequest(MonetizationModel request) {
//         return monetizationRepository.save(request);
//     }

//     public List<MonetizationModel> getAllRequests() {
//         return monetizationRepository.findAll();
//     }
//     public void deleteRequest(String id) {
//         monetizationRepository.deleteById(id);
//     }
//     public MonetizationModel getRequestById(String id) {
//         return monetizationRepository.findById(id).orElseThrow(() -> new RuntimeException("Request not found"));
//     }
    
//     public MonetizationModel updateRequest(String id, MonetizationModel updatedRequest) {
//         MonetizationModel existing = monetizationRepository.findById(id)
//                 .orElseThrow(() -> new RuntimeException("Request not found"));
    
//         existing.setUserId(updatedRequest.getUserId());
//         existing.setContentType(updatedRequest.getContentType());
//         existing.setDescription(updatedRequest.getDescription());
//         existing.setPlatform(updatedRequest.getPlatform());
//         existing.setExpectedEarnings(updatedRequest.getExpectedEarnings());
    
//         return monetizationRepository.save(existing);
//     }
// }




// Example MonetizationService Interface
package com.y3s1.we15.skillsharingplatform.Service;

import com.y3s1.we15.skillsharingplatform.Models.MonetizationModel;
import java.util.List;
import java.util.Optional;

public interface MonetizationService {
    MonetizationModel createRequest(MonetizationModel request);
    Optional<MonetizationModel> getRequestById(String id);
    List<MonetizationModel> getRequestsByUserId(String userId);
    List<MonetizationModel> getAllRequests();
    MonetizationModel updateRequest(MonetizationModel request); // Takes the full updated model
    boolean deleteRequest(String id);
   
MonetizationModel saveRequest(MonetizationModel request);
}



