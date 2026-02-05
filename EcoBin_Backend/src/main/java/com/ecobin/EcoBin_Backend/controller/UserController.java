package com.ecobin.EcoBin_Backend.controller;

import com.ecobin.EcoBin_Backend.dto.CreateUserRequestDTO;
import com.ecobin.EcoBin_Backend.dto.UserResponseDTO;
import com.ecobin.EcoBin_Backend.mapper.UserMapper;
import com.ecobin.EcoBin_Backend.model.User;
import com.ecobin.EcoBin_Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserMapper userMapper;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO createUserByAdmin(@RequestBody CreateUserRequestDTO dto){
        User savedUser = userService.createUserByAdmin(dto);
        return userMapper.toDto(savedUser);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponseDTO> getAllUsers(){
        return userService.getAllUsers()
                .stream()
                .map(userMapper::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO getUserById(@PathVariable Long id){
        return userMapper.toDto(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponseDTO updateUser(@PathVariable Long id, @RequestBody User updatedUser){
        User saved = userService.updateUser(id, updatedUser);
        return userMapper.toDto(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable Long id){
        userService.deleteUser(id);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public UserResponseDTO getMyProfile(Authentication authentication){
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return userMapper.toDto(user);
    }

}
