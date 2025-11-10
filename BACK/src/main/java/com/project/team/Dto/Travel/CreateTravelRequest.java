package com.project.team.Dto.Travel;

import com.project.team.Entity.User;

public record CreateTravelRequest(User user, String countryCode, String title) {
}
