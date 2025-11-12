import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios, { AxiosRequestConfig } from 'axios';
import { AddPlanRequest, PlaceFilter, PlaceSearchResult, TravelPlan } from '../../../types';
import Header from '../main/Header';
import PlanSidebar from './PlanSidebar';
import PlanMap from './PlanMap';
import ItinerarySummary from './ItinerarySummary';



// --- Mock Data ---
const ALL_MOCK_PLACES: PlaceSearchResult[] = [
  { placeId: 101, name: '제주 오션뷰 호텔', category: '숙소', rating: 4.8, reviewCount: 328, imageUrl: 'https://placehold.co/100x100/a0c4ff/ffffff?text=Hotel', price: 180000, latitude: 33.5104, longitude: 126.4913 },
  { placeId: 102, name: '제주 한옥 스테이', category: '숙소', rating: 4.6, reviewCount: 156, imageUrl: 'https://placehold.co/100x100/a0c4ff/ffffff?text=Hanok', price: 220000, latitude: 33.4996, longitude: 126.5311 },
  { placeId: 201, name: '성산일출봉', category: '관광지', rating: 4.7, reviewCount: 1024, imageUrl: 'https://placehold.co/100x100/99f6e4/ffffff?text=Peak', latitude: 33.4580, longitude: 126.9426 },
  { placeId: 202, name: '만장굴', category: '관광지', rating: 4.5, reviewCount: 512, imageUrl: 'https://placehold.co/100x100/99f6e4/ffffff?text=Cave', latitude: 33.5292, longitude: 126.7731 },
  { placeId: 301, name: '제주 흑돼지 맛집', category: '음식점', rating: 4.9, reviewCount: 876, imageUrl: 'https://placehold.co/100x100/fecaca/ffffff?text=Food', latitude: 33.5138, longitude: 126.5298 },
];
// -------------------------------------------------

// .env 파일에서 API 기본 URL 가져오기
const API_BASE_URL = import.meta.env.VITE_BASE_URL;

