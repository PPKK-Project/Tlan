package com.project.team.Repository;

import com.project.team.Entity.CurrencyRate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CurrencyRateRepository extends JpaRepository<CurrencyRate, String> {
}