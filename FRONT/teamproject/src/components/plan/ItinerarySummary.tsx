import React from 'react';
import { TravelPlan } from '../../util/types';
import { useNavigate } from 'react-router-dom';

// type AlertType = "success" | "info" | "warning" | "error";

type Props = {
  plans: TravelPlan[]; // '전체' 일정 목록
  onDeletePlan: (planId: number) => void;
  isFlightLoading: boolean;
}
const ItinerarySummary: React.FC<Props> = ({ plans, onDeletePlan, isFlightLoading }) => {
  
  // 날짜별로 그룹화 (dayNumber 기준)
  const plansByDay = plans.reduce((acc, plan) => {
    (acc[plan.dayNumber] = acc[plan.dayNumber] || []).push(plan);
    return acc;
  }, {} as Record<number, TravelPlan[]>);

  // 날짜 키를 숫자로 변환하여 정렬
  const sortedDays = Object.keys(plansByDay).map(Number).sort((a, b) => a - b);
  const navigate = useNavigate();
  // Flight 컴포넌트 페이지로 갈수있게
  const handleMoveFlight = () => {
    // const travelId = window.location.pathname.split('/')[2];
    // window.location.href = `/travels/${travelId}/flight`;
    navigate('flight');
  }


  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 border-b pb-3">여행 경로</h2>
      
      <div className="flex-1 overflow-y-auto">
        {sortedDays.map(day => (
          <div key={day} className="mb-4">
            <h3 className="font-semibold text-lg mb-2">{day}일차</h3>
            <ol className="list-decimal list-inside space-y-2">
              {plansByDay[day]
                .sort((a, b) => a.sequence - b.sequence) // 'sequence' 필드로 정렬
                .map((plan) => (
                  <li key={plan.planId} className="flex justify-between items-center group p-1 rounded hover:bg-gray-100">
                    <div>
                      {/* 장소 이름 접근 (place.name) */}
                      <span className="font-medium">{plan.place.name}</span>
                      {/* 장소 타입 접근 (place.type) */}
                      <span className="text-sm text-gray-500 ml-2">({plan.place.type})</span>
                    </div>
                    <button 
                      onClick={() => onDeletePlan(plan.planId)}
                      className="text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                    >
                      삭제
                    </button>
                  </li>
              ))}
            </ol>
          </div>
        ))}
        {plans.length === 0 && (
          <p className="text-gray-500 text-center mt-4">아직 추가된 일정이 없습니다.</p>
        )}
      </div>

      {/* 하단 요약 */}
      <div className="border-t pt-4 mt-4">
        {/* TODO: 총 거리, 예상 시간 계산 로직 구현 */}
        <div className="flex justify-between mb-2">
          <span>총 거리</span>
          <span className="font-semibold">0 km</span>
        </div>
        <div className="flex justify-between mb-4">
          <span>예상 시간</span>
          <span className="font-semibold">0시간 0분</span>
        </div>
        <button
          onClick={handleMoveFlight}
          disabled={isFlightLoading}
          className="w-full bg-blue-500 text-white py-3 rounded-md font-bold transition-colors
                     hover:bg-blue-600 
                     disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isFlightLoading ? "항공권 검색중..." : "항공권 보러가기"}
        </button>
      </div>
    </div>
  );
};

export default ItinerarySummary;