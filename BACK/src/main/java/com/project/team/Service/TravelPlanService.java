package com.project.team.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.team.Dto.Travel.AddPlanRequest;
import com.project.team.Dto.Travel.TravelPlanResponse;
import com.project.team.Dto.Travel.TravelPlanUpdateRequest;
import com.project.team.Entity.*;
import com.project.team.Exception.AccessDeniedException;
import com.project.team.Exception.ResourceNotFoundException;
import com.project.team.Repository.*;
import com.project.team.Service.API.PlaceApiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional // findOrCreatePlace에서 save 해야하므로 (readOnly = true) 제거했습니다.
public class TravelPlanService {

    private final TravelPlanRepository travelPlanRepository;
    private final TravelRepository travelRepository; // TravelRepository 주입
    private final PlaceRepository placeRepository; // PlaceRepository 주입

    private final AccommodationRepository accommodationRepository;
    private final AttractionRepository attractionRepository;
    private final RestaurantRepository restaurantRepository;

    private final PlaceApiService placeApiService;

    // 데이터 갱신 주기 30일
    private static final long REFRESH_DAYS_LIMIT = 30;

    private Travel findTravelAndValidateOwner(Long travelId, User user) {
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel not found with id: " + travelId));
        if (!travel.getUser().getEmail().equals(user.getEmail())) {
            throw new AccessDeniedException("You are not the owner of this travel plan.");
        }
        return travel;
    }


    /**
     * 특정 여행의 전체 일정 목록 조회
     *
     * @param travelId 조회할 여행의 ID
     * @param user     현재 로그인한 사용자 (권한 확인용)
     * @return TravelPlanResponse 리스트
     */
    public List<TravelPlanResponse> getTravelPlans(Long travelId, User user) {
        // 1. 여행 정보 조회 및 소유주 확인
        Travel travel = findTravelAndValidateOwner(travelId, user);

        // 2. Repository를 통해 정렬된 일정 목록 조회
        List<TravelPlan> plans = travelPlanRepository.findByTravelIdOrderByDayNumberAscSequenceAsc(travelId);

        // 3. Entity 리스트를 DTO 리스트로 변환하여 반환
        return plans.stream()
                .map(TravelPlanResponse::new)
                .collect(Collectors.toList());
    }

    /**
     * 특정 일정 항목의 세부 정보 수정
     *
     * @param travelId 여행 ID
     * @param planId   수정할 일정 ID
     * @param request  수정할 정보 DTO
     * @param user     현재 로그인한 사용자
     * @return 수정된 일정 정보
     */
    @Transactional
    public TravelPlanResponse updateTravelPlan(Long travelId, Long planId, TravelPlanUpdateRequest request, User user) {
        // 1. 여행 소유주 확인
        findTravelAndValidateOwner(travelId, user);

        // 2. 수정할 일정 조회
        TravelPlan travelPlan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel Plan not found with id: " + planId));

        // 3. 해당 일정이 올바른 여행에 속해 있는지 확인
        if (!travelPlan.getTravel().getId().equals(travelId)) {
            throw new AccessDeniedException("This plan does not belong to the specified travel.");
        }

        // 4. 엔티티 데이터 수정 (변경 감지로 인해 자동 UPDATE)
        travelPlan.setDayNumber(request.dayNumber());
        travelPlan.setSequence(request.sequence());
        travelPlan.setMemo(request.memo());

        return new TravelPlanResponse(travelPlan);
    }


    @Transactional
    public void deleteTravelPlan(Long travelId, Long planId, User user) {
        // 1. 여행 소유주 확인
        findTravelAndValidateOwner(travelId, user);

        // 2. 삭제할 일정 조회
        TravelPlan travelPlan = travelPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel Plan not found with id: " + planId));

        if (!travelPlan.getTravel().getId().equals(travelId)) {
            throw new AccessDeniedException("This plan does not belong to the specified travel.");

        }
        travelPlanRepository.delete(travelPlan);
    }

    @Transactional
    public TravelPlanResponse addPlan(Long travelId, AddPlanRequest request, User user) {
        // 1. 여행(Travel) 조회
        Travel travel = travelRepository.findById(travelId)
                .orElseThrow(() -> new ResourceNotFoundException("Travel not found with id: " + travelId));

        // 2. 권한 확인 (여행 생성자만 추가 가능, 추후 TravelPermission 확인 로직 추가 가능)
        if (!travel.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You do not have permission to add a plan to this travel.");
        }

        // 3. 장소(Place) 찾기 또는 생성 (findOrCreate)
        Place place = findOrCreatePlace(request);

        // 4. 새로운 TravelPlan 생성 및 저장
        TravelPlan newPlan = new TravelPlan(travel, request.sequence(), request.memo(), request.dayNumber(), place);

        return new TravelPlanResponse(travelPlanRepository.save(newPlan));
    }

