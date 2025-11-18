package com.project.team.Service.flight;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.CollectionType;
import com.project.team.Dto.flight.FlightData;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;
import java.io.IOException;


@Service
public class PythonExecutorService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<FlightData> executeFlightCrawler(
            String departureAp,
            String arrivalAp,
            String departDate,
            String returnDate,
            int adultCount
    ) {
        // 1. 실제 비즈니스 로직을 Callable로 정의합니다.
        String pythonExecutable = "C:\\Users\\rlack\\AppData\\Local\\Python\\pythoncore-3.14-64\\python.exe";
        String scriptPath = "C:\\Users\\rlack\\Desktop\\Code\\TeamProject\\FRONT\\teamproject\\src\\util\\flight.py";
        ProcessBuilder processBuilder = new ProcessBuilder(
                pythonExecutable,
                "-X", "utf8",
                scriptPath,
                departureAp,
                arrivalAp,
                departDate,
                returnDate,
                String.valueOf(adultCount)
        );

        try {
            Process process = processBuilder.start();
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), "UTF-8"));
            BufferedReader errorReader = new BufferedReader(
                    new InputStreamReader(process.getErrorStream(), "UTF-8"));
            StringBuilder jsonOutput = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) jsonOutput.append(line);
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                String errorLine;
                StringBuilder errorOutput = new StringBuilder();
                while ((errorLine = errorReader.readLine()) != null) errorOutput.append(errorLine).append("\n");
                throw new RuntimeException("Python script failed with exit code " + exitCode + ". Error: " + errorOutput.toString());
            }
            if (!StringUtils.hasText(jsonOutput.toString())) {
                return List.of();
            }
            CollectionType listType = objectMapper.getTypeFactory().constructCollectionType(List.class, FlightData.class);
            return objectMapper.readValue(jsonOutput.toString(), listType);
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Error executing Python script or parsing JSON", e); // 기존 예외는 유지
        }
    }
}
