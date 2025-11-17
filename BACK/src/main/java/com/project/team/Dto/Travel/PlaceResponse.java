package com.project.team.Dto.Travel;

import com.project.team.Entity.Place;

public record PlaceResponse(
        Long placeId,
        String googlePlaceId,
        String name,
        String address,
        String type,
        Double latitude,
        Double longitude,
        String phoneNumber,
        Boolean openNow,
        String openingHours
) {
    public PlaceResponse(Place place) {
        this(
                place.getId(),
                place.getGooglePlaceId(),
                place.getName(),
                place.getAddress(),
                place.getType(),
                place.getLatitude(),
                place.getLongitude(),
                extractPhoneNumber(place),
                extractOpenNow(place),
                extractOpeningHours(place)
        );
    }


    /**
     * 장소 유형에 따라 전화번호를 추출합니다.
     */
    private static String extractPhoneNumber(Place place) {
        if ("숙소".equals(place.getType()) && !place.getAccommodations().isEmpty()) {
            return place.getAccommodations().get(0).getPhoneNumber();
        }
        if ("음식점".equals(place.getType()) && !place.getRestaurants().isEmpty()) {
            return place.getRestaurants().get(0).getPhoneNumber();
        }
        return null;
    }

    /**
     * 장소 유형에 따라 현재 영업 여부를 추출합니다.
     */
    private static Boolean extractOpenNow(Place place) {
        if ("관광지".equals(place.getType()) && !place.getAttractions().isEmpty()) {
            return place.getAttractions().get(0).getOpenNow();
        }
        if ("음식점".equals(place.getType()) && !place.getRestaurants().isEmpty()) {
            return place.getRestaurants().get(0).getOpenNow();
        }
        return null; // 숙소는 openNow 정보가 없음
    }

    /**
     * 장소 유형에 따라 영업 시간 텍스트를 추출합니다.
     */
    private static String extractOpeningHours(Place place) {
        if ("관광지".equals(place.getType()) && !place.getAttractions().isEmpty()) {
            return place.getAttractions().get(0).getOpeningHoursText();
        }
        if ("음식점".equals(place.getType()) && !place.getRestaurants().isEmpty()) {
            return place.getRestaurants().get(0).getOpeningHoursText();
        }
        return null;
    }
}