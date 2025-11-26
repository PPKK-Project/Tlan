package com.project.team.Controller.flight;

import com.project.team.Entity.flight.Airport;
import com.project.team.Repository.AirportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class AirportController {
    private final AirportRepository airportRepository;

    @GetMapping("/airports")
    public List<Airport> getAllAirports() {
        return airportRepository.findAll();
    }
}
