package com.project.team.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "cuisine_type")
    private String cuisineType;

    private String address;

    @Column(name = "price_level")
    private String priceLevel;

    @Column(name = "business_hours")
    private String businessHours;

    private Double rating;

    private Double latitude;

    private Double longitude;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_id")
    @JsonIgnore
    private Travel travel;

    //==연관관계 편의 메서드==//
//    public void setTravel(Travel travel) {
//        this.travel = travel;
//        if (travel != null) {
//            travel.getRestaurants().add(this);
//        }
//    }
}
