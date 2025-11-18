package com.project.team.Dto.flight;

public record FlightSearchRequest(
        String depAp,
        String arrAp,
        String depDate,
        String retDate,
        int adult
) {}