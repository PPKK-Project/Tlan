package com.project.team.Entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "travel_plans")
public class TravelPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_id")
    private Travel travel;

    @Column
    @JoinColumn(name = "place_id")
    private Place place;

    @Column
    private int sequence;

    @Column
    private String memo;

    @Column
    private int dayNumber;

    public TravelPlan(Travel travel, int sequence, String memo,int dayNumber) {
        this.travel = travel;
        this.sequence = sequence;
        this.memo = memo;
        this.dayNumber = dayNumber;
    }
}
