import { useEffect, useState } from "react";
import { Travel } from "../../util/types";

type Props = {
  travelInfo: Travel | null;
  onSearch: (query: string) => void;
  isLoading: boolean;
};

export function PlaceSearchBar({ travelInfo, onSearch, isLoading }: Props) {
  const [destinationInput, setDestinationInput] = useState("");

  // destinationCity를 검색바에 기본값으로 올림
  useEffect(() => {
    if (travelInfo) {
      setDestinationInput(travelInfo.destinationCity || "");
    }
  }, [travelInfo]);

  const handleSearchClick = () => {
    if (!destinationInput.trim()) return;
    onSearch(destinationInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  return (
    <div className="w-full">
      <div className="relative flex items-center w-full bg-gray-100 rounded-full border border-transparent focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
        {/* 검색 아이콘 (SVG) */}
        <div className="pl-4 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        {/* 입력 필드 */}
        <input
          type="text"
          placeholder="여행지나 장소를 검색해보세요"
          value={destinationInput}
          onChange={(e) => setDestinationInput(e.target.value)}
          className="w-full bg-transparent border-none text-gray-800 text-sm px-3 py-2.5 focus:outline-none placeholder-gray-400 rounded-full"
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSearchClick}
          disabled={isLoading}
          className="mr-1 my-1 px-4 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-full hover:bg-blue-600 disabled:bg-gray-400 transition-colors duration-200 shrink-0"
        >
          {isLoading ? "검색 중..." : "검색"}
        </button>
      </div>
    </div>
  );
}
