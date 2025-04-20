package com.y3s1.we15.skillsharingplatform.Security;

import com.y3s1.we15.skillsharingplatform.Models.UserModel;
import com.y3s1.we15.skillsharingplatform.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserModel user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));

        // Handle null roles by providing a default role
        List<SimpleGrantedAuthority> authorities;
        if (user.getRole() == null) {
            authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
            
            // Update the user with a default role
            HashSet<String> defaultRoles = new HashSet<>();
            defaultRoles.add("USER");
            user.setRole(defaultRoles);
            userRepository.save(user);
        } else {
            authorities = user.getRole().stream()
                    .map(role -> new SimpleGrantedAuthority(role))
                    .collect(Collectors.toList());
        }

        // Create user details with authorities
        return new User(user.getUsername(), user.getPassword(), authorities);
    }
} 