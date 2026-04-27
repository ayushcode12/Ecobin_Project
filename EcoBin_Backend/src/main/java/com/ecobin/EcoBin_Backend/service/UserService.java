package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.dto.CreateUserRequestDTO;
import com.ecobin.EcoBin_Backend.model.User;
import com.ecobin.EcoBin_Backend.model.UserStats;
import com.ecobin.EcoBin_Backend.repository.UserRepository;
import com.ecobin.EcoBin_Backend.repository.UserStatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserStatsRepository userStatsRepository;

    @Autowired
    private LoggingService loggingService;

    private String getAdminEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "system";
    }

    public User createUser(User user){
        User savedUser = userRepository.save(user);
        ensureUserStats(savedUser);
        return savedUser;
    }

    public List<User> getAllUsers(){
        return userRepository.findAll();
    }

    public User getUserById(Long id){
        return userRepository.findById(id).orElse(null);
    }

    public User updateUser(Long id, User updatedUser) {
        User user = getUserById(id);
        user.setName(updatedUser.getName());
        user.setEmail(updatedUser.getEmail());
        user.setPassword(updatedUser.getPassword());
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        String adminEmail = getAdminEmail();
        User target = userRepository.findById(id).orElse(null);
        userRepository.deleteById(id);
        if (target != null) {
            loggingService.logAction(adminEmail, "DELETE_USER", target.getEmail(), "Deleted user account");
        }
    }

    public User updateUserStatus(Long id, boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(enabled);
        User saved = userRepository.save(user);
        loggingService.logAction(getAdminEmail(), "UPDATE_USER_STATUS", user.getEmail(), "Set enabled=" + enabled);
        return saved;
    }

    public void resetUserScore(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserStats stats = userStatsRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("User stats not found"));

        stats.setTotalPoints(0);
        stats.setCurrentStreak(0);
        stats.setLastSubmissionDate(null);
        userStatsRepository.save(stats);
        loggingService.logAction(getAdminEmail(), "RESET_SCORE", user.getEmail(), "Reset total points to 0");
    }

    public User createUserByAdmin(CreateUserRequestDTO dto){

        if(userRepository.findByEmail(dto.getEmail()).isPresent()){
            throw new RuntimeException("Email already exist");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());

        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        String assignRole = (dto.getRole() == null || dto.getRole().isBlank())
                ? "ROLE_USER"
                : dto.getRole();

        user.setRole(assignRole);

        User savedUser = userRepository.save(user);
        ensureUserStats(savedUser);
        return savedUser;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Find")) ;
    }

    public User updateDisplayName(String email, String requestedName) {
        User user = getUserByEmail(email);

        String sanitizedName = requestedName == null ? "" : requestedName.trim().replaceAll("\\s+", " ");
        if (sanitizedName.length() < 2) {
            throw new IllegalArgumentException("Name must be at least 2 characters long.");
        }

        if (sanitizedName.length() > 30) {
            throw new IllegalArgumentException("Name must be 30 characters or fewer.");
        }

        user.setName(sanitizedName);
        return userRepository.save(user);
    }

    private void ensureUserStats(User user) {
        if (userStatsRepository.findByUser(user).isPresent()) {
            return;
        }

        UserStats userStats = new UserStats();
        userStats.setUser(user);
        userStats.setTotalPoints(0);
        userStats.setCurrentStreak(0);
        userStats.setLastSubmissionDate(null);
        userStatsRepository.save(userStats);
    }
}
