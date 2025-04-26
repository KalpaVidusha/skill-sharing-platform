package com.y3s1.we15.skillsharingplatform.Controllers;

import com.y3s1.we15.skillsharingplatform.Models.Notification;
import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Service.NotificationService;
import com.y3s1.we15.skillsharingplatform.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @Autowired
    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getUserNotifications(Authentication authentication) {
        String username = authentication.getName();
        UserModel user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(notificationService.getUserNotifications(user.getId()));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(Authentication authentication) {
        String username = authentication.getName();
        UserModel user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(notificationService.getUnreadNotifications(user.getId()));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        String username = authentication.getName();
        UserModel user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }
} 