import axios from "axios";
import { useState, useMemo, useRef, useCallback } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";

interface FlightData {
  airline: string,
  priceKRW: number,
  departureTime: string,
  arrivalTime: string,
  returnDepartureTime: string,
  returnArrivalTime: string
}

// Outlet으로부터 받을 context의 타입을 정의합니다.
interface OutletContextType {
  flights: FlightData[];
  isFlightLoading: boolean;
  flightError: string | null;
  role: string;
}

type SortKey = "priceDesc" | "price" | "departure" | "departureDesc";

const calculateDuration = (start: string, end: string): string => {
  const startTime = new Date(`2000/01/01 ${start}`).getTime();
  const endTime = new Date(`2000/01/01 ${end}`).getTime();
  const diff = endTime - startTime;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours > 0 ? `${hours}시간 ` : ''}${minutes}분`;
};

function Flight() {
  const navigate = useNavigate();
  const travelId = window.location.pathname.split('/')[2];
  // useOutletContext를 사용하여 부모 컴포넌트(TravelPlanPage)로부터 데이터를 가져옵니다.
  const { flights, isFlightLoading, flightError, role } =
    useOutletContext<OutletContextType>();
  const isViewer = role === 'ROLE_VIEWER';
  const {snackbar, setSnackbar} = useAuthSession();

  // 현재 활성화된 정렬 기준을 관리하는 state
  const [activeSort, setActiveSort] = useState<SortKey>("departure");

  // 무한 스크롤을 위한 state
  const [visibleCount, setVisibleCount] = useState(15); // 한 번에 보여줄 항목 수

  // IntersectionObserver를 저장할 ref
  const observer = useRef<IntersectionObserver | null>(null);

  // 목록의 마지막 요소를 감지하는 콜백 ref
  const lastFlightElementRef = useCallback((node: HTMLDivElement) => {
    if (isFlightLoading) return; // 데이터 로딩 중에는 관찰하지 않음
    if (observer.current) observer.current.disconnect(); // 이전 observer 연결 해제

    observer.current = new IntersectionObserver(entries => {
      // 마지막 요소가 보이고, 더 불러올 항공권이 있는 경우
      if (entries[0].isIntersecting && flights && visibleCount < flights.length) {
        setVisibleCount(prev => prev + 15); // 15개씩 추가로 보여주기
      }
    });

    if (node) {
      observer.current.observe(node); // 새 요소를 관찰 대상으로 등록
    }
  }, [isFlightLoading, visibleCount, flights]);

  const sortedFlights = useMemo(() => {
    if (!flights) return [];

    const sortableFlights = [...flights];

    switch (activeSort) {
      case "departure":
        sortableFlights.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        break;
      case "departureDesc":
        sortableFlights.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
        break;
      case "price":
        sortableFlights.sort((a, b) => a.priceKRW - b.priceKRW);
        break;
      case "priceDesc":
        sortableFlights.sort((a, b) => b.priceKRW - a.priceKRW);
        break;
      default:
        return flights; // 원본 순서 그대로 반환
    }
    return sortableFlights;
  }, [flights, activeSort]);

  const handleFlightClick = async (flight: FlightData) => {
    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/flight/${travelId}`, flight)
    if (response.status === 200) {
      setSnackbar({
        open: true,
        message: "항공권이 선택되었습니다. 마이페이지로 이동합니다.",
        type: "success",
      });
      setTimeout(() => {
        navigate("/mypage");
      }, 2000);
    } else {
      setSnackbar({
        open: true,
        message: "항공권을 선택하는데 오류가 발생했습니다.",
        type: "error",
      });
    }
  }
  return (
    <div className="font-sans h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        {/* 헤더 */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)} // 이전 페이지로 이동
            className="p-2 rounded-full hover:bg-gray-200 transition-colors mr-4"
            aria-label="뒤로 가기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-gray-700">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">항공권 선택</h1>
        </div>

        {/* 정렬 버튼 UI */}
        <div className="flex justify-end items-center mb-4 space-x-2">
          <button
            onClick={() => setActiveSort("departure")}
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${activeSort === "departure" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >출발 시간 오름차순</button>
          <button
            onClick={() => setActiveSort("departureDesc")}
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${activeSort === "departureDesc" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >출발 시간 내림차순</button>
          <button
            onClick={() => setActiveSort("priceDesc")}
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${activeSort === "priceDesc" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >높은 가격순</button>
          <button
            onClick={() => setActiveSort("price")}
            className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${activeSort === "price" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >낮은 가격순</button>
        </div>

        {isFlightLoading ? (
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">항공권 정보를 불러오는 중입니다...</p>
          </div>
        ) : flightError ? (
          <div className="text-center py-10 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-lg text-red-600">오류: {flightError}</p>
          </div>
        ) : flights && flights.length === 0 ? ( // flights가 null/undefined일 경우도 대비
          <div className="text-center py-10">
            <p className="text-lg text-gray-600">검색된 항공권이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedFlights.slice(0, visibleCount).map((flight, index) => {
              // 현재 렌더링되는 항목 중 마지막 항목인지 확인
              const isLastElement = (index === visibleCount - 1) || (index === sortedFlights.length - 1);
              return (
                <div key={index}
                  ref={isLastElement ? lastFlightElementRef : null} // 마지막 요소에 ref 할당
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-5 flex items-center justify-between">
                  {/* 항공사 정보 (왼쪽) */}
                  <div className="w-1/5 font-semibold text-center text-lg text-gray-800 truncate pr-4">{flight.airline}</div>

                  {/* 여정 정보 (중앙) */}
                  <div className="flex-grow flex justify-around items-center text-center border-l border-r px-4">
                    {/* 가는 편 */}
                    <div className="w-1/2">
                      <div className="text-xs text-gray-500 mb-1">가는 편</div>
                      <div className="flex items-center justify-center space-x-3">
                        <span className="font-bold text-base">{flight.departureTime}</span>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-400">{calculateDuration(flight.departureTime, flight.arrivalTime)}</span>
                          <div className="w-12 h-px bg-gray-300"></div>
                        </div>
                        <span className="font-bold text-base">{flight.arrivalTime}</span>
                      </div>
                    </div>
                    {/* 오는 편 */}
                    <div className="w-1/2">
                      <div className="text-xs text-gray-500 mb-1">오는 편</div>
                      <div className="flex items-center justify-center space-x-3">
                        <span className="font-bold text-base">{flight.returnDepartureTime}</span>
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-gray-400">{calculateDuration(flight.returnDepartureTime, flight.returnArrivalTime)}</span>
                          <div className="w-12 h-px bg-gray-300"></div>
                        </div>
                        <span className="font-bold text-base">{flight.returnArrivalTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* 가격 및 선택 버튼 (오른쪽) */}
                  <div className="w-1/5 text-right pl-4">
                    <div className="text-xl font-bold text-blue-600">{flight.priceKRW.toLocaleString()}원</div>
                    <button
                      className="mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded-md font-bold hover:bg-blue-600 transition-colors text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={() => handleFlightClick(flight)}
                      disabled={isViewer}
                    >
                      선택
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* 더 많은 항공권을 로드하는 중임을 알리는 UI */}
        {isFlightLoading === false && flights && visibleCount < flights.length && (
          <div className="text-center py-6 text-gray-500">더 많은 항공편을 불러오는 중...</div>
        )}
      </div>
      {snackbar.open && (
        <div className={`toast toast-${snackbar.type}`}>{snackbar.message}</div>
      )}
    </div>
  );
}

export default Flight;