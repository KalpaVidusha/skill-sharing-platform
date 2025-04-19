package com.y3s1.we15.skillsharingplatform.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Autowired
    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadFile(MultipartFile file) throws IOException {
        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = (Map<String, Object>) cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "resource_type", "auto",
                "folder", "skill_sharing_platform"
            )
        );
        return (String) uploadResult.get("secure_url");
    }

    public List<String> uploadFiles(MultipartFile[] files) throws IOException {
        List<String> uploadedUrls = new ArrayList<>();
        
        for (MultipartFile file : files) {
            String url = uploadFile(file);
            uploadedUrls.add(url);
        }
        
        return uploadedUrls;
    }
}