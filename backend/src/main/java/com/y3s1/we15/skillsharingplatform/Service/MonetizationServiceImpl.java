package com.y3s1.we15.skillsharingplatform.Service; // Make sure this package matches your project structure

import com.y3s1.we15.skillsharingplatform.Models.MonetizationModel;
import com.y3s1.we15.skillsharingplatform.Repositories.MonetizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;
import java.util.Optional;

/**
 * Service implementation for handling Monetization Request business logic.
 */
@Service // Marks this class as a Spring service component
public class MonetizationServiceImpl implements MonetizationService { // Implements the service interface

    // Inject the repository for database interaction
    @Autowired
    private MonetizationRepository monetizationRepository;

    // Inject MongoTemplate for more complex query capabilities if needed
    @Autowired
    private MongoTemplate mongoTemplate;

    /**
     * Creates and saves a new monetization request.
     *
     * @param request The MonetizationModel object to create.
     * @return The saved MonetizationModel object with its generated ID.
     */
    @Override
    public MonetizationModel createRequest(MonetizationModel request) {
        // Add any validation or business logic before saving if necessary
        // For example: ensure required fields are not null, etc.
        return monetizationRepository.save(request);
    }

    /**
     * Retrieves a specific monetization request by its unique ID.
     *
     * @param id The ID of the monetization request to find.
     * @return An Optional containing the found MonetizationModel, or empty if not found.
     */
    @Override
    public Optional<MonetizationModel> getRequestById(String id) {
        return monetizationRepository.findById(id);
    }

    /**
     * Retrieves all monetization requests associated with a specific user ID.
     *
     * @param userId The ID of the user whose requests are to be fetched.
     * @return A List of MonetizationModel objects belonging to the user.
     */
    @Override
    public List<MonetizationModel> getRequestsByUserId(String userId) {
        // Using MongoTemplate to build a query based on the 'userId' field
        Query query = new Query();
        query.addCriteria(Criteria.where("userId").is(userId)); // Find documents where userId matches
        return mongoTemplate.find(query, MonetizationModel.class);

        /*
         * Alternative using Repository method (if defined):
         * Requires adding the following method signature to MonetizationRepository interface:
         * List<MonetizationModel> findByUserId(String userId);
         *
         * return monetizationRepository.findByUserId(userId);
         */
    }

    /**
     * Retrieves all monetization requests stored in the database.
     * (Typically used by administrators).
     *
     * @return A List containing all MonetizationModel objects.
     */
    @Override
    public List<MonetizationModel> getAllRequests() {
        return monetizationRepository.findAll();
    }

    /**
     * Updates an existing monetization request.
     *
     * @param request The MonetizationModel object containing the updated information and the ID of the request to update.
     * @return The updated and saved MonetizationModel object.
     * @throws IllegalArgumentException if the request ID is null or the request doesn't exist.
     */
    @Override
    public MonetizationModel updateRequest(MonetizationModel request) {
        // Check if the request exists before attempting to update
        if (request.getId() == null || !monetizationRepository.existsById(request.getId())) {
            throw new IllegalArgumentException("Monetization Request not found or ID is missing for update operation. ID: " + request.getId());
        }
        // Add any validation or business logic for the update if necessary
        // The save method performs an upsert: updates if ID exists, inserts if not.
        // The check above ensures we are only updating.
        return monetizationRepository.save(request);
    }

    /**
     * Deletes a monetization request by its unique ID.
     *
     * @param id The ID of the monetization request to delete.
     * @return true if the request was found and deleted, false otherwise.
     */
    @Override
    public boolean deleteRequest(String id) {
        // Check if the request exists before trying to delete
        if (monetizationRepository.existsById(id)) {
            monetizationRepository.deleteById(id);
            return true; // Deletion successful
        }
        return false; // Request not found, deletion failed
    }
}