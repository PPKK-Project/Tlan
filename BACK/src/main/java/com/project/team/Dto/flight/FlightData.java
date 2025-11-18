package com.project.team.Dto.flight;

public record FlightData(
        String airline,
        int priceKRW,
        String departureTime,
        String arrivalTime,
        String returnDepartureTime,
        String returnArrivalTime
) {}

//    {
//        "airline": "티웨이항공",
//        "priceKRW": 469400,
//        "departureTime": "15:30",
//        "arrivalTime": "17:55",
//        "returnDepartureTime": "12:50",
//        "returnArrivalTime": "15:35"
//    }