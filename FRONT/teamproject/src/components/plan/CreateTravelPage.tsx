import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../main/Header";
import { getAxiosConfig } from "../../util/planUtils";
import { CreateTravelRequest, Travel } from "../../util/types";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

function CreateTravelPage() {
  const navigate = useNavigate();

  // 1. 입력 상태 관리
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departure, setDeparture] = useState("");
  const [travelerCount, setTravelerCount] = useState(1);

  // 2. 여행 생성 핸들러
  const handleCreate = async () => {
    // 유효성 검사
    if (!title || !startDate || !endDate || !departure) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    const requestData: CreateTravelRequest = {
      title,
      countryCode: "KR", // 필요시 국가 선택 추가
      startDate,         // string "YYYY-MM-DD"
      endDate,
      travelerCount,
      departure
    };

    try {
      const response = await axios.post<Travel>(
        `${API_BASE_URL}/travels`,
        requestData,
        getAxiosConfig()
      );
      
      // 성공 시 상세 계획 페이지로 이동
      if (response.data.id) {
        navigate(`/travels/${response.data.id}`);
      }
    } catch (err) {
      console.error("여행 생성 실패", err);
      alert("여행을 생성하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            기본 여행 정보 입력
          </h2>

          <div className="space-y-6">
            {/* 여행 제목 */}
            <div className="flex flex-col text-left">
              <label className="font-semibold text-gray-600 mb-2">여행 제목</label>
              <input
                type="text"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                placeholder="예: 우당탕탕 여름 휴가"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* 여행 기간 */}
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col text-left">
                <label className="font-semibold text-gray-600 mb-2">가는 날</label>
                <input
                  type="date"
                  className="p-3 border rounded-lg"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1 flex flex-col text-left">
                <label className="font-semibold text-gray-600 mb-2">오는 날</label>
                <input
                  type="date"
                  className="p-3 border rounded-lg"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* 출발지 & 인원 수 */}
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col text-left">
                <label className="font-semibold text-gray-600 mb-2">출발지</label>
                <input
                  type="text"
                  className="p-3 border rounded-lg"
                  placeholder="예: 인천, 서울"
                  value={departure}
                  onChange={(e) => setDeparture(e.target.value)}
                />
              </div>
              <div className="w-1/3 flex flex-col text-left">
                <label className="font-semibold text-gray-600 mb-2">인원</label>
                <input
                  type="number"
                  min="1"
                  className="p-3 border rounded-lg"
                  value={travelerCount}
                  onChange={(e) => setTravelerCount(Number(e.target.value))}
                />
              </div>
            </div>

            <button
              onClick={handleCreate}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 rounded-xl text-lg mt-4 transition"
            >
              상세 계획 짜러 가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTravelPage;