package com.y3s1.we15.skillsharingplatform.Models;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.ArrayList;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class UserModel {
    @Id
    private String id;
    private String username;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private List<String> skills;
    private String contactNumber;
    private Set<String> role;
    private String profilePicture;
    private String location;
    private String socialLinks;
    private Map<String, String> oauthIds;
    private List<String> followers = new ArrayList<>();
    private List<String> following = new ArrayList<>();

    public UserModel() {}

    public UserModel(String username, String email, String password, String firstName, String lastName, List<String> skills) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.skills = skills;
        this.followers = new ArrayList<>();
        this.following = new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public Set<String> getRole() {
        return role;
    }

    public void setRole(Set<String> role) {
        this.role = role;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getSocialLinks() {
        return socialLinks;
    }

    public void setSocialLinks(String socialLinks) {
        this.socialLinks = socialLinks;
    }
    
    public Map<String, String> getOauthIds() {
        return oauthIds;
    }
    
    public void setOauthIds(Map<String, String> oauthIds) {
        this.oauthIds = oauthIds;
    }

    public List<String> getFollowers() {
        return followers;
    }

    public void setFollowers(List<String> followers) {
        this.followers = followers;
    }

    public List<String> getFollowing() {
        return following;
    }

    public void setFollowing(List<String> following) {
        this.following = following;
    }

    public void addFollower(String userId) {
        if (!this.followers.contains(userId)) {
            this.followers.add(userId);
        }
    }

    public void removeFollower(String userId) {
        this.followers.remove(userId);
    }

    public void addFollowing(String userId) {
        if (!this.following.contains(userId)) {
            this.following.add(userId);
        }
    }

    public void removeFollowing(String userId) {
        this.following.remove(userId);
    }

    @Override
    public String toString() {
        return "UserModel [contactNumber=" + contactNumber + ", email=" + email + ", id=" + id + ", location=" + location
                + ", firstName=" + firstName + ", lastName=" + lastName + ", password=" + password + ", profilePicture=" + profilePicture + ", role=" + role
                + ", skills=" + skills + ", socialLinks=" + socialLinks + ", username=" + username + ", oauthIds=" + oauthIds 
                + ", followers=" + followers + ", following=" + following + "]";
    }
}