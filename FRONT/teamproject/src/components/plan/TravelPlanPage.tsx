import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios, { AxiosRequestConfig } from "axios";
import {
  AddPlanRequest,
  PlaceFilter,
  PlaceSearchResult,
  TravelPlan,
} from "../../util/types";
// import Header from "../main/Header"; // 헤더는 일단 주석 처리
import PlanSidebar from "./PlanSidebar";
import PlanMap from "./PlanMap";
import ItinerarySummary from "./ItinerarySummary";

type AlertType = "success" | "info" | "warning" | "error";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Google Places API의 types 배열을 보고 카테고리를 추론합니다.
const getCategoryFromTypes = (
  types: string[]
): "숙소" | "관광지" | "음식점" => {
  if (types.includes("lodging")) return "숙소";
  if (types.includes("tourist_attraction")) return "관광지";
  if (types.includes("restaurant") || types.includes("food")) return "음식점";
  return "관광지"; // 기본값
};

// 헬퍼 함수: Google Places API의 photos 배열로 이미지 URL을 생성합니다.
const getPhotoUrl = (photos: any[]): string => {
  if (photos && photos.length > 0) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`;
  }
  // 이미지가 없을 때 기본 이미지
  return "https://placehold.co/100x100/cccccc/ffffff?text=No+Image";
};

/**
 * signin.tsx의 로직을 기반으로 인증 헤더를 포함하는 Axios 설정을 반환합니다.
 */
const getAxiosConfig = (): AxiosRequestConfig => {
  const jwtToken = localStorage.getItem("jwt");
  const token = jwtToken ? jwtToken.replace("Bearer ", "") : "";

  return {
    headers: {
      Authorization: token || "",
      "Content-Type": "application/json",
    },
  };
};

function TravelPlanPage() {
  // URL에서 /travels/:travelId 의 'travelId' 값을 가져옴
  const { travelId } = useParams<{ travelId: string }>();

  // 현재 여행의 모든 일정 (백엔드에서 받아옴)
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [allPlaces, setAllPlaces] = useState<PlaceSearchResult[]>([]);
  const [filter, setFilter] = useState<PlaceFilter>("all");
  const [filteredPlaces, setFilteredPlaces] = useState<PlaceSearchResult[]>([]);

  // 현재 선택된 날짜 (1일차, 2일차...)
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 UI를 위한 state
  const [destinationInput, setDestinationInput] = useState("제주도");
  const [searchQuery, setSearchQuery] = useState("제주도");
  const [searchLocation, setSearchLocation] = useState({
    lat: 33.361665,
    lon: 126.520412,
  });

  // 스낵바 state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: AlertType;
  }>({
    open: false,
    message: "",
    type: "success",
  });

  // 🔹 토스트 자동 닫기 (3초 후)
  useEffect(() => {
    if (!snackbar.open) return;
    const timer = window.setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 3000);
    return () => clearTimeout(timer);
  }, [snackbar.open]);

  useEffect(() => {
    if (filter === "all") {
      setFilteredPlaces(allPlaces);
    } else {
      setFilteredPlaces(allPlaces.filter(place => place.category === filter));
    }
  }, [filter, allPlaces]);

  const handleSearch = useCallback(async () => {
    if (!destinationInput) {
      setError("검색어를 입력해주세요.");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const geocodeResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: destinationInput,
            key: GOOGLE_MAPS_API_KEY,
          },
        }
      );

      if (
        !geocodeResponse.data ||
        geocodeResponse.data.status !== "OK" ||
        geocodeResponse.data.results.length === 0
      ) {
        throw new Error("장소의 좌표를 찾을 수 없습니다.");
      }

      const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

      setSearchLocation({ lat, lon: lng });
      setSearchQuery(destinationInput);

    } catch (err: any) {
      console.error("좌표 검색 실패: ", err);
      setError(err.message || "장소의 좌표를 불러오는 데 실패했습니다.");
      setAllPlaces([]); // 에러 발생 시 장소 목록 비우기
      setIsLoading(false); // 좌표 검색 실패 시 로딩 즉시 종료
    }
  }, [destinationInput]);

  // 여행 일정 불러오기 (Mount 시)
  useEffect(() => {
    if (!travelId) return;

    const fetchPlans = async () => {
      setError(null);
      try {
        const response = await axios.get<TravelPlan[]>(
          `${API_BASE_URL}/travels/${travelId}/plans`,
          getAxiosConfig()
        );
        setPlans(response.data);
      } catch (err) {
        console.error("여행 일정 로딩 실패: ", err);
        setError("일정을 불러오는 데 실패했습니다.");
      }
    };
    fetchPlans();
  }, [travelId]);

  // 장소 불러오는 훅
  useEffect(() => {
    if (!travelId) return;

    const fetchPlaces = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const placesResponse = await axios.get(`${API_BASE_URL}/api/place`, {
          params: {
            keyword: `${searchQuery} 숙소 관광지 음식점`,
            lat: searchLocation.lat,
            lon: searchLocation.lon,
            radius: "30000",
            type: "point_of_interest",
          },
          headers: getAxiosConfig().headers,
        });

        if (placesResponse.data && placesResponse.data.results) {
          const parsedPlaces: PlaceSearchResult[] =
            placesResponse.data.results.map((item: any) => ({
              placeId: item.place_id,
              name: item.name,
              address: item.vicinity,
              category: getCategoryFromTypes(item.types),
              rating: item.rating || 0,
              reviewCount: item.user_ratings_total || 0,
              imageUrl: getPhotoUrl(item.photos),
              latitude: item.geometry.location.lat,
              longitude: item.geometry.location.lng,
            }));
          setAllPlaces(parsedPlaces);
        } else {
          setAllPlaces([]);
        }
      } catch (err) {
        console.error("장소 검색 실패:", err);
        setError("장소를 불러오는 데 실패했습니다.");
        setAllPlaces([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();

  }, [travelId, searchLocation, searchQuery]);

  // [이벤트 핸들러]
  // 1. 일정 추가 (사이드바와 지도 둘 다 가능)
  const handleAddPlan = async (place: PlaceSearchResult) => {
    if (!travelId) return;

    // DTO에 맞게 sequence 계산 (현재 선택된 날짜의 일정 개수 + 1)
    const newSequence =
      plans.filter(p => p.dayNumber === selectedDay).length + 1;

    const newPlanRequest: AddPlanRequest = {
      googlePlaceId: place.placeId,
      name: place.name,
      address: place.address,
      type: place.category, // '숙소', '관광지' 등
      latitude: place.latitude,
      longitude: place.longitude,
      // --- 일정 정보 ---
      dayNumber: selectedDay,
      sequence: newSequence,
      memo: "", // TODO: 메모 입력 UI 추가 시, 해당 값 사용. 없으면 빈 문자열
    };

    try {
      const response = await axios.post<TravelPlan>(
        `${API_BASE_URL}/travels/${travelId}/plans`,
        newPlanRequest,
        getAxiosConfig()
      );

      // 성공 시, 반환된 새 plan 객체를 plans 상태에 추가
      setPlans(prevPlans => [...prevPlans, response.data]);

      // 일정 추가시 알림 스낵바
      setSnackbar({
        open: true,
        message: `${place.name} 일정이 추가되었습니다.`,
        type: "success",
      });

    } catch (err) {
      console.error("일정 추가 실패:", err);
      setSnackbar({
        open: true,
        message: "일정 추가에 실패했습니다. 다시 시도해주세요.",
        type: "error",
      });
    }
  };

  // 2. 일정 삭제
  const handleDeletePlan = async (planId: number) => {

    if (!travelId) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/travels/${travelId}/plans/${planId}`,
        getAxiosConfig()
      );

      // 성공 시, plans 상태에서 해당 plan 제거
      setPlans(prevPlans =>
        prevPlans.filter(plan => plan.planId !== planId)
      );

      setSnackbar({
        open: true,
        message: "일정이 삭제되었습니다.",
        type: "warning",
      });

    } catch (err) {
      console.error("일정 삭제 실패:", err);
      setSnackbar({
        open: true,
        message: "일정 삭제에 실패했습니다.",
        type: "error",
      });
    }
  };

  // [렌더링]
  return (
    <div className="flex flex-col h-screen">
      {/* <Header /> 헤더랑 검색바가 겹치니까 검색창이 작동 안 해서 일단 주석처리해둠 */}

      {/* 검색 바 */}
      <div className="bg-white p-4 border-b shadow-sm">
        <div className="flex gap-4 items-center max-w-6xl mx-auto">
          <input
            type="text"
            placeholder="출발지"
            defaultValue="서울"
            className="border p-2 rounded-md"
          />
          <input
            type="text"
            placeholder="도착지"
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
            className="border p-2 rounded-md"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <input
            type="date"
            defaultValue="2025-01-15"
            className="border p-2 rounded-md"
          />
          <input
            type="date"
            defaultValue="2025-01-18"
            className="border p-2 rounded-md"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="bg-blue-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? "검색 중..." : "검색"}
          </button>
        </div>
        {error && (
          <div className="max-w-6xl mx-auto mt-2 text-red-600 text-sm text-center">
            {error}
          </div>
        )}
      </div>

      {/* 메인 콘텐츠 (3단) */}
      <div className="flex-1 flex overflow-hidden">
        {/* 1. 왼쪽 사이드바 (일정 추가) */}
        <aside className="w-1/3 max-w-md bg-white border-r overflow-y-auto shadow-lg z-10">
          <PlanSidebar
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            availablePlaces={filteredPlaces}
            addedGooglePlaceIds={plans.map(p => p.place.googlePlaceId)}
            onAddPlace={handleAddPlan}
            onDeletePlace={handleDeletePlan} // 사이드바에서도 삭제 가능하도록
            filter={filter} // 현재 필터 상태 전달
            onFilterChange={setFilter} // 필터 변경 함수 전달
          />
        </aside>

        {/* 2. 중앙 지도 */}
        <main className="flex-1 relative">
          <PlanMap
            // 현재 선택된 날짜의 일정만 필터링하여 지도에 표시
            plans={plans.filter(plan => plan.dayNumber === selectedDay)}
            searchPlaces={filteredPlaces} // 필터링된 장소 목록 전달
            onAddPlace={handleAddPlan} // 지도 마커에서 일정 추가
            mapCenter={{ lat: searchLocation.lat, lng: searchLocation.lon }}
          />
        </main>

        {/* 3. 오른쪽 요약 (일정 목록) */}
        <aside className="w-1/4 max-w-sm bg-white border-l overflow-y-auto shadow-lg z-10">
          <ItinerarySummary
            plans={plans} // 전체 일정 전달
            onDeletePlan={handleDeletePlan}
            setNotify={setSnackbar}
          />
        </aside>
      </div>
      {snackbar.open && (
        <div className={`toast toast-${snackbar.type}`}>
          {snackbar.message}
        </div>
      )}
    </div>
  );
}

export default TravelPlanPage;
