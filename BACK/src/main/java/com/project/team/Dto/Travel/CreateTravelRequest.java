package com.project.team.Dto.Travel;

import com.project.team.Entity.User;

import java.time.LocalDate;

public record CreateTravelRequest(User user,
                                  String countryCode,
                                  String title,
                                  LocalDate startDate,
                                  LocalDate endDate
) {}
