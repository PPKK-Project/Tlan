package com.project.team.Dto.Travel;

import com.project.team.Entity.Place;

public record PlaceResponse(
        Long placeId,
        String name,
        String address,
        String type,
        Double latitude,
        Double longitude
) {
    public PlaceResponse(Place place) {
        this(place.getId(), place.getName(), place.getAddress(), place.getType(), place.getLatitude(), place.getLongitude());
    }
}
