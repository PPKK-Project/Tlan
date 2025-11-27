package com.project.team.Service;

import com.project.team.Dto.Travel.CreateTravelRequest;
import com.project.team.Dto.Travel.TravelResponse;
import com.project.team.Dto.Travel.UpdateTravelRequest;
import com.project.team.Entity.Travel;
import com.project.team.Entity.TravelPermission;
import com.project.team.Entity.User;
import com.project.team.Entity.flight.Airport;
import com.project.team.Exception.AccessDeniedException;
import com.project.team.Repository.AirportRepository;
import com.project.team.Repository.TravelPermissionRepository;
import com.project.team.Repository.TravelRepository;
import com.project.team.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TravelService {
    private final TravelPermissionRepository travelPermissionRepository;
    private final TravelRepository travelRepository;
    private final UserRepository userRepository;
    private final AirportRepository airportRepository;

    // 새로운 여행 계획 생성
    public ResponseEntity<Travel> createTravel(CreateTravelRequest dto, Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + principal.getName()));

        Travel travel = new Travel(
                user,
                dto.countryCode(),
                dto.title(),
                dto.startDate(),
                dto.endDate(),
                dto.travelerCount(),
                dto.departure()
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

        // countryCode(예: NRT)를 이용해 Airport 엔티티 조회 -> city(예: 도쿄) 추출
        String destinationCity = airportRepository.findById(travel.getCountryCode())
                .map(Airport::getCity) // Airport 객체가 있으면 getCity() 호출
                .orElse(travel.getCountryCode()); // 없으면 코드를 그대로 반환 (혹은 "알 수 없음" 등)

        return new TravelResponse(travel, destinationCity);
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

        Travel savedTravel = travelRepository.save(travel);

        String destinationCity = airportRepository.findById(savedTravel.getCountryCode())
                .map(Airport::getCity)
                .orElse(savedTravel.getCountryCode());

        return new TravelResponse(savedTravel, destinationCity);
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
        if (!travel.getUser().getId().equals(user.getId()) && !travelPermissionRepository.existsByTravelIdAndUserId(travelId, user.getId())) {
            throw new AccessDeniedException("You do not have permission to access this travel.");
        }
        return travel;
    }
}
