import { API_BASE_URL, getAxiosConfig, getCategoryFromTypes, getPhotoUrl, GOOGLE_MAPS_API_KEY } from './../util/planUtils';
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AddPlanRequest, PlaceFilter, PlaceSearchResult, Travel, TravelPlan, UpdateTravelRequest } from "../util/types";
import { AlertColor } from "@mui/material";

// 검색 결과로 사용할 초기 위치 (제주도)
const INITIAL_LOCATION = {
  lat: 33.361665,
  lon: 126.520412,
};

export function useTravelData(travelId: string | undefined) {
   // 1. 여행 기본 정보 (날짜 등)
  const [travelInfo, setTravelInfo] = useState<Travel | null>(null);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dates, setDates] = useState({ startDate: "", endDate: "" });

  // 2. 일정(Plan) 목록
  const [plans, setPlans] = useState<TravelPlan[]>([]);

  // 3. 장소 검색 및 필터
  const [allPlaces, setAllPlaces] = useState<PlaceSearchResult[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<PlaceSearchResult[]>([]);
  const [filter, setFilter] = useState<PlaceFilter>("all");
  const [searchQuery, setSearchQuery] = useState("제주도");
  const [searchLocation, setSearchLocation] = useState(INITIAL_LOCATION);

  // 4. UI 상태
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    type: AlertColor;
  }>({ open: false, message: "", type: "success" });

  // useMemo를 사용하여 travelInfo가 바뀔 때만 'days' 배열을 새로 계산한다.
  const days = useMemo(() => {
    if (!travelInfo?.startDate || !travelInfo?.endDate) {
      return []; // 날짜 정보가 없으면 빈 배열 반환
    }

    try {
      const start = new Date(travelInfo.startDate);
      const end = new Date(travelInfo.endDate);

      // 날짜가 유효하지 않으면 빈 배열 반환
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return [];
      }
      
      // 날짜 차이 계산 (밀리초)
      const diffTime = end.getTime() - start.getTime();
      
      // 일(days) 단위로 변환
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      // 여행 기간 (예: 1월 1일 ~ 1월 1일 = 0일 차이, 1일 여행)
      const duration = diffDays + 1;

      // [1, 2, 3, ..., duration] 배열 생성
      return Array.from({ length: duration }, (_, i) => i + 1);

    } catch (e) {
      console.error("날짜 계산 중 오류 발생:", e);
      return [];
    }
  }, [travelInfo]); // travelInfo가 변경될 때만 재계산

   // Effect: 여행 기본 정보 불러오기
  useEffect(() => {
    if(!travelId) return;
    const fetchTravelInfo = async () => {
      try {
        const res = await axios.get<Travel>(
          `${API_BASE_URL}/travels/${travelId}`,
          getAxiosConfig()
        );
        setTravelInfo(res.data);
        if(!res.data.startDate || !res.data.endDate) {
          setIsDateModalOpen(true);
        } else {
          setDates({
            startDate: res.data.startDate,
            endDate: res.data.endDate,
          });
        }
      } catch(err) {
        console.error("여행 정보 로딩 실패", err);
        setError("여행 정보를 불러오는 데 실패했습니다.");
      }
    };
    fetchTravelInfo();
  }, [travelId]);

  // Effect: 여행 일정 목록(Plans) 불러오기
useEffect(() => {
  if(!travelId) return;
  const fetchPlans = async () => {
    try {
      const response = await axios.get<TravelPlan[]>(
        `${API_BASE_URL}/travels/${travelId}/plans`,
        getAxiosConfig()
      );
      setPlans(response.data);
    } catch(err) {
      console.error("여행 일정 로딩 실패: ", err);
      setError("일정을 불러오는 데 실패했습니다.");
    }
  };
  fetchPlans();
}, [travelId]);

