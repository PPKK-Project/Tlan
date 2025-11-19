import React from "react";
import { useParams, Outlet, useLocation } from "react-router-dom";
import Snackbar from "@mui/material/Snackbar"; // Snackbar import 추가
import { useTravelData } from "../../hooks/useTravelData";
import { DateSelectionModal } from "./DateSelectionModal";
import { PlaceSearchBar } from "./PlaceSearchBar";
import PlanSidebar from "./PlanSidebar";
import PlanMap from "./PlanMap";
import ItinerarySummary from "./ItinerarySummary";
import { Alert } from "@mui/material";

function TravelPlanPage() {
  // URL에서 /travels/:travelId 의 'travelId' 값을 가져옴
  const { travelId } = useParams<{ travelId: string }>();
  const location = useLocation(); // 현재 경로를 가져오기 위해 useLocation 추가

  // 커스텀 훅에서 모든 상태와 핸들러를 가져온다.
  const {
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
    flights, // 항공권 데이터 추가
    isFlightLoading, // 항공권 로딩 상태 추가
    flightError, // 항공권 에러 상태 추가
    days,
  } = useTravelData(travelId);

  // [렌더링]
  return (
    <div className="flex flex-col h-screen">

      {/* 날짜 선택 모달 */}
      <DateSelectionModal
        open={isDateModalOpen}
        onSave={handleSaveDates}
        initialStartDate={dates.startDate}
        initialEndDate={dates.endDate}
      />

      {/* 현재 경로가 /flight를 포함하는지 확인 */}
      {location.pathname.includes("/flight") ? (
        // /travels/:travelId/flight 경로일 때 Flight 컴포넌트를 렌더링
        // useTravelData에서 가져온 항공권 관련 데이터를 context로 전달
        <Outlet context={{ flights, isFlightLoading, flightError }} />
      ) : (
        // 그 외의 /travels/:travelId 경로일 때 기존 여행 계획 화면 렌더링
        <>
          {/* 검색 바 */}
          <PlaceSearchBar
            travelInfo={travelInfo}
            onSearch={handleSearch}
            isLoading={isLoading}
          />
          {error && (
            <div className="max-w-6xl mx-auto mt-2 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* 메인 콘텐츠 (3단) */}
          <div className="flex-1 flex overflow-hidden">
            {/* 1. 왼쪽 사이드바 (일정 추가) */}
            <aside className="w-1/3 max-w-md bg-white border-r overflow-y-auto shadow-lg z-10">
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
            <main className="flex-1 relative">
              <PlanMap
                plans={plans.filter((plan) => plan.dayNumber === selectedDay)}
                searchPlaces={filteredPlaces}
                onAddPlace={handleAddPlan}
                mapCenter={{ lat: searchLocation.lat, lng: searchLocation.lon }}
              />
            </main>

            {/* 3. 오른쪽 요약 (일정 목록) */}
            <aside className="w-1/4 max-w-sm bg-white border-l overflow-y-auto shadow-lg z-10">
              <ItinerarySummary
                plans={plans} // 전체 일정 전달
                onDeletePlan={handleDeletePlan}
                isFlightLoading={isFlightLoading}
              />
            </aside>
          </div>
        </>
      )}

      {/* Snackbar는 최상단에 유지 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} severity={snackbar.type} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default TravelPlanPage;
