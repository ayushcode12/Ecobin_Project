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

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserStatsRepository userStatsRepository;

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
        userRepository.deleteById(id);
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
