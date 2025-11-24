package com.project.team.Repository;

import com.project.team.Entity.TravelPermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TravelPermissionRepository extends JpaRepository<TravelPermission, Long> {
    List<TravelPermission> findByTravelId(Long travelId);
    Optional<TravelPermission> findByTravelIdAndUserId(Long travelId, Long userId);
    Optional<TravelPermission> findByTravelIdAndId(Long travelId, Long permissionId);
    List<TravelPermission> findByUserId(Long userId);
}
