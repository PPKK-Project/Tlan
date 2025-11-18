package com.project.team.Entity;

import jakarta.persistence.*;
import lombok.*;
import com.project.team.Entity.flight.Flight;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Travel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    private String countryCode;
    private String title;
    private LocalDate startDate;
    private LocalDate endDate;

    @OneToMany(mappedBy = "travel", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<TravelPlan> travelPlans = new ArrayList<>();

    @OneToMany(mappedBy = "travel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Chat> chat = new ArrayList<>();

    // Flight와의 일대일 관계 설정
    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Flight flight;

    public Travel(User user, String countryCode, String title) {
        this.user = user;
        this.countryCode = countryCode;
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}
