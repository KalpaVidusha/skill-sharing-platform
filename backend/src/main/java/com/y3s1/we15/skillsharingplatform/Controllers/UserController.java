package com.y3s1.we15.skillsharingplatform.Controllers;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    
    @GetMapping("/getUser")
    public String getUser() {
        return "My name is Buwaneka";
    }


}