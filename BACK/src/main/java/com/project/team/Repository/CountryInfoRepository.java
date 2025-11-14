package com.project.team.Repository;

import com.project.team.Entity.CountryInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CountryInfoRepository extends JpaRepository<CountryInfo, String> {
    Optional<CountryInfo> findByCountryName(String countryName);
}
