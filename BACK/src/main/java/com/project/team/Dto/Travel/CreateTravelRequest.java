package com.project.team.Dto.Travel;

import com.project.team.Entity.Accommodation;
import com.project.team.Entity.Attraction;
import com.project.team.Entity.Restaurant;

public record CreateTravelRequest(String countryCode, Accommodation accommodation, Attraction attraction, Restaurant restaurant) {
}
