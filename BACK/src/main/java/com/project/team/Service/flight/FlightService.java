package com.project.team.Service.flight;

import com.project.team.Controller.flight.FlightController;
import com.project.team.Dto.flight.FlightData;
import com.project.team.Entity.Travel;
import com.project.team.Entity.flight.Flight;
import com.project.team.Exception.ResourceNotFoundException;
import com.project.team.Repository.FlightRepository;
import com.project.team.Repository.TravelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FlightService {
    private final FlightRepository flightRepository;
    private final TravelRepository travelRepository;

    @Transactional
    public Flight addFlight(Long travelId, FlightData dto) {
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(()-> new ResourceNotFoundException("해당 여행을 찾을 수 없습니다."));
        Flight flight = flightRepository.save(new Flight(
                        dto.airline(),
                        dto.priceKRW(),
                        dto.departureTime(),
                        dto.arrivalTime(),
                        dto.returnDepartureTime(),
                        dto.returnArrivalTime(),
                        travel
                ));
        travel.setFlight(flight);
        return flight;
    }
}
