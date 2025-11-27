package com.project.team.Controller;

import com.project.team.Dto.Travel.TravelResponse;
import com.project.team.Dto.TravelPermission.TravelPermissionCreateRequest;
import com.project.team.Dto.TravelPermission.TravelPermissionResponse;
import com.project.team.Dto.TravelPermission.TravelPermissionUpdateRequest;
import com.project.team.Service.TravelPermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@Tag(name = "여행 공유 API", description = "여행 공유 및 사용자 권한을 관리합니다.")
@RestController
@RequiredArgsConstructor
public class TravelPermissionController {

    private final TravelPermissionService permissionService;

    /**
     * 여행에 다른 사용자 초대 및 권한 부여
     */
    @Operation(summary = "여행에 사용자 초대", description = "특정 여행에 다른 사용자를 초대하고 권한을 부여합니다. (소유자만 가능)")
    @PostMapping("/travels/{travelId}/share") // Corrected URL mapping
    public ResponseEntity<Void> createPermission(
            @Parameter(description = "초대할 여행의 ID", required = true) @PathVariable Long travelId,
            @RequestBody TravelPermissionCreateRequest request) {
        // ... implementation
        permissionService.createPermission(travelId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * 해당 여행의 모든 공유 권한 목록 조회
     */
    @Operation(summary = "공유된 사용자 목록 조회", description = "특정 여행에 공유된 모든 사용자와 그들의 권한을 조회합니다.")
    @GetMapping("/travels/{travelId}/share")
    public ResponseEntity<List<TravelPermissionResponse>> getPermissions(
            @Parameter(description = "조회할 여행의 ID", required = true) @PathVariable Long travelId) {

        List<TravelPermissionResponse> responseList = permissionService.getPermissions(travelId);
        return ResponseEntity.ok(responseList);
    }


    /**
     * 특정 사용자 권한(역할) 수정 (OWNER만 가능)
     */
    @Operation(summary = "사용자 권한 수정", description = "특정 사용자의 여행 공유 권한을 수정합니다. (소유자만 가능)")
    @PutMapping("/travels/{travelId}/share/{permissionId}")
    public ResponseEntity<TravelPermissionResponse> updatePermission(
            @Parameter(description = "권한을 수정할 여행의 ID", required = true) @PathVariable Long travelId,
            @Parameter(description = "수정할 권한의 ID", required = true) @PathVariable Long permissionId,
            @RequestBody TravelPermissionUpdateRequest request) {

        TravelPermissionResponse response = permissionService.updatePermission(travelId, permissionId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 사용자 권한 삭제 (공유 취소)
     */
    @Operation(summary = "사용자 공유 취소", description = "특정 사용자의 여행 공유를 취소합니다. (소유자만 가능)")
    @DeleteMapping("/travels/{travelId}/share/{permissionId}")
    public ResponseEntity<Void> deletePermission(
            @Parameter(description = "공유를 취소할 여행의 ID", required = true) @PathVariable Long travelId,
            @Parameter(description = "삭제할 권한의 ID", required = true) @PathVariable Long permissionId) {

        permissionService.deletePermission(travelId, permissionId);
        return ResponseEntity.noContent().build(); // 204 No Content
    }

    @GetMapping("/travels/share")
    public ResponseEntity<List<TravelResponse>> getSharedTravels(Principal principal) {
        return ResponseEntity.ok(permissionService.getSharedTravels(principal));
    }

    @GetMapping("/travels/{travelId}/role")
    public ResponseEntity<String> getTravelRole(@PathVariable Long travelId, Principal principal) {
        return ResponseEntity.ok(permissionService.getTravelRole(travelId, principal));
    }
}