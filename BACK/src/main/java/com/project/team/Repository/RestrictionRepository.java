package com.project.team.Repository;

import com.project.team.Entity.Restriction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RestrictionRepository extends JpaRepository<Restriction, Long> {
}