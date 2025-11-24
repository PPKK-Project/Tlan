package com.project.team.Service;

import com.project.team.Dto.Travel.TravelResponse;
import com.project.team.Dto.TravelPermission.TravelPermissionCreateRequest;
import com.project.team.Dto.TravelPermission.TravelPermissionResponse;
import com.project.team.Dto.TravelPermission.TravelPermissionUpdateRequest;
import com.project.team.Entity.Travel;
import com.project.team.Entity.TravelPermission;
import com.project.team.Entity.User;
import com.project.team.Exception.BadRequestException;
import com.project.team.Exception.PermissionDeniedException;
import com.project.team.Exception.ResourceNotFoundException;
import com.project.team.Permission.PermissionRole;
import com.project.team.Repository.TravelPermissionRepository;
import com.project.team.Repository.TravelRepository;
import com.project.team.Repository.UserRepository;
import com.project.team.Util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TravelPermissionService {

    private final TravelRepository travelRepository;
    private final UserRepository userRepository;
    private final TravelPermissionRepository permissionRepository;

    /**
     * [POST] 여행에 사용자 초대 및 권한 부여
     */
    @Transactional
    public TravelPermissionResponse createPermission(Long travelId, TravelPermissionCreateRequest request) {
        // SecurityUtil에서 String email을 가져옵니다.
        String currentUserEmail = SecurityUtil.getCurrentUserEmail();

        // 1. 소유자(Owner)인지 확인 (이메일로 비교)
        Travel travel = findTravelById(travelId);
        checkIsOwner(travel, currentUserEmail);

        // 2. 유효한 역할인지 확인 (OWNER는 부여 불가)
        String requestedRole = request.role();
        if (!PermissionRole.isValidRole(requestedRole) || requestedRole.equals(PermissionRole.ROLE_OWNER.name())) {
            throw new BadRequestException("유효하지 않은 역할입니다. 'ROLE_EDITOR' 또는 'ROLE_VIEWER'만 부여할 수 있습니다.");
        }

        // 3. 초대할 사용자 찾기
        System.out.println(request.email());
        User userToInvite = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("해당 이메일의 사용자를 찾을 수 없습니다: " + request.email()));
        System.out.println("유저찾기성공");
        // 4. 본인을 초대/권한 변경할 수 없음 (이메일로 비교)
        if (userToInvite.getEmail().equals(currentUserEmail)) {
            throw new BadRequestException("자기 자신에게 권한을 부여할 수 없습니다.");
        }

        // 5. 이미 권한이 있는지 확인
        permissionRepository.findByTravelIdAndUserId(travelId, userToInvite.getId()).ifPresent(perm -> {
            throw new BadRequestException("이미 해당 여행에 권한이 부여된 사용자입니다.");
        });

        // 6. 권한 생성 및 저장
        TravelPermission newPermission = new TravelPermission();
        newPermission.setTravel(travel);
        newPermission.setUser(userToInvite);
        newPermission.setRole(requestedRole);

        TravelPermission savedPermission = permissionRepository.save(newPermission);

        return mapPermissionToResponse(savedPermission);
    }

    /**
     * [GET] 해당 여행의 모든 공유 권한 목록 조회
     */
    public List<TravelPermissionResponse> getPermissions(Long travelId) {
        String currentUserEmail = SecurityUtil.getCurrentUserEmail();

        // 1. 여행 정보 조회
        Travel travel = findTravelById(travelId);

        // 2. 접근 권한 확인 (소유자 또는 초대된 사용자인지)
        checkHasAccess(travel, currentUserEmail);

        // 3. 소유자(Owner) 정보를 DTO 리스트의 첫 번째 항목으로 추가
        TravelPermissionResponse ownerResponse = new TravelPermissionResponse(
                null, // 소유자는 Permission 테이블에 ID가 없음
                travel.getUser().getId(),
                travel.getUser().getNickname(),
                travel.getUser().getEmail(),
                PermissionRole.ROLE_OWNER.name()
        );

        // 4. TravelPermission 테이블에서 나머지 초대된 사용자 목록 조회
        List<TravelPermissionResponse> sharedUsersResponses = permissionRepository.findByTravelId(travelId).stream()
                .map(this::mapPermissionToResponse)
                .toList();

        // 5. 소유자 + 초대 사용자 목록 병합
        return Stream.concat(Stream.of(ownerResponse), sharedUsersResponses.stream())
                .toList();
    }

    /**
     * [PUT] 특정 사용자 권한(역할) 수정
     */
    @Transactional
    public TravelPermissionResponse updatePermission(Long travelId, Long permissionId, TravelPermissionUpdateRequest request) {
        String currentUserEmail = SecurityUtil.getCurrentUserEmail();

        // 1. 소유자(Owner)인지 확인 (이메일로 비교)
        Travel travel = findTravelById(travelId);
        checkIsOwner(travel, currentUserEmail);

        // 2. 수정할 권한 정보 조회
        TravelPermission permission = permissionRepository.findByTravelIdAndId(travelId, permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 권한 정보를 찾을 수 없습니다."));

        // 3. 유효한 역할인지 확인 (OWNER로 변경 불가)
        String newRole = request.role();
        if (!PermissionRole.isValidRole(newRole) || newRole.equals(PermissionRole.ROLE_OWNER.name())) {
            throw new BadRequestException("유효하지 않은 역할입니다. 'ROLE_EDITOR' 또는 'ROLE_VIEWER'로만 수정할 수 있습니다.");
        }

        // 4. 역할 변경 및 저장
        permission.setRole(newRole);
        TravelPermission updatedPermission = permissionRepository.save(permission);

        return mapPermissionToResponse(updatedPermission);
    }

    /**
     * [DELETE] 특정 사용자 권한 삭제 (공유 취소)
     */
    @Transactional
    public void deletePermission(Long travelId, Long permissionId) {
        String currentUserEmail = SecurityUtil.getCurrentUserEmail();

        // 1. 소유자(Owner)인지 확인 (이메일로 비교)
        Travel travel = findTravelById(travelId);
        checkIsOwner(travel, currentUserEmail);

        // 2. 삭제할 권한 정보 조회
        TravelPermission permission = permissionRepository.findByTravelIdAndId(travelId, permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 권한 정보를 찾을 수 없습니다."));

        // 3. 권한 삭제
        permissionRepository.delete(permission);
    }


    // --- Helper Methods ---

    /**
     * Travel ID로 Travel 엔티티를 조회합니다. (없으면 404)
     */
    private Travel findTravelById(Long travelId) {
        return travelRepository.findById(travelId)
                .orElseThrow(() -> new ResourceNotFoundException("해당 여행을 찾을 수 없습니다. ID: " + travelId));
    }

    /**
     * 현재 사용자가 해당 여행의 소유자(Owner)인지 확인합니다. (아니면 403)
     * (소유자 = Travel 엔티티를 생성한 User)
     */
    private void checkIsOwner(Travel travel, String currentUserEmail) {
        if (!travel.getUser().getEmail().equals(currentUserEmail)) {
            throw new PermissionDeniedException("권한이 없습니다. (소유자만 가능)");
        }
    }

    /**
     * 현재 사용자가 해당 여행에 접근할 수 있는지 (소유자 또는 초대된 사용자인지) 확인합니다. (아니면 403)
     * String email로 비교합니다.
     */
    private void checkHasAccess(Travel travel, String currentUserEmail) {
        // 1. 소유자인지 확인 (이메일 비교)하고 일치하면 접근 가능
        if (travel.getUser().getEmail().equals(currentUserEmail)) {
            return;
        }

        // 2. 초대된 사용자인지 확인 (DB에서 현재 사용자 정보를 조회하여 ID로 확인)
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("현재 인증된 사용자를 DB에서 찾을 수 없습니다."));

        permissionRepository.findByTravelIdAndUserId(travel.getId(), currentUser.getId())
                .orElseThrow(() -> new PermissionDeniedException("해당 여행에 접근할 권한이 없습니다."));
    }

    /**
     * TravelPermission 엔티티를 Response DTO로 변환합니다.
     */
    private TravelPermissionResponse mapPermissionToResponse(TravelPermission permission) {
        return new TravelPermissionResponse(
                permission.getId(),
                permission.getUser().getId(),
                permission.getUser().getNickname(),
                permission.getUser().getEmail(),
                permission.getRole()
        );
    }

    /**
     * [GET] 현재 사용자가 공유받은 모든 여행 목록 조회
     */
    public List<TravelResponse> getSharedTravels(Principal principal){
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("해당 유저를 찾을 수 없습니다."));

        // 1. 현재 사용자의 ID로 모든 TravelPermission을 조회
        List<TravelPermission> permissions = permissionRepository.findByUserId(user.getId());

        // 2. 각 Permission에서 Travel 엔티티를 추출하여 TravelResponse DTO로 변환
        return permissions.stream()
                .map(TravelPermission::getTravel) // TravelPermission에서 Travel을 가져옴
                .map(TravelResponse::new)         // Travel을 TravelResponse DTO로 변환
                .collect(Collectors.toList());
    }

}