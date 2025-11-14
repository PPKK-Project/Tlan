package com.project.team.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@NoArgsConstructor
public class CountryInfo {
    @Id
    @Column(name="country_code", nullable = false, updatable = false)
    private String countryCode;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="currency_code")
    private CurrencyRate currencyRate;

    private String countryName;

    public CountryInfo(String countryCode, String countryName) {
        this.countryCode = countryCode;
        this.countryName = countryName;
    }
}
