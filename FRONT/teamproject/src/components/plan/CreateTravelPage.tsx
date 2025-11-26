import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../main/Header";
import { getAxiosConfig } from "../../util/planUtils";
import { CreateTravelRequest, Travel } from "../../util/types";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

const AIRPORT_LIST = [
  { name: "인천", code: "ICN", country: "대한민국" },
  { name: "서울/김포", code: "GMP", country: "대한민국" },
  { name: "부산/김해", code: "PUS", country: "대한민국" },
  { name: "제주", code: "CJU", country: "대한민국" },
  { name: "대구", code: "TAE", country: "대한민국" },
  { name: "청주", code: "CJJ", country: "대한민국" },
  { name: "무안", code: "MWX", country: "대한민국" },
  { name: "양양", code: "YNY", country: "대한민국" },
  { name: "광주", code: "KWJ", country: "대한민국" },
  { name: "여수", code: "RSU", country: "대한민국" },
  { name: "울산", code: "USN", country: "대한민국" },
  { name: "포항/경주", code: "KPO", country: "대한민국" },
  { name: "사천", code: "HIN", country: "대한민국" },
  { name: "군산", code: "KUV", country: "대한민국" },
  { name: "원주", code: "WJU", country: "대한민국" },
];

function CreateTravelPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  // 1. 입력 상태 관리
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departureInput, setDepartureInput] = useState("");
  const [selectedAirportCode, setSelectedAirportCode] = useState("");
  const [travelerCount, setTravelerCount] = useState(1);
  const [country, setCountry] = useState("");

  // 2. 공항 검색 드롭다운 상태
  const [filteredAirports, setFilteredAirports] = useState<typeof AIRPORT_LIST>(
    []
  );
  const [showDropdown, setShowDropdown] = useState(false);

  // 3. 날짜 변경 핸들러
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;

    if (!newDate) {
      setStartDate("");
      return;
    }

    if (newDate < today) {
      alert("과거 일자는 선택할 수 없습니다.");
      return;
    }

    setStartDate(newDate);

    // 만약 종료일이 이미 설정되어 있고, 새 시작일보다 빠르다면 종료일 초기화
    if (endDate && newDate > endDate) {
      setEndDate("");
      alert("시작일이 변경되어 종료일을 다시 설정해야 합니다.");
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;

    if (!newDate) {
      setEndDate("");
      return;
    }

    if (newDate < today) {
      alert("과거 일자는 선택할 수 없습니다.");
      return;
    }

    if (startDate && newDate < startDate) {
      alert("종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }

    setEndDate(newDate);
  };

  // 4. 출발지 검색 로직
  useEffect(() => {
    if (departureInput.trim() === "") {
      setFilteredAirports([]);
      setShowDropdown(false);
      return;
    }

    // 이미 공항을 선택해서 코드가 세팅된 상태라면 드롭다운을 띄우지 않음 (수정 시 다시 뜸)
    if (selectedAirportCode && departureInput.includes(selectedAirportCode)) {
      return;
    }

    const filtered = AIRPORT_LIST.filter(
      (airport) =>
        airport.name.includes(departureInput) ||
        airport.code.toLowerCase().includes(departureInput.toLowerCase()) ||
        airport.country.includes(departureInput)
    );

    setFilteredAirports(filtered);
    setShowDropdown(filtered.length > 0);
  }, [departureInput, selectedAirportCode]);

  // 공항 선택 핸들러
  const handleSelectAirport = (airport: (typeof AIRPORT_LIST)[0]) => {
    setDepartureInput(`${airport.name} (${airport.code})`); // 입력창에 보기 좋게 표시
    setSelectedAirportCode(airport.code); // 실제 백엔드에 보낼 '항공키'(공항코드) 저장
    setShowDropdown(false);
  };

  // 5. 여행 생성 핸들러
  const handleCreate = async () => {
    if (!title || !startDate || !endDate || !selectedAirportCode || !country) {
      alert("모든 정보를 입력해주세요. (출발지와 국가를 확인해주세요)");
      return;
    }

    if (travelerCount < 1) {
      alert("여행 인원은 최소 1명 이상이어야 합니다.");
      return;
    }

    const requestData: CreateTravelRequest = {
      title,
      countryCode: country,
      startDate,
      endDate,
      travelerCount,
      departure: selectedAirportCode, // "ICN" 같은 코드
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
              <label className="font-semibold text-gray-600 mb-2">
                여행 제목
              </label>
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
                <label className="font-semibold text-gray-600 mb-2">
                  가는 날
                </label>
                <input
                  type="date"
                  className="p-3 border rounded-lg"
                  value={startDate}
                  onChange={handleStartDateChange}
                />
              </div>
              <div className="flex-1 flex flex-col text-left">
                <label className="font-semibold text-gray-600 mb-2">
                  오는 날
                </label>
                <input
                  type="date"
                  className="p-3 border rounded-lg"
                  value={endDate}
                  onChange={handleEndDateChange}
                />
              </div>
            </div>

            {/* 출발지 (공항 선택), 도착 국가, 인원 수 */}
            <div className="flex gap-4">
              <div className="flex-1 flex flex-col text-left relative">
                <label className="font-semibold text-gray-600 mb-2">
                  출발지 (공항 검색)
                </label>
                <input
                  type="text"
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="예: 인천, 서울, ICN"
                  value={departureInput}
                  onChange={(e) => {
                    setDepartureInput(e.target.value);
                    setSelectedAirportCode(""); // 입력 수정 시 선택 해제
                  }}
                  onFocus={() => {
                    if (departureInput && filteredAirports.length > 0)
                      setShowDropdown(true);
                  }}
                />

                {/* 공항 목록 드롭다운 */}
                {showDropdown && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-20 top-0 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredAirports.map((airport) => (
                      <li
                        key={airport.code}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                        onClick={() => handleSelectAirport(airport)}
                      >
                        <div>
                          <span className="font-bold text-gray-800">
                            {airport.name}
                          </span>
                        </div>
                        <span className="font-mono font-semibold text-cyan-600 bg-cyan-50 px-2 py-1 rounded">
                          {airport.code}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* 여행지 입력 */}
              <div className="flex-1 flex flex-col text-left">
                <label className="font-semibold text-gray-600 mb-2">
                  여행지(특정 국가의 도시)
                </label>
                <input
                  type="text"
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="예: 일본 오사카, 미국 라스베가스"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>

              {/* 인원 수 */}
              <div className="w-1/4 flex flex-col text-left">
                <label className="font-semibold text-gray-600 mb-2">인원</label>
                <input
                  type="number"
                  min="1"
                  className="p-3 border rounded-lg"
                  value={travelerCount}
                  onChange={(e) => setTravelerCount(Number(e.target.value))}
                  onBlur={() => {
                    if (!travelerCount || travelerCount < 1)
                      setTravelerCount(1);
                  }}
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
