import axios from "axios";
import { useEffect, useState } from "react";

function Content({country_name, rank}: { country_name: string, rank: number }) {
  const [currency, setCurrency] = useState('');
  useEffect(() => {
    const getCurrency = async () => {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/currency?country=${country_name}`);
      setCurrency(response.data);
    };
    getCurrency();
  }, [country_name])


  return (
    <>
      <div className="max-w-md mx-auto">
        {/* 국가 타이틀 (임시) */}
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{country_name} #{rank}</h1>

        {/* 환율 정보 카드 (이미지 디자인 참고) */}
        <div className="p-6 bg-blue-50/70 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-200">

          {/* 헤더: 환율 정보 */}
          <div className="flex items-center text-blue-600 mb-4 border-b border-blue-200 pb-3">
            {/* 아이콘: 화살표 (lucide-react의 ArrowsHorizontal 유사) */}
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M8 12h13"></path>
              <path d="m17 8 4 4-4 4"></path>
              <path d="M6 8v8"></path>
              <path d="M3 16h3"></path>
            </svg>
            <span className="text-lg font-semibold">환율 정보 (KRW 1,000 기준)</span>
          </div>

          {/* 메인 환율 값 */}
          <div className="text-center">
            <p className="text-sm text-gray-500 mt-2">
              1,000 KRW = {currency}
            </p>
          </div>

          {/* 기타 정보 (이미지에는 없지만 명확성을 위해 추가) */}
          <div className="mt-4 pt-3 border-t border-blue-100 text-sm text-gray-600">
            <p>현재 환율 기준입니다.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Content;