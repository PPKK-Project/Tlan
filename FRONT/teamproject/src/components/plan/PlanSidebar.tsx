import React from "react";
import { PlaceFilter, PlaceSearchResult } from "../../util/types";
import { usePlanPagination } from "../../hooks/usePlanPagenation";

type Props = {
  days: number[];
  selectedDay: number;
  onSelectDay: (day: number) => void;
  availablePlaces: PlaceSearchResult[];
  addedGooglePlaceIds: string[];
  onAddPlace: (place: PlaceSearchResult) => void;
  onDeletePlace: (planId: number) => void;
  addedPlansMap: { [key: string]: number };
  filter: PlaceFilter;
  onFilterChange: (filter: PlaceFilter) => void;
  role: string;
};

// 왼쪽 사이드 바의 장소 이미지
const PlaceCard: React.FC<{
  place: PlaceSearchResult;
  isAdded: boolean;
  onAdd: () => void;
  onDelete: () => void;
  role: string;
}> = ({ place, isAdded, onAdd, onDelete, role }) => {
  const isViewer = role === "ROLE_VIEWER";
  return (
    <div className="flex gap-4 p-4 border-b hover:bg-gray-50 transition-colors">
      <img
        src={place.imageUrl}
        alt={place.name}
        className="w-20 h-20 rounded-lg object-cover shadow-sm"
        onError={(e) =>
          (e.currentTarget.src =
            "https://placehold.co/100x100/cccccc/ffffff?text=No+Image")
        }
      />
      <div className="flex-1 min-w-0">
        {" "}
        {/* min-w-0: 텍스트 내용이 너무 길 때 말줄임(...)으로 처리하는 역할 */}
        <div className="flex items-center mb-1">
          <h3 className="font-bold text-base truncate">{place.name}</h3>
        </div>
        <div className="flex items-center text-xs text-gray-500 mb-1">
          <span className="text-yellow-500 mr-1">⭐</span>
          <span className="font-medium text-gray-700">{place.rating}</span>
          <span className="mx-1">·</span>
          <span>리뷰 {place.reviewCount}</span>
          <span className="mx-1">·</span>
          <span>{place.category}</span>
        </div>
      </div>
      <div className="flex items-center">
        {!isViewer && (
          isAdded ? (
            // 일정에서 장소 삭제
            <button
              onClick={onDelete}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-all shadow-sm"
              title="일정에서 삭제"
            >
              🗑️
            </button>
          ) : (
            // 일정에 추가
            <button
              onClick={onAdd}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white hover:shadow-md transition-all"
              title="일정에 추가"
            >
              +
            </button>
          )
        )}
      </div>
    </div>
  );
};

const PlanSidebar: React.FC<Props> = ({
  days,
  selectedDay,
  onSelectDay,
  availablePlaces,
  addedGooglePlaceIds,
  addedPlansMap = {}, // 기본값을 빈 객체로 설정
  onAddPlace,
  onDeletePlace,
  filter,
  onFilterChange,
  role,
}) => {
  
  // hooks 파일에 분리해둔 usePlanPagination 커스텀 훅 사용
  const { visibleDays, hasPrev, hasNext, handlePrev, handleNext } =
    usePlanPagination(days, selectedDay, 5);

  const filters: { key: PlaceFilter; label: string }[] = [
    { key: "all", label: "전체" },
    { key: "숙소", label: "숙소" },
    { key: "관광지", label: "관광지" },
    { key: "음식점", label: "음식점" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 1. 날짜 탭 */}
      <div className="border-b bg-gray-50">
          <div className="flex">
          {/* 이전 버튼 (-) */}
          {hasPrev && (
            <button
              onClick={handlePrev}
              className="px-3 py-3 text-gray-500 hover:bg-gray-200 transition-colors text-sm font-bold bg-gray-100 border-b-2 border-transparent"
              title="이전 날짜"
            >
              -
            </button>
          )}

          {/* 현재 페이지의 날짜들 */}
          {visibleDays.map((day) => (
            <button
              key={day}
              onClick={() => onSelectDay(day)}
              className={`flex-1 min-w-[60px] py-3 text-sm font-semibold transition-colors border-b-2 ${
                selectedDay === day
                  ? "border-blue-500 text-blue-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              {day}일차
            </button>
          ))}

          {/* 다음 버튼 (+) */}
          {hasNext && (
            <button
              onClick={handleNext}
              className="px-3 py-3 text-gray-500 hover:bg-gray-200 transition-colors text-sm font-bold bg-gray-100 border-b-2 border-transparent"
              title="다음 날짜"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* 2. 필터 및 정렬 */}
      <div className="p-3 border-b bg-white sticky top-0 z-10">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === f.key
                  ? 'bg-gray-800 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. 장소 목록 (스크롤) */}
      <div className="flex-1 overflow-y-auto">
        {availablePlaces.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <p>검색된 장소가 없습니다.</p>
          </div>
        )}
        {availablePlaces.map((place) => {
          // "이미 추가된 Google ID 목록"에 "현재 장소의 Google ID"가 포함되어 있는지 확인
          const isAdded = addedGooglePlaceIds.includes(place.placeId);
          const planId = addedPlansMap[place.placeId];

          return (
            <PlaceCard
              key={place.placeId}
              place={place}
              isAdded={isAdded}
              onAdd={() => onAddPlace(place)}
              onDelete={() => onDeletePlace(planId)}
              role={role}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PlanSidebar;