package com.project.team.Controller.flight;

import com.project.team.Entity.flight.Flight;
import com.project.team.Dto.flight.FlightData;
import com.project.team.Dto.flight.FlightSearchRequest;
import com.project.team.Service.flight.FlightService;
import com.project.team.Service.flight.PythonExecutorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "항공편 API", description = "항공편 검색 및 저장을 처리합니다.")
@RestController
@RequiredArgsConstructor
public class FlightController {
    private final PythonExecutorService pythonExecutorService;
    private final FlightService flightService;
    
    @Operation(summary = "항공편 검색", description = "주어진 조건으로 항공편을 검색하여 결과를 반환합니다.")
    @GetMapping("/flight")
    public List<FlightData> searchFlights(FlightSearchRequest dtp) {
        return pythonExecutorService.executeFlightCrawler(
                dtp.depAp(),
                dtp.arrAp(),
                dtp.depDate(),
                dtp.retDate(),
                dtp.adult()
        );
    }
    
    @Operation(summary = "여행에 항공편 추가", description = "특정 여행(Travel)에 선택한 항공편 정보를 저장합니다.")
    @PostMapping("/flight/{travelId}")
    public Flight addFlight(
            @Parameter(description = "항공편을 추가할 여행의 ID") @PathVariable Long travelId,
            @RequestBody FlightData dto) {
        return flightService.addFlight(travelId,dto);
    }
}
