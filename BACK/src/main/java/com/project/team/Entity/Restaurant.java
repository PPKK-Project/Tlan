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
    @JoinColumn(name = "place_id")
    @JsonIgnore
    private Place place;

    private String phoneNumber;

    private Boolean openNow;

    @Column(length = 512)
    private String openingHoursText;

    public Restaurant(Place place, String phoneNumber) {
        this.place = place;
        this.phoneNumber = phoneNumber;
    }
}