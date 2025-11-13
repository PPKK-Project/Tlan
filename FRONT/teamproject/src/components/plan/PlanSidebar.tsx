import React from 'react';
import { PlaceFilter, PlaceSearchResult } from '../../../types';

type Props = {
  selectedDay: number;
  onSelectDay: (day: number) => void;
  availablePlaces: PlaceSearchResult[];
  addedGooglePlaceIds: string[];
  onAddPlace: (place: PlaceSearchResult) => void;
  onDeletePlace: (planId: number) => void;
  filter: PlaceFilter; // 현재 필터 상태
  onFilterChange: (filter: PlaceFilter) => void; // 필터 변경 함수
}

// 이미지의 왼쪽 '숙소 (12)' 카드 예시
const PlaceCard: React.FC<{ place: PlaceSearchResult, isAdded: boolean, onAdd: () => void }> =
  ({ place, isAdded, onAdd }) => (
  <div className="flex gap-4 p-3 border-b hover:bg-gray-50">
    <img src={place.imageUrl} alt={place.name} className="w-24 h-24 rounded-md object-cover" 
        onError={(e) => (e.currentTarget.src = 'https://placehold.co/100x100/cccccc/ffffff?text=Error')}
    />
    <div className="flex-1">
      <h3 className="font-semibold text-lg">{place.name}</h3>
      <p className="text-sm text-gray-600">
        ⭐ {place.rating} (리뷰 {place.reviewCount})
      </p>
      <p className="text-sm text-gray-500">{place.category}</p>
      {place.price && <p className="font-bold text-lg mt-1">₩{place.price.toLocaleString()}</p>}
    </div>
    <div className="flex items-center">
      <button 
        onClick={onAdd}
        disabled={isAdded}
        className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
          isAdded
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' // ⬅️ 추가됨 스타일
            : 'bg-blue-500 hover:bg-blue-600 text-white' // ⬅️ 추가 가능 스타일
        }`}
      >
        {isAdded ? '✓' : '+'}
      </button>
    </div>
  </div>
);

const PlanSidebar: React.FC<Props> = ({ 
  selectedDay,
  onSelectDay,
  availablePlaces,
  addedGooglePlaceIds,
  onAddPlace,
  filter,
  onFilterChange,
}) => {
  const days = [1, 2, 3]; // TODO: 여행 기간에 맞게 동적으로 생성
  const filters: { key: PlaceFilter, label: string }[] = [
    { key: 'all', label: '전체' },
    { key: '숙소', label: '숙소' },
    { key: '관광지', label: '관광지' },
    { key: '음식점', label: '음식점' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 1. 날짜 탭 */}
      <div className="flex border-b">
        {days.map(day => (
          <button
            key={day}
            onClick={() => onSelectDay(day)}
            className={`flex-1 py-3 font-semibold ${
              selectedDay === day 
                ? 'border-b-2 border-blue-500 text-blue-500' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {day}일차
          </button>
        ))}
        <button className="px-4 py-3 text-gray-500 hover:bg-gray-100">+</button>
      </div>
      
      {/* 2. 필터 및 정렬 */}
      <div className="p-4 border-b">
        <h2 className="font-bold text-xl mb-3">필터</h2>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filter === f.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. 장소 목록 (스크롤) */}
      <div className="flex-1 overflow-y-auto">
        {availablePlaces.length === 0 && <p className="p-4 text-center text-gray-500">표시할 장소가 없습니다.</p>}
        {availablePlaces.map(place => {
          // "이미 추가된 Google ID 목록"에 "현재 장소의 Google ID"가 포함되어 있는지 확인
          const isAdded = addedGooglePlaceIds.includes(place.placeId);
          return (
          <PlaceCard
            key={place.placeId}
            place={place}
            isAdded={isAdded}
            onAdd={() => onAddPlace(place)}
          />
        );
      })}
    </div>
  </div>
  );
};

export default PlanSidebar;