import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../../css/TravelPlanPdfPage.css";

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

function TravelPlanPdfPage() {
  const { travelId } = useParams<{ travelId: string }>();

  const numTravelId = Number(travelId);

  const {
    data: plans,
    isLoading,
    isError,
    error,
  } = useQuery<TravelPlanResponse[]>({
    queryKey: ["travelPlans", numTravelId],
    queryFn: () => getTravelPlans(numTravelId),
    enabled: !!numTravelId, // id가 있을 때만
  });

  if (isLoading) {
    return (
      <div className="travel-pdf-page">
        <div className="travel-pdf-container">
          <div className="travel-pdf-loading">로딩중...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    console.error(error);
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

  // Day 번호들 추출 (1일차, 2일차… 그룹핑용)
  const dayNumbers = Array.from(new Set(plans.map((p) => p.dayNumber))).sort(
    (a, b) => a - b
  );

  return (
    <div className="travel-pdf-page">
      <div className="travel-pdf-container">
        {/* 상단 헤더 영역 */}
        <header className="travel-pdf-header">
          <div>
            <h1 className="travel-pdf-title">여행 계획 PDF 미리보기</h1>
            <p className="travel-pdf-subtitle">여행 ID: {numTravelId}</p>
          </div>

          {/* 나중에 PDF 다운로드 버튼 붙일 자리 */}
          <div className="travel-pdf-header-actions">
            {/* <button className="travel-pdf-button primary">PDF 다운로드</button> */}
          </div>
        </header>

        {/* 본문: Day별 일정 요약 */}
        <section className="travel-pdf-section">
          <h2 className="travel-pdf-section-title">일정 목록</h2>

          {dayNumbers.map((dayNumber) => {
            const dayPlans = plans
              .filter((p) => p.dayNumber === dayNumber)
              .sort((a, b) => a.sequence - b.sequence);

            return (
              <div key={dayNumber} className="travel-pdf-day-block">
                <div className="travel-pdf-day-header">
                  <span className="travel-pdf-day-label">Day {dayNumber}</span>
                  <span className="travel-pdf-day-count">
                    총 {dayPlans.length}개 장소
                  </span>
                </div>

                <ul className="travel-pdf-plan-list">
                  {dayPlans.map((plan) => (
                    <li key={plan.planId} className="travel-pdf-plan-item">
                      <div className="travel-pdf-plan-main">
                        <span className="travel-pdf-plan-seq">
                          {plan.sequence}.
                        </span>
                        <span className="travel-pdf-plan-name">
                          {plan.place.name}
                        </span>
                        <span className="travel-pdf-plan-type">
                          {plan.place.type}
                        </span>
                      </div>

                      <div className="travel-pdf-plan-sub">
                        <span className="travel-pdf-plan-address">
                          {plan.place.address}
                        </span>
                        {plan.memo && (
                          <span className="travel-pdf-plan-memo">
                            메모: {plan.memo}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        {/* 나중에 PDF 실제 뷰어 넣을 영역 (지금은 placeholder) */}
        <section className="travel-pdf-section">
          <h2 className="travel-pdf-section-title">PDF 미리보기 영역</h2>
          <div className="travel-pdf-preview-placeholder">
            나중에 여기 안에 react-pdf로 PDF 미리보기 넣을 거야.
          </div>
        </section>
      </div>
    </div>
  );
}

export default TravelPlanPdfPage;
