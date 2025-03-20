package com.y3s1.we15.skillsharingplatform.config;

import de.flapdoodle.embed.mongo.spring.autoconfigure.EmbeddedMongoAutoConfiguration;
import org.springframework.boot.autoconfigure.AutoConfigureBefore;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.test.context.ActiveProfiles;

@Configuration
@AutoConfigureBefore(EmbeddedMongoAutoConfiguration.class)
@Profile("test")
public class TestMongoConfig {
    // Configuration for embedded MongoDB
}
