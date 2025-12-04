package com.project.team.Repository;

import com.project.team.Entity.Travel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

public interface TravelRepository extends JpaRepository<Travel, Long> {
    List<Travel> findByUser_Email(String email);

    @Query(value = """
            SELECT c.country_code 
            FROM travel as t 
            JOIN airport as a 
                ON a.code = t.country_code 
            JOIN country_info as c 
                ON c.country_name = a.country
            WHERE t.id = :travelId
            """,
    nativeQuery = true)
    Optional<String> findCountryCodeByTravelId(@Param("travelId") Long travelId);
}