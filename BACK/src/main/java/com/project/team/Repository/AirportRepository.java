package com.project.team.Repository;

import com.project.team.Entity.flight.Airport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AirportRepository extends JpaRepository<Airport, String> {
}
