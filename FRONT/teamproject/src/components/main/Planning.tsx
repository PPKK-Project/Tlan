import { useNavigate } from "react-router-dom";
import Header from "./Header";
import mainPageImg from "../../assets/main-page.webp"
import { CreateTravelRequest, Travel } from "../../util/types";
import { useState } from "react";
import axios from "axios";
import { getAxiosConfig } from "../../util/planUtils";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

function Planning() {
  const navigate = useNavigate(); // 페이지 이동을 위한 hook
  const [title, setTitle] = useState("나의 즐거운 여행");


  /**
   * '여행 계획하기' 버튼 클릭 시 실행되는 핸들러
   */
  const handleCreateTravel = async () => {
    // 백엔드에 보낼 데이터 구성
    // 날짜 없이 제목만 보내서 여행 생성
    const newTravelData: CreateTravelRequest = {
      title: title,
      countryCode: "KR", // TODO: 추후 국가 선택 기능으로 변경
      startDate: null,
      endDate: null,
    };

    try {
      const response = await axios.post<Travel>(
        `${API_BASE_URL}/travels`,
        newTravelData,
        getAxiosConfig()
      );

      const newTravelId = response.data.id;

      if (newTravelId) {
        // 성공 시, 생성된 새 여행 계획 페이지로 이동
        navigate(`/travels/${newTravelId}`);
      } else {
        alert("여행 생성에 성공했으나 ID를 받지 못했습니다.");
      }
      
    } catch (err) {
      console.error("새 여행 생성 실패:", err);
      // TODO: alert 대신 MUI Dialog 등으로 에러 메시지 표시
      alert("여행 생성에 실패했습니다. 로그인이 필요할 수 있습니다.");
      navigate("/signIn");
    }
  };

  return (
    <div className="main-container" style={{ backgroundImage: `url(${mainPageImg})` }}>
      <Header />
      <div className="hero-content">
        <p className="hero-subtext">계획부터 시작하는, 여행이 쉬워지는</p>
        <h1 className="hero-title">나를 아는 여행</h1>
        <h2 className="hero-brand">Tlan</h2>
        <div className="search-box-wrapper flex flex-col items-center gap-4 mt-8">
          <div className="flex flex-col md:flex-row gap-2 bg-white/20 p-4 rounded-lg backdrop-blur-sm shadow-md">
            <div className="flex flex-col">
              <label className="text-white text-sm font-bold mb-1 text-left">
                여행 제목
              </label>
              <input
                type="text"
                className="p-2 rounded border-none outline-none text-black w-64"
                placeholder="예: 나의 즐거운 여행"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleCreateTravel}
            id="planTripButton"
            className="
                      flex items-center justify-center
                      bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700
                      text-white text-lg font-semibold
                      py-3 px-8
                      rounded-full
                      shadow-xl hover:shadow-2xl
                      transition duration-300 ease-in-out
                      transform hover:-translate-y-1
                      focus:outline-none focus:ring-4 focus:ring-cyan-300
                      mt-4
                    "
          >
            여행 계획하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Planning;