import { useNavigate } from "react-router-dom";
import Header from "./Header";
import axios, { AxiosRequestConfig } from "axios";
import { CreateTravelRequest, Travel } from "../../../types";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

function Planning() {
  const navigate = useNavigate(); // 페이지 이동을 위한 hook

  /**
   * signin.tsx의 로직을 기반으로 인증 헤더를 포함하는 Axios 설정을 반환합니다.
   */
  const getAxiosConfig = (): AxiosRequestConfig => {
    const jwtToken = sessionStorage.getItem("jwt");
    // 'Bearer ' 접두사가 토큰 값에 이미 포함되어 있는지 확인 필요
    // 여기서는 jwtToken이 'Bearer '를 포함한다고 가정
    const token = jwtToken ? jwtToken.replace("Bearer ", "") : ""; // 순수 토큰만 추출

    return {
      headers: {
        // signin.tsx의 getAxiosConfig와 동일하게 맞춤
        Authorization: token || "", // 토큰이 없으면 빈 문자열
        "Content-Type": "application/json",
      },
    };
  };

  /**
   * '여행 계획하기' 버튼 클릭 시 실행되는 핸들러
   */
  const handleCreateTravel = async () => {
    // 1. 백엔드에 보낼 데이터 (CreateTravelRequest)
    // TODO: 실제 DTO에 맞게 수정 (예: 날짜 선택 모달을 띄워 날짜를 받을 수 있음)
    const newTravelData: CreateTravelRequest = {
      title: "새로운 여행", // 임시 제목
    };

    try {
      // 2. POST /travels API 호출 (TravelController)
      const response = await axios.post<Travel>(
        `${API_BASE_URL}/travels`,
        newTravelData,
        getAxiosConfig() // 인증 헤더 포함
      );

      // 3. 응답으로 받은 새 Travel 객체에서 ID 추출
      const newTravelId = response.data.id;

      if (newTravelId) {
        // 4. 성공 시, 생성된 새 여행 계획 페이지로 이동
        navigate(`/travels/${newTravelId}`);
      } else {
        alert("여행 생성에 성공했으나 ID를 받지 못했습니다.");
      }
    } catch (err) {
      console.error("새 여행 생성 실패:", err);
      // TODO: alert 대신 MUI Dialog 등으로 에러 메시지 표시
      alert("여행 생성에 실패했습니다. 로그인이 필요할 수 있습니다.");
    }
  };

  return (
    <div className="main-container">
      <Header />
      <div className="hero-content">
        <p className="hero-subtext">계획부터 시작하는, 여행이 쉬워지는</p>
        <h1 className="hero-title">나를 아는 여행</h1>
        <h2 className="hero-brand">Tlan</h2>
        <div className="search-box-wrapper">
          <button
            onClick={handleCreateTravel} // API 호출 핸들러 연결
            id="planTripButton"
            className="
                     flex items-center justify-center
                     bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700
                     text-white text-lg font-semibold
                     py-3 px-6 md:py-4 md:px-8
                     rounded-full
                     shadow-xl hover:shadow-2xl
                     transition duration-300 ease-in-out
                     transform hover:-translate-y-0.5
                     focus:outline-none focus:ring-4 focus:ring-cyan-300
                     w-full sm:w-auto
                   "
          >
            <svg
              className="icon-travel mr-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            여행 계획하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Planning;
