package com.project.team.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class CurrencyRate {

    @Id
    @Column(name = "currency_code", nullable = false, updatable = false)
    private String currencyCode;

    private Double rate;

    public CurrencyRate(String currencyCode, Double rate) {
        this.currencyCode = currencyCode;
        this.rate = rate;
    }
}