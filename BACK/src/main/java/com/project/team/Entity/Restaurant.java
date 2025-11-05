package com.project.team.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_id")
    @JsonIgnore
    private Travel travel;

    private String name;

    private String address;

    private String phoneNumber;

    private Double latitude;

    private Double longitude;

    public Restaurant(Travel travel, String name, String address, String phoneNumber, Double latitude, Double longitude) {
        this.travel = travel;
        this.name = name;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    //==연관관계 편의 메서드==//
//    public void setTravel(Travel travel) {
//        this.travel = travel;
//        if (travel != null) {
//            travel.getRestaurants().add(this);
//        }
//    }
}
