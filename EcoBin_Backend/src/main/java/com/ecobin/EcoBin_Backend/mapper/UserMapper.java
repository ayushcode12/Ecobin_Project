package com.ecobin.EcoBin_Backend.mapper;

import com.ecobin.EcoBin_Backend.dto.CreateUserRequestDTO;
import com.ecobin.EcoBin_Backend.dto.UserResponseDTO;
import com.ecobin.EcoBin_Backend.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponseDTO toDto(User user){
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    public User toEntity(CreateUserRequestDTO req){
        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(req.getPassword());
        user.setRole(req.getRole());
        return user;
    }

}
