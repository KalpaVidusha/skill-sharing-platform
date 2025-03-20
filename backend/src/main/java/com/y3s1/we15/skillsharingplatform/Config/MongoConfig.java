package com.y3s1.we15.skillsharingplatform.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.bson.Document;
import com.mongodb.client.MongoClients;

@Configuration
public class MongoConfig {
    private static final Logger logger = LoggerFactory.getLogger(MongoConfig.class);

    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    private MongoTemplate mongoTemplate;

    @Bean
    public MongoDatabaseFactory mongoDatabaseFactory() {
        logger.info("Connecting to: MongoDB Atlas");
        return new SimpleMongoClientDatabaseFactory(MongoClients.create(mongoUri), "skillsharing");
    }

    @Bean
    public MongoTemplate mongoTemplate() {
        mongoTemplate = new MongoTemplate(mongoDatabaseFactory());
        return mongoTemplate;
    }
    
    @EventListener(ApplicationReadyEvent.class)
    public void logConnectionStatus() {
        try {
            Document pingCommand = new Document("ping", 1);
            mongoTemplate.getDb().runCommand(pingCommand);
            logger.info("MongoDB connected successfully");
        } catch (Exception e) {
            logger.error("MongoDB connection failed: " + e.getMessage());
        }
    }
}
