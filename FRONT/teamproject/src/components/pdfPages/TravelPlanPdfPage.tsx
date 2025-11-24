import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../../css/TravelPlanPdfPage.css";
import { pdf as pdfGenerator } from "@react-pdf/renderer";
import TravelPlanPdf from "./TravelPlanPdf";

type Travel = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
};

type TravelPlanResponse = {
  planId: number;
  travelId: number;
  dayNumber: number;
  sequence: number;
  memo: string;
  place: PlaceResponse;
};

type PlaceResponse = {
  placeId: number;
  googlePlaceId: string;
  name: string;
  address: string;
  type: string;
  latitude: number;
  longitude: number;
  phoneNumber: string | null;
  openNow: boolean | null;
  openingHours: string | null;
};

const getTravelPlans = async (travelId: number) => {
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}/travels/${travelId}/plans`
  );
  return response.data;
};

const getTravel = async (travelId: number) => {
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}/travels/${travelId}`
  );
  return response.data as Travel;
};

function TravelPlanPdfPage() {
  const { travelId } = useParams<{ travelId: string }>();

  const numTravelId = Number(travelId);

  const {
    data: plans,
    isLoading: isLoadingPlans,
    isError: isErrorPlans,
    error: plansError,
  } = useQuery<TravelPlanResponse[]>({
    queryKey: ["travelPlans", numTravelId],
    queryFn: () => getTravelPlans(numTravelId),
    enabled: !!numTravelId, // id가 있을 때만
  });

  const {
    data: travel,
    isLoading: isLoadingTravel,
    isError: isErrorTravel,
    error: travelError,
  } = useQuery<Travel>({
    queryKey: ["travel", numTravelId],
    queryFn: () => getTravel(numTravelId),
    enabled: !!numTravelId,
  });

  const handleDownloadPdf = async () => {
    if (!plans || plans.length === 0) return;

    const travelTitle = travel?.title ?? `여행 계획 # ${numTravelId}`;

    const start = travel?.startDate;
    const end = travel?.endDate;
    const dateRange = start && end ? `${start} ~ ${end}` : undefined;

    const blob = await pdfGenerator(
      <TravelPlanPdf plans={plans} title={travelTitle} dateRange={dateRange} />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${travelTitle}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoadingPlans || isLoadingTravel) {
    return (
      <div className="travel-pdf-page">
        <div className="travel-pdf-container">
          <div className="travel-pdf-loading">로딩중...</div>
        </div>
      </div>
    );
  }

  if (isErrorPlans || isErrorTravel) {
    console.error(plansError || travelError);
    return (
      <div className="travel-pdf-page">
        <div className="travel-pdf-container">
          <div className="travel-pdf-error">
            여행 계획을 불러오는 데 실패했습니다.
          </div>
        </div>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="travel-pdf-page">
        <div className="travel-pdf-container">
          <div className="travel-pdf-empty">등록된 여행 계획이 없습니다.</div>
        </div>
      </div>
    );
  }

  // Day 번호들 추출
  const maxDayNumber = Math.max(...plans.map((p) => p.dayNumber));
  const dayNumbers = Array.from({ length: maxDayNumber }, (_, i) => i + 1);

  return (
    <div className="travel-pdf-page">
      <div className="travel-pdf-container">
        {/* 상단 헤더 영역 */}
        <header className="travel-pdf-header">
          <div>
            <h1 className="travel-pdf-title">여행 계획 PDF 미리보기</h1>
          </div>
        </header>
        {/* 본문: Day별 일정 요약 */}
        <section className="travel-pdf-section">
          {dayNumbers.map((dayNumber) => {
            const dayPlans = plans
              .filter((p) => p.dayNumber === dayNumber)
              .sort((a, b) => a.sequence - b.sequence);

            return (
              <div key={dayNumber} className="travel-pdf-day-block">
                {/* 왼쪽 세로 Day 라벨 */}
                <div className="travel-pdf-day-label-column">
                  <div className="travel-pdf-day-label-text">
                    <span className="travel-pdf-day-label-word">DAY</span>
                    <span className="travel-pdf-day-label-num">
                      {String(dayNumber).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* 오른쪽 내용 영역 */}
                <div className="travel-pdf-day-content">
                  {/* 상단 Time / Activity 바 */}
                  <div className="travel-pdf-day-topbar">
                    <span className="travel-pdf-day-topbar-title">Time</span>
                    <span className="travel-pdf-day-topbar-title">
                      Activity
                    </span>
                  </div>

                  {/* 일정 리스트 */}
                  <ul className="travel-pdf-plan-list">
                    {dayPlans.length === 0 ? (
                      // 🔹 비어있는 Day일 때
                      <li className="travel-pdf-plan-row">
                        <div className="travel-pdf-plan-time">
                          <div className="travel-pdf-plan-order">-</div>
                        </div>
                        <div className="travel-pdf-plan-activity">
                          <div className="travel-pdf-plan-empty-message">
                            아직 일정이 정해지지 않았습니다.
                          </div>
                        </div>
                      </li>
                    ) : (
                      // 🔹 일정이 있을 때 기존대로
                      dayPlans.map((plan) => (
                        <li key={plan.planId} className="travel-pdf-plan-row">
                          {/* 왼쪽: 순서 + 타입 뱃지 */}
                          <div className="travel-pdf-plan-time">
                            <div className="travel-pdf-plan-order">
                              {plan.sequence}번째
                            </div>
                            <div className="travel-pdf-plan-type-badge">
                              {plan.place.type}
                            </div>
                          </div>

                          {/* 오른쪽: 이름/주소/메모만 */}
                          <div className="travel-pdf-plan-activity">
                            <div className="travel-pdf-plan-name">
                              {plan.place.name}
                            </div>
                            <div className="travel-pdf-plan-address">
                              {plan.place.address}
                            </div>
                            {plan.memo && (
                              <div className="travel-pdf-plan-memo">
                                메모: {plan.memo}
                              </div>
                            )}
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </section>
        <div className="travel-pdf-header-actions">
          <button
            className="travel-pdf-button primary"
            onClick={handleDownloadPdf}
          >
            PDF 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}

export default TravelPlanPdfPage;
