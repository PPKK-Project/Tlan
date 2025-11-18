package com.project.team.Entity.flight;

import com.project.team.Entity.Travel;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Flight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String airline;

    private int priceKRW;

    private String departureTime;

    private String arrivalTime;

    private String returnDepartureTime;

    private String returnArrivalTime;

    @OneToOne(mappedBy = "flight")
    @JoinColumn(name = "travel_id")
    private Travel travel;

    public Flight(String airline, int priceKRW, String departureTime, String arrivalTime, String returnDepartureTime, String returnArrivalTime, Travel travel) {
        this.airline = airline;
        this.priceKRW = priceKRW;
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
        this.returnDepartureTime = returnDepartureTime;
        this.returnArrivalTime = returnArrivalTime;
        this.travel = travel;
    }
}