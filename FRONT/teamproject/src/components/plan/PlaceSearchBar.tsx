import { useState } from "react";
import { Travel } from "../../util/types";

type Props = {
  travelInfo: Travel | null;
  onSearch: (query: string) => void;
  isLoading: boolean;
};

export function PlaceSearchBar({ onSearch, isLoading }: Props) {
  const [destinationInput, setDestinationInput] = useState("제주도");
  const handleSearchClick = () => {
    onSearch(destinationInput);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key === "Enter") {
      handleSearchClick();
    }
  };
  
  return (
    <div className="bg-white p-4 border-b shadow-sm">
      <div className="flex flex-wrap gap-4 items-center max-w-6xl mx-auto">
        <input
          type="text"
          placeholder="여행지"
          value={destinationInput}
          onChange={(e) => setDestinationInput(e.target.value)}
          className="border p-2 rounded-md"
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleSearchClick}
          disabled={isLoading}
          className="bg-blue-500 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? "검색 중..." : "검색"}
        </button>
      </div>
    </div>
  );
}