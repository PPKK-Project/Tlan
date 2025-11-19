package com.project.team.Service.flight;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.CollectionType;
import com.project.team.Dto.flight.FlightData;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStreamReader;
import java.util.List;
import java.io.IOException;
import java.io.InputStream;


@Service
public class PythonExecutorService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    @Value("${python-path}")
    private String pythonExecutable;

    @jakarta.annotation.PostConstruct
    public void debugPaths() {
        System.out.println(">>> pythonExecutable = [" + pythonExecutable + "]");
        System.out.println(">>> scriptPath      = [" + scriptPath + "]");
    }

    public List<FlightData> executeFlightCrawler(
            String departureAp,
            String arrivalAp,
            String departDate,
            String returnDate,
            int adultCount
    ) {
        try {
            // 1. 프로젝트 리소스 폴더에서 스크립트 파일을 찾습니다.
            String scriptPath = getScriptPathFromResources("scripts/flight.py");

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

    private String getScriptPathFromResources(String resourceName) throws IOException {
        // 리소스 파일을 읽기 위한 InputStream을 가져옵니다.
        InputStream inputStream = new ClassPathResource(resourceName).getInputStream();

        // 스크립트를 실행할 수 있도록 임시 파일로 복사합니다.
        File tempFile = File.createTempFile("flight_script", ".py");
        tempFile.deleteOnExit(); // 프로그램 종료 시 임시 파일 자동 삭제

        try (FileOutputStream out = new FileOutputStream(tempFile)) {
            inputStream.transferTo(out);
        }

        // 임시 파일의 절대 경로를 반환합니다.
        return tempFile.getAbsolutePath();
    }
}
