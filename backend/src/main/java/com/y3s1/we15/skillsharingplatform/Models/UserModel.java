package com.y3s1.we15.skillsharingplatform.Models;

import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;



@Document(collection = "users")
public class UserModel {
    
    @Id
    private Integer id;
    private String name;
    private String username;
    private String email;
    private String password;
    private String contactNumber;
    private Set<String> role;
    private String profilePicture;
    private String skills;
    private String location;
    private String socialLinks;
    

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
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

    @Override
    public String toString() {
        return "UserModel [contactNumber=" + contactNumber + ", email=" + email + ", id=" + id + ", location=" + location
                + ", name=" + name + ", password=" + password + ", profilePicture=" + profilePicture + ", role=" + role
                + ", skills=" + skills + ", socialLinks=" + socialLinks + ", username=" + username + "]";
    }
    
}   

