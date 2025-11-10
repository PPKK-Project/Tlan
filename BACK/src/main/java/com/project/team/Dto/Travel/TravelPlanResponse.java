package com.project.team.Dto.Travel;

import com.project.team.Entity.TravelPlan;

public record TravelPlanResponse(
        Long planId,
        int dayNumber,
        int sequence,
        String memo,
        PlaceResponse place
) {
    // TravelPlan 엔티티를 인자로 받는 생성자
    public TravelPlanResponse(TravelPlan travelPlan) {
        this(travelPlan.getId(), travelPlan.getDayNumber(), travelPlan.getSequence(), travelPlan.getMemo(), new PlaceResponse(travelPlan.getPlace()));
    }
}
