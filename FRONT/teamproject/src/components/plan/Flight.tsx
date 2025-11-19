import { useParams, useNavigate, useOutletContext } from "react-router-dom";

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
}

function Flight() {
  const navigate = useNavigate();

  // useOutletContext를 사용하여 부모 컴포넌트(TravelPlanPage)로부터 데이터를 가져옵니다.
  const { flights, isFlightLoading, flightError } =
    useOutletContext<OutletContextType>();

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto">
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
            {flights.map((flight, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="font-semibold text-lg">{flight.airline}</div>
                </div>
                <div className="flex items-center space-x-8 text-center">
                  <div>
                    <div className="text-xl font-bold">{flight.arrivalTime}</div>
                    <div className="text-sm text-gray-500">{flight.departureTime}</div>
                  </div>
                  <div className="text-sm text-gray-500">{`${(new Date(`2000/01/01 ${flight.returnArrivalTime}`).getTime() - new Date(`2000/01/01 ${flight.departureTime}`).getTime()) / (1000 * 60)}분`}</div>
                  <div>
                    <div className="text-xl font-bold">{flight.returnArrivalTime}</div>
                    <div className="text-sm text-gray-500">{flight.returnDepartureTime}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-blue-600">{flight.priceKRW.toLocaleString()}원</div>
                  <button className="mt-1 w-full bg-blue-500 text-white py-2 px-4 rounded-md font-bold hover:bg-blue-600 transition-colors text-sm">
                    선택
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Flight;