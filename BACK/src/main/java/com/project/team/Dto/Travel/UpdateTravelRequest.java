package com.project.team.Dto.Travel;

import java.time.LocalDate;

public record UpdateTravelRequest(String title,
                                  LocalDate startDate,
                                  LocalDate endDate) {}
