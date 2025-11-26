package com.project.team.Entity.flight;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Airport {

    @Id
    private String code; // 공항 코드 (PK) - 예: NRT, KIX
    private String name; // 표시될 공항 이름 - 예: 도쿄/나리타
    private String country;
    private String city;
}