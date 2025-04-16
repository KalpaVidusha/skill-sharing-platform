package com.y3s1.we15.skillsharingplatform.Controllers.monetizationAndReward;

import com.y3s1.we15.skillsharingplatform.Models.MonetizationModel;
import com.y3s1.we15.skillsharingplatform.Service.MonetizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/monetization")
@CrossOrigin(origins = "http://localhost:3000")
public class MonetizationController {

    @Autowired
    private MonetizationService monetizationService;

    @PostMapping
    public ResponseEntity<MonetizationModel> createRequest(@RequestBody MonetizationModel request) {
        return ResponseEntity.ok(monetizationService.createRequest(request));
    }

    @GetMapping
    public ResponseEntity<List<MonetizationModel>> getAllRequests() {
        return ResponseEntity.ok(monetizationService.getAllRequests());
    }
}
