package com.project.team.Repository;

import com.project.team.Entity.API.Embassy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmbassyRepository extends JpaRepository<Embassy, Long> {
    Optional<Embassy> findByEmbassyCd(String embassyCd);
    Optional<Embassy> findByEmbassyKorNm(String embassyKorNm);
}