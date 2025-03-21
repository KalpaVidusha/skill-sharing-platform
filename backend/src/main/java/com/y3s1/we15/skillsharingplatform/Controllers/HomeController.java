package com.y3s1.we15.skillsharingplatform.Controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> welcome() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Welcome to the Skill Sharing Platform API");
        response.put("version", "1.0");
        response.put("endpoints", new String[] {
            "/api/users - User management",
            "/api/users/{id} - Get user by ID",
            "/api/users/username/{username} - Get user by username",
            "/api/users/email/{email} - Get user by email"
        });
        return response;
    }
}
