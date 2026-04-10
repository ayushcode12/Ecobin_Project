package com.ecobin.EcoBin_Backend.service;

import com.ecobin.EcoBin_Backend.exception.AiServiceUnavailableException;
import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiModelService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final Object startLock = new Object();

    @Value("${ecobin.ai.base-url:http://localhost:5000}")
    private String aiBaseUrl;

    @Value("${ecobin.ai.auto-start:true}")
    private boolean autoStart;

    @Value("${ecobin.ai.python-command:python}")
    private String pythonCommand;

    @Value("${ecobin.ai.model-workdir:../Model}")
    private String modelWorkingDirectory;

    @Value("${ecobin.ai.startup-timeout-ms:30000}")
    private long startupTimeoutMs;

    private volatile Process modelProcess;

    public AiPredictionResult predictImage(String imagePayload) {
        ensureServiceIsReady();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> requestData = new HashMap<>();
        requestData.put("image", imagePayload);

        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestData, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(aiBaseUrl + "/predict", requestEntity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (!response.getStatusCode().is2xxSuccessful() || responseBody == null || !responseBody.containsKey("prediction")) {
                throw new AiServiceUnavailableException("AI model returned an invalid response.");
            }

            return new AiPredictionResult(
                    String.valueOf(responseBody.get("prediction")),
                    responseBody.get("confidence") == null ? null : Double.parseDouble(String.valueOf(responseBody.get("confidence"))),
                    responseBody.get("rawLabel") == null ? null : String.valueOf(responseBody.get("rawLabel"))
            );
        } catch (ResourceAccessException exception) {
            throw new AiServiceUnavailableException(
                    "AI model service is not reachable at " + aiBaseUrl + ". Please restart the backend and model service.",
                    exception
            );
        } catch (AiServiceUnavailableException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new AiServiceUnavailableException("AI model prediction failed: " + exception.getMessage(), exception);
        }
    }

    private void ensureServiceIsReady() {
        if (isHealthy()) {
            return;
        }

        if (!autoStart) {
            throw new AiServiceUnavailableException(
                    "AI model service is offline. Start the Python model server at " + aiBaseUrl + " and try again."
            );
        }

        synchronized (startLock) {
            if (isHealthy()) {
                return;
            }

            startModelProcessIfNeeded();
            waitUntilHealthy();
        }
    }

    private boolean isHealthy() {
        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(aiBaseUrl + "/health", Map.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception exception) {
            return false;
        }
    }

    private void startModelProcessIfNeeded() {
        if (modelProcess != null && modelProcess.isAlive()) {
            return;
        }

        Path workingDirectory = resolveModelWorkingDirectory();
        Path appPath = workingDirectory.resolve("app.py");
        if (!Files.exists(appPath)) {
            throw new AiServiceUnavailableException("Could not find Python model app at " + appPath + ".");
        }

        IOException lastFailure = null;

        for (List<String> command : buildCandidateCommands()) {
            try {
                ProcessBuilder processBuilder = new ProcessBuilder(command);
                processBuilder.directory(workingDirectory.toFile());
                processBuilder.redirectErrorStream(true);
                processBuilder.redirectOutput(ProcessBuilder.Redirect.appendTo(workingDirectory.resolve("ai-model.log").toFile()));
                modelProcess = processBuilder.start();
                return;
            } catch (IOException exception) {
                lastFailure = exception;
            }
        }

        throw new AiServiceUnavailableException(
                "Failed to start the AI model service automatically. Checked command '" + pythonCommand + "'.",
                lastFailure
        );
    }

    private List<List<String>> buildCandidateCommands() {
        List<List<String>> commands = new ArrayList<>();
        List<String> configuredCommand = tokenizeCommand(pythonCommand);

        if (!configuredCommand.isEmpty()) {
            List<String> fullCommand = new ArrayList<>(configuredCommand);
            fullCommand.add("app.py");
            commands.add(fullCommand);
        }

        if (configuredCommand.isEmpty() || !"py".equalsIgnoreCase(configuredCommand.get(0))) {
            commands.add(List.of("py", "-3", "app.py"));
        }

        if (configuredCommand.isEmpty() || !"python".equalsIgnoreCase(configuredCommand.get(0))) {
            commands.add(List.of("python", "app.py"));
        }

        return commands;
    }

    private List<String> tokenizeCommand(String command) {
        String trimmed = command == null ? "" : command.trim();
        if (trimmed.isEmpty()) {
            return List.of();
        }

        return List.of(trimmed.split("\\s+"));
    }

    private Path resolveModelWorkingDirectory() {
        Path configuredPath = Path.of(modelWorkingDirectory);
        if (configuredPath.isAbsolute()) {
            return configuredPath.normalize();
        }

        String userDir = System.getProperty("user.dir");
        return Path.of(userDir).resolve(configuredPath).normalize();
    }

    private void waitUntilHealthy() {
        Instant deadline = Instant.now().plusMillis(startupTimeoutMs);

        while (Instant.now().isBefore(deadline)) {
            if (isHealthy()) {
                return;
            }

            if (modelProcess != null && !modelProcess.isAlive()) {
                throw new AiServiceUnavailableException("AI model process exited before it became ready.");
            }

            try {
                Thread.sleep(500);
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
                throw new AiServiceUnavailableException("Interrupted while waiting for AI model service startup.", exception);
            }
        }

        throw new AiServiceUnavailableException(
                "AI model service did not become ready within " + Duration.ofMillis(startupTimeoutMs).toSeconds() + " seconds."
        );
    }

    @PreDestroy
    public void shutdownModelProcess() {
        if (modelProcess != null && modelProcess.isAlive()) {
            modelProcess.destroy();
        }
    }

    public record AiPredictionResult(String prediction, Double confidence, String rawLabel) {
    }
}
