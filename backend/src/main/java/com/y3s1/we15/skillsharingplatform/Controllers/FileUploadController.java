package com.y3s1.we15.skillsharingplatform.Controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:3000")
public class FileUploadController {

    private final Path rootLocation = Paths.get("uploads");

    @PostMapping
    public ResponseEntity<?> handleFileUpload(@RequestParam("files") MultipartFile[] files) {
        try {
            if (files.length > 3) {
                return ResponseEntity.badRequest().body(Map.of("error", "Maximum 3 files allowed"));
            }

            List<String> fileUrls = new ArrayList<>();
            Files.createDirectories(rootLocation); // Create directory if not exists

            for (MultipartFile file : files) {
                String filename = LocalDateTime.now().toString().replace(":", "-") + "_" + file.getOriginalFilename();
                Files.copy(file.getInputStream(), rootLocation.resolve(filename));
                fileUrls.add("/uploads/" + filename);
            }

            return ResponseEntity.ok(Map.of("urls", fileUrls));
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "File upload failed"));
        }
    }
}