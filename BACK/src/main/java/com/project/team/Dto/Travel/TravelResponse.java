package com.project.team.Dto.Travel;

import com.project.team.Entity.Travel;

import java.time.LocalDate;

public record TravelResponse(Long id,
                             String title,
                             LocalDate startDate,
                             LocalDate endDate,
                             String countryCode,
                             String destinationCity,
                             String departure,
                             Integer travelerCount) {

    public TravelResponse(Travel travel, String destinationCity) {
        this(
                travel.getId(),
                travel.getTitle(),
                travel.getStartDate(),
                travel.getEndDate(),
                travel.getCountryCode(),
                destinationCity,
                travel.getDeparture(),
                travel.getTravelerCount()

        );
    }
}