    /**
     * Google Place ID를 기준으로 장소를 찾거나, 없으면 새로 생성하여 반환합니다.
     * 장소 생성 시, 타입에 맞는 상세 테이블(Accommodation 등)에도 함께 저장합니다.
     */
    private Place findOrCreatePlace(AddPlanRequest request) {
        // 1. Google Place ID로 DB에서 장소를 검색합니다.
        return placeRepository.findByGooglePlaceId(request.googlePlaceId())
                .map(existingPlace -> {
                    // 데이터가 갱신된 지 30일이 넘었는지 확인
                    boolean isStale = existingPlace.getUpdatedAt() == null || ChronoUnit.DAYS.between(existingPlace.getUpdatedAt(),
                            LocalDateTime.now()) > REFRESH_DAYS_LIMIT;
                    if (isStale) {
                        log.info("Place 데이터가 최신 버전이 아닙니다. ({}). 최신화 중...", existingPlace.getName());
                        // 30일이 지났으니 API로 최신 정보를 가져와 덮어쓴다.
                        return refreshPlaceDetails(existingPlace);
                    }
                    // 30일 이내이므로, DB 데이터 재사용 (API 호출 X)
                    log.debug("Place 데이터가 최신 버전입니다. ({}). DB에 저장된 정보를 씁니다.", existingPlace.getName());
                    return existingPlace;
                })
                .orElseGet(() -> {
                    // --- 2. 장소가 DB에 없을 경우 (Create) ---
                    log.info("DB에 없는 장소입니다. 새로 저장하겠습니다 : {}", request.name());
                    return createNewPlace(request);
                });
    }

    /**
     * 새 장소를 생성하고 상세 정보(전화번호 등)를 저장
     */
    private Place createNewPlace(AddPlanRequest request) {
        JsonNode details = placeApiService.fetchPlaceDetails(request.googlePlaceId()).block();

        Place newPlace = new Place();
        newPlace.setGooglePlaceId(request.googlePlaceId());
        newPlace.setName(request.name());
        newPlace.setAddress(request.address());
        newPlace.setType(request.type());
        newPlace.setLatitude(request.latitude());
        newPlace.setLongitude(request.longitude());
        Place savedPlace = placeRepository.save(newPlace);

        if(details != null){
            saveOrUpdateDetailsByType(savedPlace, request.type(), details);
        }
        return savedPlace;
    }

    /**
     *  기존 장소의 상세 정보를 API로 갱신
     */
    private Place refreshPlaceDetails(Place placeToUpdate) {
        JsonNode details = placeApiService.fetchPlaceDetails(placeToUpdate.getGooglePlaceId()).block();
        // 상세 정보 갱신 (전화번호, 영업시간 등)
        if(details != null) {
            saveOrUpdateDetailsByType(placeToUpdate, placeToUpdate.getType(), details);
        }
        return placeRepository.save(placeToUpdate);
    }

    /**
     * API 응답을 파싱하여 타입별 상세 테이블에 저장/갱신하는 메서드
     */
    private void saveOrUpdateDetailsByType(Place place, String type, JsonNode detailsNode) {
        if(!detailsNode.has("result")) {
            log.warn("Place Details API에 'result' 필드가 없습니다 : {}", place.getGooglePlaceId());
            return;
        }
        JsonNode result = detailsNode.get("result");

        // 영구 폐업 여부 확인
        if(result.has("permanently_closed") && result.get("permanently_closed").asBoolean(false)) {
            log.warn("{} ({})는 폐업했습니다.", place.getName(), place.getGooglePlaceId());
            // TODO: place 엔티티에 'isActive = false' 같은 플래그를 두어 비활성화 처리
        }
        String phoneNumber = result.has("formatted_phone_number") ?
                result.get("formatted_phone_number").asText(null) : null;

        Boolean openNow = null;
        String openingHoursText = null;

        if(result.has("opening_hours")) {
            JsonNode hoursNode = result.get("opening_hours");
            if(hoursNode.has("open_now")) {
                openNow = hoursNode.get("open_now").asBoolean();
            }
            // "월요일: ...", "화요일: ..." 배열을 하나의 문자열로 합칩니다.
            if(hoursNode.has("weekday_text") && hoursNode.get("weekday_text").isArray()) {
                openingHoursText = StreamSupport.stream(hoursNode.get("weekday_text").spliterator(), false)
                        .map(JsonNode::asText)
                        .collect(Collectors.joining("\n"));
            }
        }

        // --- 숙소, 관광지, 음식점 타입별로 갱신 ---
        switch (type) {
            case "숙소":
                place.getAccommodations().clear(); // 기존 정보 삭제
                Accommodation accommodation = new Accommodation(place, phoneNumber);
                place.getAccommodations().add(accommodation);
                break;
            case "관광지":
                place.getAttractions().clear();
                Attraction attraction = new Attraction();
                attraction.setPlace(place);
                attraction.setOpenNow(openNow);
                attraction.setOpeningHoursText(openingHoursText);
                place.getAttractions().add(attraction);
                break;
            case "음식점":
                place.getRestaurants().clear();
                Restaurant restaurant = new Restaurant(place, phoneNumber);
                restaurant.setOpenNow(openNow);
                restaurant.setOpeningHoursText(openingHoursText);
                place.getRestaurants().add(restaurant);
                break;

            default:
                log.warn("올바른 타입(숙소, 관광지, 음식점)이 아닙니다.: {}", type);
        }
    }
}