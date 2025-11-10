package com.project.team.Dto.Travel;

public record AddPlanRequest(
        Long placeId, int dayNumber, int sequence, String memo) {}