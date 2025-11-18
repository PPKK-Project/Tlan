package com.project.team.Controller;

import com.project.team.Dto.TravelPermission.TravelPermissionCreateRequest;
import com.project.team.Dto.TravelPermission.TravelPermissionResponse;
import com.project.team.Dto.TravelPermission.TravelPermissionUpdateRequest;
import com.project.team.Service.TravelPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TravelPermissionController {

    private final TravelPermissionService permissionService;

    /**
     * 여행에 다른 사용자 초대 및 권한 부여
     */
    @PostMapping("/travels/{travelId}/share") // Corrected URL mapping
    public ResponseEntity<Void> createPermission(
            @PathVariable Long travelId, // Use @PathVariable to capture the ID
            @RequestBody TravelPermissionCreateRequest request) {
        // ... implementation
        permissionService.createPermission(travelId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * 해당 여행의 모든 공유 권한 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<TravelPermissionResponse>> getPermissions(
            @PathVariable Long travelId) {

        List<TravelPermissionResponse> responseList = permissionService.getPermissions(travelId);
        return ResponseEntity.ok(responseList);
    }

    /**
     * 특정 사용자 권한(역할) 수정 (OWNER만 가능)
     */
    @PutMapping("/{permissionId}")
    public ResponseEntity<TravelPermissionResponse> updatePermission(
            @PathVariable Long travelId,
            @PathVariable Long permissionId,
            @RequestBody TravelPermissionUpdateRequest request) {

        TravelPermissionResponse response = permissionService.updatePermission(travelId, permissionId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 사용자 권한 삭제 (공유 취소)
     */
    @DeleteMapping("/{permissionId}")
    public ResponseEntity<Void> deletePermission(
            @PathVariable Long travelId,
            @PathVariable Long permissionId) {

        permissionService.deletePermission(travelId, permissionId);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}