function TravelPlanPage() {
  // URL에서 /travels/:travelId 의 'travelId' 값을 가져옴
  const { travelId } = useParams<{ travelId: string }>();

  // [상태]
  // 1. 현재 여행의 모든 일정 (백엔드에서 받아옴)
  const [plans, setPlans] = useState<TravelPlan[]>([]);
  
  // 2. 전체 장소 목록 (Mock 데이터)
  const [allPlaces] = useState<PlaceSearchResult[]>(ALL_MOCK_PLACES);
  // 3. 현재 필터 상태
  const [filter, setFilter] = useState<PlaceFilter>('all');
  // 4. 필터링된 장소 목록
  const [filteredPlaces, setFilteredPlaces] = useState<PlaceSearchResult[]>(allPlaces);

  // 5. 현재 선택된 날짜 (1일차, 2일차...)
  const [selectedDay, setSelectedDay] = useState<number>(1);
  // 6. 로딩 및 에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // [로직] 필터가 변경될 때마다 filteredPlaces 상태 업데이트
  useEffect(() => {
    if (filter === 'all') {
      setFilteredPlaces(allPlaces);
    } else {
      setFilteredPlaces(allPlaces.filter(place => place.category === filter));
    }
  }, [filter, allPlaces]);

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

  // [API] 여행 일정 불러오기 (Mount 시)
  useEffect(() => {
    if (!travelId) return;

    const fetchPlans = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // GET /travels/{travelId}/plans 호출
        const response = await axios.get<TravelPlan[]>(
          `${API_BASE_URL}/travels/${travelId}/plans`,
          getAxiosConfig() // 인증 헤더 포함
        );
        setPlans(response.data);
      } catch (err) {
        console.error("여행 일정 로딩 실패:", err);
        setError("일정을 불러오는 데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
    // TODO: 백엔드에 장소 검색 API가 있다면 여기서 allPlaces도 fetch
    // setAllPlaces(fetchedPlaces);

  }, [travelId]); // travelId가 변경될 때마다 다시 실행

  
  // [이벤트 핸들러]
  // 1. 일정 추가 (사이드바, 지도 둘 다 사용)
  const handleAddPlan = async (place: PlaceSearchResult) => {
    if (!travelId) return;
    
    // DTO에 맞게 sequence 계산 (현재 선택된 날짜의 일정 개수 + 1)
    const newSequence = plans.filter(p => p.dayNumber === selectedDay).length + 1;

    // AddPlanRequest DTO에 맞게 데이터 구성
    const newPlanRequest: AddPlanRequest = {
      placeId: place.placeId,
      dayNumber: selectedDay,
      sequence: newSequence,
      memo: "" // TODO: 메모 입력 UI가 있다면 해당 값 사용, 없으면 빈 문자열
    };

    try {
      // POST /travels/{travelId}/plans 호출
      const response = await axios.post<TravelPlan>(
        `${API_BASE_URL}/travels/${travelId}/plans`, 
        newPlanRequest,
        getAxiosConfig() // 인증 헤더 포함
      );
      
      // 성공 시, 반환된 새 plan 객체를 plans 상태에 추가
      // (정렬을 위해 sequence도 함께 업데이트)
      setPlans(prevPlans => [...prevPlans, response.data]);

    } catch (err) {
      console.error("일정 추가 실패:", err);
      alert("일정 추가에 실패했습니다.");
    }
  };

  // 2. 일정 삭제
  const handleDeletePlan = async (planId: number) => {
    if (!travelId) return;

    try {
      // DELETE /travels/{travelId}/plans/{planId} 호출
      await axios.delete(
        `${API_BASE_URL}/travels/${travelId}/plans/${planId}`,
        getAxiosConfig() // 인증 헤더 포함
      );

      // 성공 시, plans 상태에서 해당 plan 제거
      setPlans(prevPlans => prevPlans.filter(plan => plan.planId !== planId));
    } catch (err) {
      console.error("일정 삭제 실패:", err);
      alert("일정 삭제에 실패했습니다.");
    }
  };


  // [렌더링]
  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      {/* 검색 바 (이미지 상단) */}
      <div className="bg-white p-4 border-b shadow-sm">
        {/* TODO: 출발지, 도착지, 날짜 선택 UI 구현 */}
        <div className="flex gap-4 items-center max-w-6xl mx-auto">
          <input type="text" placeholder="출발지" defaultValue="서울" className="border p-2 rounded-md" />
          <input type="text" placeholder="도착지" defaultValue="제주도" className="border p-2 rounded-md" />
          <input type="date" defaultValue="2025-01-15" className="border p-2 rounded-md" />
          <input type="date" defaultValue="2025-01-18" className="border p-2 rounded-md" />
          <button className="bg-blue-500 text-white px-6 py-2 rounded-md font-semibold">검색</button>
        </div>
      </div>

      {/* 메인 콘텐츠 (3단) */}
      <div className="flex-1 flex overflow-hidden">
        {/* 1. 왼쪽 사이드바 (일정 추가) */}
        <aside className="w-1/3 max-w-md bg-white border-r overflow-y-auto shadow-lg z-10">
          <PlanSidebar
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
            availablePlaces={filteredPlaces} // 필터링된 장소 전달
            addedPlanIds={plans.map(p => p.planId)} // 어떤 장소가 이미 추가되었는지 ID 목록 전달
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
          />
        </main>

        {/* 3. 오른쪽 요약 (일정 목록) */}
        <aside className="w-1/4 max-w-sm bg-white border-l overflow-y-auto shadow-lg z-10">
          <ItinerarySummary
            plans={plans} // 전체 일정 전달
            onDeletePlan={handleDeletePlan}
          />
        </aside>
      </div>
    </div>
  );
}

export default TravelPlanPage;