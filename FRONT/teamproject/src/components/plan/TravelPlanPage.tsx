import React from "react";
import { useParams } from "react-router-dom";

import { useTravelData } from "../../hooks/useTravelData";
import { DateSelectionModal } from "./DateSelectionModal";
import { PlaceSearchBar } from "./PlaceSearchBar";
import PlanSidebar from "./PlanSidebar";
import PlanMap from "./PlanMap";
import ItinerarySummary from "./ItinerarySummary";

function TravelPlanPage() {
  // URL에서 /travels/:travelId 의 'travelId' 값을 가져옴
  const { travelId } = useParams<{ travelId: string }>();

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
