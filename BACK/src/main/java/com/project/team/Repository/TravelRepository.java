package com.project.team.Repository;

import com.project.team.Entity.Travel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelRepository extends JpaRepository<Travel, Long> {
    List<Travel> findByUser_Email(String email);
}