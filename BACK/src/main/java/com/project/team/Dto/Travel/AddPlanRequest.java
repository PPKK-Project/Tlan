package com.project.team.Dto.Travel;

public record AddPlanRequest(
        String googlePlaceId,
        String name,
        String address,
        String type,
        Double latitude,
        Double longitude,
        // --- 일정 정보 ---
        int dayNumber,
        int sequence,
        String memo
) {}