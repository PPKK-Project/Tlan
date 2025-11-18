package com.project.team.Controller.flight;

import com.project.team.Entity.flight.Flight;
import com.project.team.Dto.flight.FlightData;
import com.project.team.Dto.flight.FlightSearchRequest;
import com.project.team.Service.flight.FlightService;
import com.project.team.Service.flight.PythonExecutorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class FlightController {
    private final PythonExecutorService pythonExecutorService;
    private final FlightService flightService;
    
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
    
    @PostMapping("/flight/{travelId}")
    public Flight addFlight(
            @PathVariable Long travelId,
            @RequestBody FlightData dto) {
        return flightService.addFlight(travelId,dto);
    }
}
