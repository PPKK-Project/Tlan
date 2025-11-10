package com.project.team.Controller;

import com.project.team.Dto.Travel.AddPlanRequest;
import com.project.team.Entity.Place;
import com.project.team.Entity.Travel;
import com.project.team.Entity.TravelPlan;
import com.project.team.Exception.AccessDeniedException;
import com.project.team.Exception.ResourceNotFoundException;
import com.project.team.Repository.PlaceRepository;
import com.project.team.Repository.TravelPlanRepository;
import com.project.team.Repository.TravelRepository;
import com.project.team.Service.TravelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class TravelController {

}
