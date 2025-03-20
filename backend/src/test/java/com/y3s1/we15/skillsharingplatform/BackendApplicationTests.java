package com.y3s1.we15.skillsharingplatform;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(locations = "classpath:application.properties")
class BackendApplicationTests {

    @Test
    void contextLoads() {
        // This will use embedded MongoDB for testing
    }
}
