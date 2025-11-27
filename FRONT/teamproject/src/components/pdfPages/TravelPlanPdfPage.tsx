import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../../css/TravelPlanPdfPage.css";
import { pdf as pdfGenerator } from "@react-pdf/renderer";
import TravelPlanPdf from "./TravelPlanPdf";
import { Skeleton, Box } from "@mui/material";

type Travel = {
  id: number;
  title: string;
  countryCode: string;
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

type Embassy = {
  embassy_kor_nm: string;
  emblgbd_addr: string;
  urgency_tel_no: string;
};

type EmergencyGroup = {
  all: string[];
};

type EmergencyData = {
  ambulance: EmergencyGroup;
  police: EmergencyGroup;
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

const getEmbassy = async (travelId: number) => {
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}/embassy/travels/${travelId}`
  );
  return response.data.response.body.items.item;
};

const getEmergency = async (travelId: number) => {
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}/emergency/${travelId}`
  );
  return response.data.data;
};

function TravelPlanPdfSkeleton() {
  const dummyDays = [1, 2, 3]; // 로딩 중에 보여줄 가짜 Day 3개

  return (
    <div className="travel-pdf-page">
      <div className="travel-pdf-container">
        {/* 헤더 스켈레톤 */}
        <header className="travel-pdf-header">
          <Box>
            <Skeleton variant="text" width={260} height={40} />
          </Box>
        </header>

        {/* Day별 일정 스켈레톤 */}
        <section className="travel-pdf-section">
          {dummyDays.map((day) => (
            <div key={day} className="travel-pdf-day-block">
              {/* 왼쪽 DAY 라벨 영역 */}
              <div className="travel-pdf-day-label-column"> </div>

              {/* 오른쪽 내용 영역 */}
              <div className="travel-pdf-day-content">
                {/* 상단 Time / Activity 바 */}
                <div className="travel-pdf-day-topbar">
                  <Skeleton
                    variant="text"
                    width={80}
                    height={24}
                    style={{ marginRight: "16px" }}
                  />
                  <Skeleton variant="text" width={80} height={24} />
                </div>

                {/* 일정 리스트 스켈레톤 3줄 */}
                <ul className="travel-pdf-plan-list">
                  {[1, 2, 3].map((idx) => (
                    <li key={idx} className="travel-pdf-plan-row">
                      {/* 왼쪽: 순서/타입 뱃지 모양 */}
                      <div className="travel-pdf-plan-time">
                        <Box marginBottom={1}>
                          <Skeleton variant="rounded" width={60} height={24} />
                        </Box>
                        <Skeleton variant="rounded" width={60} height={20} />
                      </div>

                      {/* 오른쪽: 이름/주소/메모 자리 */}
                      <div className="travel-pdf-plan-activity">
                        <Skeleton
                          variant="text"
                          width="80%"
                          height={20}
                          style={{ marginBottom: 6 }}
                        />
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={18}
                          style={{ marginBottom: 6 }}
                        />
                        <Skeleton variant="text" width="50%" height={16} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </section>

        {/* 대사관 카드 스켈레톤 */}
        <section className="travel-pdf-section travel-pdf-embassy-section">
          <div className="embassy-card">
            <div className="embassy-card-topbar">
              <Skeleton
                variant="text"
                width={60}
                height={20}
                style={{ marginRight: 16 }}
              />
              <Skeleton variant="text" width={60} height={20} />
            </div>

            <ul className="embassy-card-list">
              {[1, 2, 3].map((idx) => (
                <li key={idx} className="embassy-card-row">
                  <div className="embassy-card-key">
                    <Skeleton variant="text" width={50} height={18} />
                  </div>
                  <div className="embassy-card-value">
                    <Skeleton variant="text" width="80%" height={18} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 긴급 연락처 카드 스켈레톤 */}
        <section className="travel-pdf-section travel-pdf-emergency-section">
          <div className="emergency-card">
            <div className="emergency-card-topbar">
              <Skeleton
                variant="text"
                width={60}
                height={20}
                style={{ marginRight: 16 }}
              />
              <Skeleton variant="text" width={80} height={20} />
            </div>

            <ul className="emergency-card-list">
              {[1, 2].map((idx) => (
                <li key={idx} className="emergency-card-row">
                  <div className="emergency-card-key">
                    <Skeleton variant="text" width={50} height={18} />
                  </div>
                  <div className="emergency-card-value">
                    <Skeleton variant="text" width="60%" height={18} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* PDF 버튼 스켈레톤 */}
        <div className="travel-pdf-header-actions">
          <Skeleton
            variant="rounded"
            width={180}
            height={40}
            style={{ borderRadius: 999 }}
          />
        </div>
      </div>
    </div>
  );
}

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

  const {
    data: embassy,
    isLoading: isLoadingEmbassy,
    isError: isErrorEmbassy,
    error: embassyError,
  } = useQuery<Embassy[]>({
    queryKey: ["embassy", numTravelId],
    queryFn: () => getEmbassy(numTravelId),
    enabled: !!numTravelId,
  });

  const {
    data: emergency,
    isLoading: isLoadingEmergency,
    isError: isErrorEmergency,
    error: emergencyError,
  } = useQuery<EmergencyData>({
    queryKey: ["emergency", numTravelId],
    queryFn: () => getEmergency(numTravelId),
    enabled: !!numTravelId,
  });

  const handleDownloadPdf = async () => {
    if (!plans || plans.length === 0) return;

    const travelTitle = travel?.title ?? `여행 계획 # ${numTravelId}`;

    const start = travel?.startDate;
    const end = travel?.endDate;
    const dateRange = start && end ? `${start} ~ ${end}` : undefined;

    const embassyForPdf = embassyInfo
      ? {
          embassyName: embassyInfo.embassy_kor_nm,
          address: embassyInfo.emblgbd_addr,
          emergencyTel: embassyInfo.urgency_tel_no,
        }
      : undefined;

    const emergencyForPdf = emergency ?? undefined;

    const blob = await pdfGenerator(
      <TravelPlanPdf
        plans={plans}
        title={travelTitle}
        dateRange={dateRange}
        embassy={embassyForPdf}
        emergency={emergencyForPdf}
      />
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${travelTitle}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (
    isLoadingPlans ||
    isLoadingTravel ||
    isLoadingEmbassy ||
    isLoadingEmergency
  ) {
    return <TravelPlanPdfSkeleton />;
  }

  if (isErrorPlans || isErrorTravel || isErrorEmbassy || isErrorEmergency) {
    console.error(plansError || travelError || embassyError || emergencyError);
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
  const embassyInfo = embassy && embassy.length > 0 ? embassy[0] : undefined;

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
                      // 일정이 있을 때 기존대로
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
        {/* 대사관 카드 섹션 */}
        {embassyInfo && (
          <section className="travel-pdf-section travel-pdf-embassy-section">
            <div className="embassy-card">
              {/* 상단 Info / Detail 헤더 */}
              <div className="embassy-card-topbar">
                <span className="embassy-card-topbar-title">Info</span>
                <span className="embassy-card-topbar-title">Detail</span>
              </div>

              {/* 내용 행들 */}
              <ul className="embassy-card-list">
                <li className="embassy-card-row">
                  <div className="embassy-card-key">대사관명</div>
                  <div className="embassy-card-value">
                    {embassyInfo.embassy_kor_nm || "-"}
                  </div>
                </li>

                <li className="embassy-card-row">
                  <div className="embassy-card-key">주소</div>
                  <div className="embassy-card-value">
                    {embassyInfo.emblgbd_addr || "-"}
                  </div>
                </li>

                <li className="embassy-card-row">
                  <div className="embassy-card-key">긴급 연락처</div>
                  <div className="embassy-card-value">
                    {embassyInfo.urgency_tel_no || "-"}
                  </div>
                </li>
              </ul>
            </div>
          </section>
        )}

        {emergency && (
          <section className="travel-pdf-section travel-pdf-emergency-section">
            <div className="emergency-card">
              <div className="emergency-card-topbar">
                <span className="emergency-card-topbar-title">Type</span>
                <span className="emergency-card-topbar-title">전화번호</span>
              </div>

              <ul className="emergency-card-list">
                <li className="emergency-card-row">
                  <div className="emergency-card-key">병원</div>
                  <div className="emergency-card-value">
                    {emergency.ambulance.all[0] || "-"}
                  </div>
                </li>
                <li className="emergency-card-row">
                  <div className="emergency-card-key">경찰</div>
                  <div className="emergency-card-value">
                    {emergency.police.all[0] || "-"}
                  </div>
                </li>
              </ul>
            </div>
          </section>
        )}

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