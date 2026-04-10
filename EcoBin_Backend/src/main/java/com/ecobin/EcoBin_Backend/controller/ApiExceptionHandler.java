package com.ecobin.EcoBin_Backend.controller;

import com.ecobin.EcoBin_Backend.exception.AiServiceUnavailableException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException exception) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", "BAD_REQUEST",
                        "message", exception.getMessage()
                ));
    }

    @ExceptionHandler(AiServiceUnavailableException.class)
    public ResponseEntity<Map<String, Object>> handleAiServiceUnavailable(AiServiceUnavailableException exception) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "error", "AI_SERVICE_UNAVAILABLE",
                        "message", exception.getMessage()
                ));
    }
}
