package com.project.team.Service;

import com.project.team.Dto.Travel.CreateTravelRequest;
import com.project.team.Entity.Travel;
import com.project.team.Entity.User;
import com.project.team.Repository.TravelRepository;
import com.project.team.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TravelService {

    private final TravelRepository travelRepository;
    private final UserRepository userRepository;

    // 새로운 여행 계획 생성
    public ResponseEntity<Travel> createTravel(CreateTravelRequest dto, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + principal.getName()));

        return ResponseEntity.ok(travelRepository.save(new Travel(user, dto.countryCode(), dto.title())));
    }

    // 사용자가 접근 가능한 모든 여행 목록 조회
    public ResponseEntity<List<Travel>> getTravels(Principal principal) {
        return ResponseEntity.ok(travelRepository.findByUser_Email(principal.getName()));
    }

//    // 특정 여행의 상세 정보 조회
//    public ResponseEntity<?> getTravelDetails(Long travelId) {
//        return null;
//    }

    // 특정 여행의 기본 정보 수정
    public ResponseEntity<Void> putTravel(Long travelId, String title) {
        // travelId로 여행정보 가져옴
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new IllegalArgumentException("해당 여행이 존재하지 않습니다. id=" + travelId));

        travel.setTitle(title);
        travelRepository.save(travel);

        return ResponseEntity.ok().build();
    }

    // 특정 여행 삭제
    public ResponseEntity<?> deleteTravel(Long travelId) {
        return null;
    }
}