// Effect: 장소 검색(Places) API 호출
useEffect(() => {
  if(!travelId) return;
  const fetchPlaces = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        keyword: `${searchQuery} 숙소 관광지 음식점`,
        lat: searchLocation.lat,
        lon: searchLocation.lon,
        radius: "30000",
        type: "point_of_interest",
      };
      const res = await axios.get(`${API_BASE_URL}/api/place`, {
        params,
        headers: getAxiosConfig().headers,
      });
      if (res.data && res.data.results) {
          const parsedPlaces: PlaceSearchResult[] = res.data.results
            .map((item: any) => ({
              placeId: item.place_id,
              name: item.name,
              address: item.vicinity,
              category: getCategoryFromTypes(item.types),
              rating: item.rating || 0,
              reviewCount: item.user_ratings_total || 0,
              imageUrl: getPhotoUrl(item.photos),
              latitude: item.geometry.location.lat,
              longitude: item.geometry.location.lng,
              openNow: item.opening_hours?.open_now,
            }))
            .filter((p: PlaceSearchResult) => p.name && p.address);
          setAllPlaces(parsedPlaces);
        } else {
          setAllPlaces([]);
        }
      } catch (err) {
        console.error("장소 검색 실패:", err);
        setError("장소를 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaces();
  }, [travelId, searchLocation, searchQuery]);

  
  // Effect: 장소 필터링
  useEffect(() => {
    if (filter === "all") {
      setFilteredPlaces(allPlaces);
    } else {
      setFilteredPlaces(allPlaces.filter((p) => p.category === filter));
    }
  }, [filter, allPlaces]);

  // Handler: 날짜 저장
  const handleSaveDates = useCallback(
    async (startDate: string, endDate: string) => {
      if (!travelId) return;
      // DTO는 수정할 필드만 포함
      const updateDto: UpdateTravelRequest = { startDate, endDate };
      try {
        const res = await axios.put<Travel>(
          `${API_BASE_URL}/travels/${travelId}`,
          updateDto,
          getAxiosConfig()
        );
        setTravelInfo(res.data); // 최신 여행 정보로 갱신
        setDates({ startDate: res.data.startDate!, endDate: res.data.endDate! }); // 내부 state도 갱신
        setIsDateModalOpen(false);
        setSnackbar({
          open: true,
          message: "여행 일정이 설정되었습니다.",
          type: "success",
        });
      } catch (err) {
        console.error("날짜 저장 실패", err);
        setSnackbar({
          open: true,
          message: "날짜 저장에 실패했습니다.",
          type: "error",
        });
      }
    },
    [travelId] 
  );

  // Handler: 장소 검색
  const handleSearch = useCallback(async (query: string) => {
    if (!query) return setError("검색어를 입력해주세요.");
    setIsLoading(true);
    setError(null);
    try {
      // 외부 Google API는 getAxiosConfig() 불필요
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        { params: { address: query, key: GOOGLE_MAPS_API_KEY } }
      );
      if (res.data?.status !== "OK" || res.data.results.length === 0) {
        throw new Error("장소의 좌표를 찾을 수 없습니다.");
      }
      const { lat, lng } = res.data.results[0].geometry.location;
      setSearchLocation({ lat, lon: lng });
      setSearchQuery(query);
    } catch (err: any) {
      console.error("좌표 검색 실패: ", err);
      setError(err.message || "장소 검색에 실패했습니다.");
    }
  }, []);

  // Handler: 일정 추가
  const handleAddPlan = useCallback(
    async (place: PlaceSearchResult) => {
      if (!travelId) return;
      const newSequence =
        plans.filter((p) => p.dayNumber === selectedDay).length + 1;
      const newPlanRequest: AddPlanRequest = {
        googlePlaceId: place.placeId,
        name: place.name,
        address: place.address,
        type: place.category,
        latitude: place.latitude,
        longitude: place.longitude,
        dayNumber: selectedDay,
        sequence: newSequence,
        memo: "",
      };

      try {
        const res = await axios.post<TravelPlan>(
          `${API_BASE_URL}/travels/${travelId}/plans`,
          newPlanRequest,
          getAxiosConfig()
        );
        setPlans((prev) => [...prev, res.data]);
        setSnackbar({
          open: true,
          message: `${place.name} 일정이 추가되었습니다.`,
          type: "success",
        });
      } catch (err) {
        console.error("일정 추가 실패:", err);
        setSnackbar({
          open: true,
          message: "일정 추가에 실패했습니다.",
          type: "error",
        });
      }
    },
    [travelId, plans, selectedDay]
  );

  // Handler: 일정 삭제
  const handleDeletePlan = useCallback(
    async (planId: number) => {
      if (!travelId) return;
      try {
        await axios.delete(
          `${API_BASE_URL}/travels/${travelId}/plans/${planId}`,
          getAxiosConfig()
        );
        setPlans((prev) => prev.filter((p) => p.planId !== planId));
        setSnackbar({
          open: true,
          message: "일정이 삭제되었습니다.",
          type: "info",
        });
      } catch (err) {
        console.error("일정 삭제 실패:", err);
        setSnackbar({
          open: true,
          message: "일정 삭제에 실패했습니다.",
          type: "error",
        });
      }
    },
    [travelId]
  );

  // Derived State: 추가된 장소 ID 맵 (useMemo로 최적화)
  const addedPlansMap = useMemo(() => {
    return plans.reduce((acc, plan) => {
      if (plan.place?.googlePlaceId) {
        acc[plan.place.googlePlaceId] = plan.planId;
      }
      return acc;
    }, {} as { [key: string]: number });
  }, [plans]);

  // UI 컴포넌트에 필요한 모든 것 반환
  return {
    travelInfo,
    isDateModalOpen,
    dates,
    handleSaveDates,
    plans,
    filteredPlaces,
    filter,
    setFilter,
    selectedDay,
    setSelectedDay,
    searchLocation,
    isLoading,
    error,
    handleSearch,
    handleAddPlan,
    handleDeletePlan,
    snackbar,
    setSnackbar,
    addedPlansMap,
    days
  };
}

