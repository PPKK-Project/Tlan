package com.project.team.Entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

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

    @Column(name = "country_code")
    private String countryCode;

    @OneToMany(mappedBy = "travel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attraction> attractions = new ArrayList<>();

    @OneToMany(mappedBy = "travel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Accommodation> accommodations = new ArrayList<>();

    @OneToMany(mappedBy = "travel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Restaurant> restaurants = new ArrayList<>();

    public Travel(User user, String countryCode) {
        this.user = user;
        this.countryCode = countryCode;
    }
    
    // 편하게 추가할 수 있게 한번에 추가하는 메서드
    public void addData(Accommodation acc, Attraction att, Restaurant res) {
        if (acc != null) {
            this.accommodations.add(acc);
            acc.setTravel(this); // 연관관계 설정
        }
        if (att != null) {
            this.attractions.add(att);
            att.setTravel(this); // 연관관계 설정
        }
        if (res != null) {
            this.restaurants.add(res);
            res.setTravel(this); // 연관관계 설정
        }
    }
}
