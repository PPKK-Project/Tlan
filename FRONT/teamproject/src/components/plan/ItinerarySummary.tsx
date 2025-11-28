import React, { useMemo } from "react";
import { TravelPlan } from "../../util/types";
import { useNavigate } from "react-router-dom";

// type AlertType = "success" | "info" | "warning" | "error";

type Props = {
  plans: TravelPlan[]; // '전체' 일정 목록
  onDeletePlan: (planId: number) => void;
  role: string;
  isFlightLoading: boolean;
};
const ItinerarySummary: React.FC<Props> = ({
  plans,
  onDeletePlan,
  isFlightLoading,
  role,
}) => {
  const navigate = useNavigate();

  // 날짜별로 그룹화 (dayNumber 기준)
  const plansByDay = useMemo(() => {
    return plans.reduce((acc, plan) => {
      (acc[plan.dayNumber] = acc[plan.dayNumber] || []).push(plan);
      return acc;
    }, {} as Record<number, TravelPlan[]>);
  }, [plans]);

  // 날짜 키를 숫자로 변환하여 정렬
  const sortedDays = useMemo(() => {
    return Object.keys(plansByDay)
      .map(Number)
      .sort((a, b) => a - b);
  }, [plansByDay]);

  // // 총 거리 및 예상 시간 계산
  // const { totalDistance, estimatedTime } = useMemo(() => {
  //   let dist = 0;

  //   // 각 일차별로 순서대로 거리를 계산하여 합산
  //   sortedDays.forEach((day) => {
  //     // 해당 일차의 일정들을 순서대로 정렬
  //     const dayPlans = [...plansByDay[day]].sort(
  //       (a, b) => a.sequence - b.sequence
  //     );

  //     // i번째 장소와 i+1번째 장소 사이의 거리를 더함
  //     for (let i = 0; i < dayPlans.length - 1; i++) {
  //       const curr = dayPlans[i].place;
  //       const next = dayPlans[i + 1].place;
  //       dist += getDistanceFromLatLonInKm(
  //         curr.latitude,
  //         curr.longitude,
  //         next.latitude,
  //         next.longitude
  //       );
  //     }
  //   });

  //   // 예상 시간: 차량 이동 기준으로 평균 시속 30km로 가정 (도심 이동 고려)
  //   const speedKmPerH = 30;
  //   const time = dist / speedKmPerH;

  //   return { totalDistance: dist, estimatedTime: time };
  // }, [plansByDay, sortedDays]);

  // Flight 컴포넌트 페이지로 갈수있게
  const handleMoveFlight = () => {
    navigate("flight");
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 border-b pb-3">여행 경로</h2>

      <div className="flex-1 overflow-y-auto">
        {sortedDays.map((day) => (
          <div key={day} className="mb-4">
            <h3 className="font-semibold text-lg mb-2">{day}일차</h3>
            <ol className="list-decimal list-inside space-y-2">
              {plansByDay[day]
                .sort((a, b) => a.sequence - b.sequence) // 'sequence' 필드로 정렬
                .map((plan) => (
                  <li
                    key={plan.planId}
                    className="flex justify-between items-center group p-1 rounded hover:bg-gray-100"
                  >
                    <div>
                      {/* 장소 이름 접근 (place.name) */}
                      <span className="font-medium">{plan.place.name}</span>
                      {/* 장소 타입 접근 (place.type) */}
                      <span className="text-sm text-gray-500 ml-2">
                        ({plan.place.type})
                      </span>
                    </div>
                    {role !== 'ROLE_VIEWER' && (
                      <button
                        onClick={() => onDeletePlan(plan.planId)}
                        className="text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                      >
                        삭제
                      </button>
                    )}
                  </li>
                ))}
            </ol>
          </div>
        ))}
        {plans.length === 0 && (
          <p className="text-gray-500 text-center mt-4">
            아직 추가된 일정이 없습니다.
          </p>
        )}
      </div>

      {/* 하단 요약 */}
      <div className="border-t pt-4 mt-4">
        {/* <div className="flex justify-between mb-2">
          <span>총 거리</span>
          <span className="font-semibold">
            {totalDistance.toLocaleString(undefined, {
              maximumFractionDigits: 1,
            })}{" "}
            km
          </span>
        </div>
        <div className="flex justify-between mb-4">
          <span>예상 시간</span>
          <span className="font-semibold">{formatTime(estimatedTime)}</span>
        </div> */}
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
