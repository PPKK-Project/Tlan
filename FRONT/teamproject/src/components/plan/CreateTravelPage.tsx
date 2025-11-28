import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../main/Header";
import { getAxiosConfig } from "../../util/planUtils";
import { Airport, CreateTravelRequest, Travel } from "../../util/types";
import mainPageImg from "../../assets/main-page.webp";

const API_BASE_URL = import.meta.env.VITE_BASE_URL;

function CreateTravelPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const [airportList, setAirportList] = useState<Airport[]>([]);

  // 1. 입력 상태 관리
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [departureInput, setDepartureInput] = useState("");
  const [selectedDepartureCode, setSelectedDepartureCode] = useState("");
  const [destinationInput, setDestinationInput] = useState("");
  const [selectedDestinationCode, setSelectedDestinationCode] = useState("");
  const [travelerCount, setTravelerCount] = useState(1);
  const [filteredDepartures, setFilteredDepartures] = useState<Airport[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Airport[]>(
    []
  );
  const [selectedDestinationCity, setSelectedDestinationCity] = useState("");

  // 2. 공항 검색 드롭다운 상태
  const [showDepDropdown, setShowDepDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // 초기 공항 데이터 로딩
  useEffect(() => {
    axios
      .get<Airport[]>(`${API_BASE_URL}/api/airports`)
      .then((response) => {
        setAirportList(response.data);
      })
      .catch((err) => console.error("공항 데이터 로딩 실패", err));
  }, []);

  // 날짜 변경 핸들러
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

  // --- 출발지 검색 로직 ---
  useEffect(() => {
    if (departureInput.trim() === "") {
      setFilteredDepartures([]);
      setShowDepDropdown(false);
      return;
    }

    // 이미 선택된 상태라면 드롭다운 숨김
    if (
      selectedDepartureCode &&
      departureInput.includes(selectedDepartureCode)
    ) {
      return;
    }

    const filtered = airportList.filter(
      (airport) =>
        airport.name.includes(departureInput) ||
        airport.code.toLowerCase().includes(departureInput.toLowerCase()) ||
        airport.city.includes(departureInput) ||
        airport.country.includes(departureInput)
    );

    setFilteredDepartures(filtered);
    setShowDepDropdown(filtered.length > 0);
  }, [departureInput, selectedDepartureCode, airportList]);

  // 출발지 공항 선택 핸들러
  const handleSelectDeparture = (airport: Airport) => {
    setDepartureInput(`${airport.city} - ${airport.name} (${airport.code})`); // 입력창에 보기 좋게 표시
    setSelectedDepartureCode(airport.code); // 백엔드에 보낼 '항공키'(공항코드) 저장
    setShowDepDropdown(false);
  };

  // --- 도착지 검색 로직 ---
  useEffect(() => {
    if (destinationInput.trim() === "") {
      setFilteredDestinations([]);
      setShowDestDropdown(false);
      return;
    }

    // 이미 선택된 상태라면 드롭다운 숨김
    if (
      selectedDestinationCode &&
      destinationInput.includes(selectedDestinationCode)
    ) {
      return;
    }

    const filtered = airportList.filter(
      (airport) =>
        airport.name.includes(destinationInput) ||
        airport.code.toLowerCase().includes(destinationInput.toLowerCase()) ||
        airport.city.includes(destinationInput) ||
        airport.country.includes(destinationInput)
    );

    setFilteredDestinations(filtered);
    setShowDestDropdown(filtered.length > 0);
  }, [destinationInput, selectedDestinationCode, airportList]);

  // 도착지 공항 선택 핸들러
  const handleSelectDestination = (airport: Airport) => {
    setDestinationInput(`${airport.city} - ${airport.name} (${airport.code})`);
    setSelectedDestinationCode(airport.code);
    setSelectedDestinationCity(airport.city);
    setShowDestDropdown(false);
  };

  // 여행 생성 핸들러
  const handleCreate = async () => {
    if (
      !title ||
      !startDate ||
      !endDate ||
      !selectedDepartureCode ||
      !selectedDestinationCode
    ) {
      console.log(title, startDate, endDate, selectedDepartureCode, selectedDestinationCode);
      alert("모든 정보를 입력해주세요.");
      return;
    }

    if (travelerCount < 1) {
      alert("여행 인원은 최소 1명 이상이어야 합니다.");
      return;
    }

    if (selectedDepartureCode === selectedDestinationCode) {
      alert("출발지와 도착지는 같을 수 없습니다.");
      return;
    }

    const requestData: CreateTravelRequest = {
      title,
      startDate,
      endDate,
      travelerCount,
      countryCode: selectedDestinationCode, // 도착지 공항 코드
      departure: selectedDepartureCode, // 출발지 공항 코드
      destinationCity: selectedDestinationCity, // 도시 이름
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
    <div className="main-container min-h-screen flex flex-col" style={{ backgroundImage: `url(${mainPageImg})` }}>
      <Header travelInfo={undefined} formattedDateRange={undefined} />

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

            {/* 공항 선택 섹션 */}
            <div className="flex gap-4">
              {/* 출발지 입력 */}
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
                    setSelectedDepartureCode(""); // 입력 수정 시 선택 해제
                  }}
                  onFocus={() => {
                    if (departureInput && filteredDepartures.length > 0)
                      setShowDepDropdown(true);
                  }}
                />

                {/* 출발지 드롭다운 */}
                {showDepDropdown && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-20 top-0 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredDepartures.map((airport) => (
                      <li
                        key={airport.code}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                        onClick={() => handleSelectDeparture(airport)}
                      >
                        <div>
                          <span className="font-bold text-gray-800 mr-2">
                            {airport.city}
                          </span>
                          <span className="text-gray-600 text-sm">
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

              {/* 도착지 입력 */}
              <div className="flex-1 flex flex-col text-left relative">
                <label className="font-semibold text-gray-600 mb-2">
                  여행지 (공항 검색)
                </label>
                <input
                  type="text"
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                  placeholder="예: 도쿄, 나리타, NRT"
                  value={destinationInput}
                  onChange={(e) => {
                    setDestinationInput(e.target.value);
                    setSelectedDestinationCode("");
                    setSelectedDestinationCity("");
                  }}
                  onFocus={() => {
                    if (destinationInput && filteredDestinations.length > 0)
                      setShowDestDropdown(true);
                  }}
                />
                {/* 도착지 드롭다운 */}
                {showDestDropdown && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 mt-20 top-0 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                    {filteredDestinations.map((airport) => (
                      <li
                        key={airport.code}
                        className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                        onClick={() => handleSelectDestination(airport)}
                      >
                        <div>
                          <span className="font-bold text-gray-800 mr-2">
                            {airport.city}
                          </span>
                          <span className="text-gray-600 text-sm">
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
