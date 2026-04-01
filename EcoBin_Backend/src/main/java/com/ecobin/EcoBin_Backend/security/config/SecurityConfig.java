package com.ecobin.EcoBin_Backend.security.config;

import com.ecobin.EcoBin_Backend.security.jwt.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable());
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        http.authorizeHttpRequests(auth -> auth
                // Auth module
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/signup").permitAll()

                // User module
                .requestMatchers("/api/users/me").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/users/**").hasRole("ADMIN")

                // Category module
                .requestMatchers(HttpMethod.GET, "/api/categories").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/categories/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/categories/**").hasRole("ADMIN")

                // Waste Request module
                .requestMatchers(HttpMethod.POST, "/api/requests").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/requests/my").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/requests/my/export").hasAnyRole("USER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/requests/*/status").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/requests/*/pickup").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/requests").hasRole("ADMIN")

                // Rule engine module
                .requestMatchers(HttpMethod.GET, "/api/rules/preview").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/rules/**").hasRole("ADMIN")

                // Scan history module
                .requestMatchers("/api/scan/**").hasAnyRole("USER", "ADMIN")
                .requestMatchers("/api/scans/**").hasAnyRole("USER", "ADMIN")

                .requestMatchers("/api/stats/me").hasAnyRole("USER", "ADMIN")

                .requestMatchers("/api/stats/leaderboard").hasAnyRole("USER", "ADMIN")

                .anyRequest().authenticated());
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOrigin("http://localhost:3000"); // React frontend
        config.addAllowedOrigin("http://localhost:5173"); // Vite frontend default port
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
