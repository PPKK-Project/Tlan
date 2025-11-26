import { useParams, Outlet, useLocation } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar"; // Snackbar import 추가
import { useTravelData } from "../../hooks/useTravelData";
import { PlaceSearchBar } from "./PlaceSearchBar";
import PlanSidebar from "./PlanSidebar";
import PlanMap from "./PlanMap";
import ItinerarySummary from "./ItinerarySummary";
import { Alert } from "@mui/material";
import Header from "../main/Header";

function TravelPlanPage() {
  // URL에서 /travels/:travelId 의 'travelId' 값을 가져옴
  const { travelId } = useParams<{ travelId: string }>();
  const location = useLocation(); // 현재 경로를 가져오기 위해 useLocation 추가

  // 커스텀 훅에서 모든 상태와 핸들러를 가져온다.
  const {
    travelInfo,
    dates,
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
    flights, // 항공권 데이터 추가
    isFlightLoading, // 항공권 로딩 상태 추가
    flightError, // 항공권 에러 상태 추가
    days,
    isMapReady,
  } = useTravelData(travelId);

  // 날짜 포맷팅 함수 (예: 2025-12-10)
  const formattedDateRange =
    dates.startDate && dates.endDate
      ? `${dates.startDate} ~ ${dates.endDate}`
      : "날짜 정보 불러오는 중...";

  // 현재 항공권 페이지인지 확인
  const isFlightPage = location.pathname.includes("/flight");

  // [렌더링]
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 1. 공통 헤더 */}
      <Header />

      {/* 여행 제목 및 날짜 정보 */}
      <div className="bg-white border-b px-8 py-3 relative flex items-center justify-between shadow-sm z-20 min-h-[70px]">
        <div className="flex flex-col items-start justify-center z-10 pointer-events-none">
          <div className="pointer-events-auto">
            <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">
              {travelInfo?.title || "여행 계획"}
            </h1>
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
              🗓️ {formattedDateRange}
              {travelInfo?.travelerCount &&
                ` · 👥 ${travelInfo.travelerCount}명`}
            </span>
          </div>
        </div>

        {/* 검색바 영역 (항공권 페이지가 아닐 때만 표시) */}
        {!isFlightPage && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg px-4">
            <PlaceSearchBar
              travelInfo={travelInfo}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
          </div>
        )}
        <div className="w-10"></div>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {isFlightPage ? (
          <Outlet context={{ flights, isFlightLoading, flightError }} />
        ) : (
          <>
            {error && (
              <div className="w-full bg-red-50 text-red-600 p-2 text-center text-sm border-b border-red-100">
                {error}
              </div>
            )}

            {/* 3단 레이아웃 (사이드바 - 지도 - 요약) */}
            <div className="flex-1 flex overflow-hidden">
              {/* 1. 왼쪽 사이드바 (일정 추가) */}
              <aside className="w-1/3 max-w-md bg-white border-r overflow-y-auto z-10 custom-scrollbar">
                <PlanSidebar
                  days={days}
                  selectedDay={selectedDay}
                  onSelectDay={setSelectedDay}
                  availablePlaces={filteredPlaces}
                  addedGooglePlaceIds={plans.map((p) => p.place.googlePlaceId)}
                  addedPlansMap={addedPlansMap}
                  onAddPlace={handleAddPlan}
                  onDeletePlace={handleDeletePlan}
                  filter={filter}
                  onFilterChange={setFilter}
                />
              </aside>

              {/* 2. 중앙 지도 */}
              <main className="flex-1 relative bg-gray-100">
                {isMapReady ? (
                <PlanMap
                  plans={plans.filter((plan) => plan.dayNumber === selectedDay)}
                  searchPlaces={filteredPlaces}
                  onAddPlace={handleAddPlan}
                  mapCenter={{
                    lat: searchLocation.lat,
                    lng: searchLocation.lon,
                  }}
                />
              ) : (
                /* 로딩 중일 때 보여줄 화면 */
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
                    <p>여행지 지도를 불러오는 중입니다...</p>
                  </div>
              )}
              </main>

              {/* 3. 오른쪽 요약 (일정 목록) */}
              <aside className="w-1/4 max-w-sm bg-white border-l overflow-y-auto z-10 custom-scrollbar">
                <ItinerarySummary
                  plans={plans} // 전체 일정 전달
                  onDeletePlan={handleDeletePlan}
                  isFlightLoading={isFlightLoading}
                />
              </aside>
            </div>
          </>
        )}
      </div>

      {/* Snackbar는 최상단에 유지 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.type}
          sx={{ width: "100%", boxShadow: 3 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default TravelPlanPage;
