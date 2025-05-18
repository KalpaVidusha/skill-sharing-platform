package com.y3s1.we15.skillsharingplatform.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {
    // CORS configuration is now handled in WebSecurityConfig

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Apply to all endpoints under /api/
            .allowedOrigins("http://localhost:3000") // YOUR FRONTEND URL
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS") // MUST INCLUDE PATCH and OPTIONS
            .allowedHeaders("*") // Allows all headers, or you can be specific: "Authorization", "Content-Type", etc.
            .allowCredentials(true) // If you handle cookies or basic auth credentials
            .maxAge(3600); // How long the results of a preflight request can be cached
    }
}