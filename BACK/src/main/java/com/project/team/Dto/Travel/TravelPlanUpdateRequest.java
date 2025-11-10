package com.project.team.Dto.Travel;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record TravelPlanUpdateRequest(
        @NotNull(message = "일차는 필수입니다.") @Positive(message = "일차는 1 이상이어야 합니다.")
        Integer dayNumber,

        @NotNull(message = "순서는 필수입니다.") @Positive(message = "순서는 1 이상이어야 합니다.")
        Integer sequence,

        String memo
) {}