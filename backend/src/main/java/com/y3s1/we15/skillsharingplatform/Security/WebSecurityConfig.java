package com.y3s1.we15.skillsharingplatform.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfig {
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    
    @Autowired
    private JwtAuthenticationEntryPoint unauthorizedHandler;
    
    @Bean
    public JwtAuthenticationFilter authenticationJwtTokenFilter() {
        return new JwtAuthenticationFilter();
    }
    
    // Custom authentication provider that supports both encoded and plain text passwords
    @Bean
    public AuthenticationProvider customAuthenticationProvider() {
        return new AuthenticationProvider() {
            @Override
            public Authentication authenticate(Authentication authentication) throws AuthenticationException {
                String username = authentication.getName();
                String password = authentication.getCredentials().toString();
                
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                // First check if the password is already encoded (starts with $2a$)
                if (userDetails.getPassword().startsWith("$2a$")) {
                    // Password is encoded, use BCrypt to check
                    if (passwordEncoder().matches(password, userDetails.getPassword())) {
                        return new UsernamePasswordAuthenticationToken(
                                userDetails, password, userDetails.getAuthorities());
                    }
                } else {
                    // Password is plain text, use direct comparison
                    if (password.equals(userDetails.getPassword())) {
                        return new UsernamePasswordAuthenticationToken(
                                userDetails, password, userDetails.getAuthorities());
                    }
                }
                
                throw new BadCredentialsException("Invalid password");
            }

            @Override
            public boolean supports(Class<?> authentication) {
                return authentication.equals(UsernamePasswordAuthenticationToken.class);
            }
        };
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> 
                // Enable JWT security
                auth.requestMatchers("/api/users/signin").permitAll()
                    .requestMatchers("/api/users/signup").permitAll()
                    .requestMatchers("/api/users/login").permitAll() 
                    .requestMatchers("/api/oauth/**").permitAll()
                    .requestMatchers("/api/auth/**").permitAll() 
                    .requestMatchers("/api/public/**").permitAll()
                    .requestMatchers("/api/comments").permitAll()
                    .requestMatchers("/api/comments/post/**").permitAll()  // Allow access to get comments by post
                    .requestMatchers("/api/posts/**").permitAll()
                    .requestMatchers(HttpMethod.PATCH,"/api/monetization/**").permitAll()

                    .requestMatchers(HttpMethod.GET, "/api/progress").permitAll() // Allow public access to GET progress updates
                    .requestMatchers(HttpMethod.GET, "/api/progress/templates").permitAll() // Allow public access to GET progress templates
                    .requestMatchers(HttpMethod.GET, "/api/progress/{progressId}/comments").permitAll() // Allow public access to GET progress comments
                    .requestMatchers(HttpMethod.GET, "/api/progress/*/comments").permitAll() // Alternative pattern for path variables
                    // Secure admin endpoints - only accessible to users with ROLE_ADMIN
                    .requestMatchers("/api/admin/**").hasRole("ADMIN")
                    .anyRequest().authenticated()
            );
        
        http.authenticationProvider(customAuthenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
} 