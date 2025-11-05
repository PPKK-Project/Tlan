package com.project.team.Service;

import com.project.team.Dto.Travel.CreateTravelRequest;
import com.project.team.Entity.*;
import com.project.team.Exception.AccessDeniedException;
import com.project.team.Exception.ResourceNotFoundException;
import com.project.team.Repository.TravelRepository;
import com.project.team.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TravelService {
    private final TravelRepository travelRepository;
    private final UserRepository userRepository;
    /**
     * ID를 통해 Travel을 찾고 접근한 유저가 해당 Travel에 접근 권한이 있는지 확인하는 함수
     * @param id
     * @param principal
     * @return Travel
     */
    public Travel validTravel(Long id, Principal principal) {
        Travel travel = travelRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Not found Resource"));
        if(!travel.getUser().getEmail().equals(principal.getName())) {
            throw new AccessDeniedException("해당 리소스에 접근할 권한이 없습니다.");
        }
        return travel;
    }

//  service
    @Transactional
    public ResponseEntity<Travel> createTravel(User user, CreateTravelRequest dto) {
        Travel travel = new Travel(user, dto.countryCode());
        travel.addData(dto.accommodation(), dto.attraction(), dto.restaurant());
        return ResponseEntity.ok(travelRepository.save(travel));
    }

    public ResponseEntity<List<Travel>> getTravel(Principal principal) {
        return ResponseEntity.ok(travelRepository.findByUser_Email(principal.getName()));
    }

    public ResponseEntity<Travel> getTravelById(Long id, Principal principal) {
//        Travel travel = travelRepository.findById(id)
//                .orElseThrow(()->new ResourceNotFoundException("Not found Resource"));
//        if(!travel.getUser().getEmail().equals(principal.getName())) {
//            throw new AccessDeniedException("해당 리소스에 접근할 권한이 없습니다.");
//        }
//        return ResponseEntity.ok(travel);
        return ResponseEntity.ok(validTravel(id, principal));
    }


    @Transactional
    public ResponseEntity<?> deleteTravelById(Long id, Principal principal) {
//        Travel travel = travelRepository.findById(id)
//                .orElseThrow(()->new ResourceNotFoundException("Not found Resource"));
//        if(!travel.getUser().getEmail().equals(principal.getName())) {
//            throw new AccessDeniedException("해당 리소스에 접근할 권한이 없습니다.");
//        }
//        travelRepository.delete(travel);
//        return ResponseEntity.noContent().build();
        travelRepository.delete(validTravel(id, principal));
        return ResponseEntity.noContent().build();
    }



}
