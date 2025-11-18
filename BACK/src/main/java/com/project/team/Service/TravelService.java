package com.project.team.Service;

import com.project.team.Dto.Travel.CreateTravelRequest;
import com.project.team.Dto.Travel.TravelResponse;
import com.project.team.Dto.Travel.UpdateTravelRequest;
import com.project.team.Entity.Travel;
import com.project.team.Entity.User;
import com.project.team.Exception.AccessDeniedException;
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

        Travel travel = new Travel(
                user,
                dto.countryCode(),
                dto.title(),
                dto.startDate(),
                dto.endDate()
        );

        return ResponseEntity.ok(travelRepository.save(travel));
    }

    // 사용자가 접근 가능한 모든 여행 목록 조회
    public ResponseEntity<List<Travel>> getTravels(Principal principal) {
        return ResponseEntity.ok(travelRepository.findByUser_Email(principal.getName()));
    }

    // 특정 여행의 상세 정보 조회
    public TravelResponse getTravelDetails(Long travelId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        Travel travel = findTravelAndValidateOwner(travelId, user);
        return new TravelResponse(travel);
    }

    // 특정 여행 정보 수정 (제목, 날짜)
    @Transactional
    public TravelResponse updateTravel(Long travelId, UpdateTravelRequest request, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // 소유자 검증
        Travel travel = findTravelAndValidateOwner(travelId, user);

        // DTO에 값이 있는 경우에만 업데이트 (제목만 바꾸고 싶으면 날짜는 null로 보내면 됨)
        if (request.title() != null) travel.setTitle(request.title());
        if (request.startDate() != null) travel.setStartDate(request.startDate());
        if (request.endDate() != null) travel.setEndDate(request.endDate());

        return new TravelResponse(travelRepository.save(travel));
    }

    // 특정 여행 삭제
    public void deleteTravel(Long travelId, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + principal.getName()));
        Travel travel = findTravelAndValidateOwner(travelId, user);
        travelRepository.delete(travel);
    }

    // 소유자 검증 메서드
    private Travel findTravelAndValidateOwner(Long travelId, User user) {
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new IllegalArgumentException("해당 여행이 존재하지 않습니다. id=" + travelId));

        if (!travel.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to access this travel.");
        }
        return travel;
    }
}
