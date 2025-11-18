package com.project.team.Repository;

import com.project.team.Entity.flight.Flight;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FlightRepository extends JpaRepository<Flight, Long> {
    Optional<Flight> findByTravelId(Long travelId);
}
