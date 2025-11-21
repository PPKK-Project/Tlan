import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import "../../css/Content.css";

type Embassy = {
  embassy_kor_nm: string,
  embassy_lat: number,
  embassy_lng: number,
  embassy_ty_cd_nm: string,
  emblgbd_addr: string,
  urgency_tel_no: string
}

const getCurrency = async (country_name: string) => {
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/currency?country=${country_name}`);
  return response.data;
};

const getEmbassy = async (country_name: string) => {
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/embassy?countryName=${country_name}`)
  return response.data.response.body.items.item as Embassy[];
}

function Content({ country_name, rank }: { country_name: string, rank: number }) {
  const { data: currency, isLoading } = useQuery({
    queryKey: ['currency', country_name],
    queryFn: () => getCurrency(country_name),
  });

  const { data: embassyData, isLoading: embassyLoading } = useQuery({
    queryKey: ['embassy', country_name],
    queryFn: () => getEmbassy(country_name),
    enabled: !!country_name,
  });

  const [embassys, setEmbassys] = useState<Embassy[]>([]);
  const [embassyLength, setEmbassyLength] = useState(0);
  const currencyText = isLoading ? '불러오는 중...' : currency;

  useEffect(() => {
    if (embassyData && embassyData.length > 0) {
      setEmbassys(embassyData);
      setEmbassyLength(Math.floor(Math.random() * embassyData.length));
    } else {
      setEmbassys([]);
      setEmbassyLength(0);
    }
  }, [embassyData]);

  return (
    <>
      <div className="content-container">
        {/* 🎯 제목 섹션 */}
        <div className="flex items-baseline mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mr-4">{country_name}</h1>
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
            인기 #{rank}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          {/* 1. 환율 정보 카드 (좌측) */}
          <div className="p-6 bg-white rounded-xl shadow-lg border border-blue-100 flex flex-col justify-between">
            <div className="flex items-center text-blue-500 mb-2">
              <svg className="w-6 h-6 text-blue-500 mr-1" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold">환율 정보</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{currencyText}</p>
              <p className="text-sm text-gray-500 mt-1">1,000 KRW 기준</p>
            </div>
          </div>

          {/* 2. 대사관 정보 카드 (우측) */}
          <div className="p-6 bg-white rounded-xl shadow-lg border border-green-200 flex flex-col justify-between md:col-span-2">
            <div className="flex items-center text-green-600 mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 11c1.66 0 2.99-1.34 2.99-3S13.66 5 12 5s-3 1.34-3 3 1.34 3 3 3Z"></path>
                <path d="M12 13c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Z"></path>
              </svg>
              <span className="text-sm font-semibold">대사관 정보</span>
            </div>
            {embassyLoading ? (
              <div className="py-4">
                <p className="text-sm text-gray-500 text-center">대사관 정보를 불러오는 중입니다...</p>
              </div>
            ) : (
              embassys && embassys.length > 0 ? (
                <div className="text-center">
                  <p className="text-xl font-semibold text-gray-800 mb-2">{embassys[embassyLength].embassy_kor_nm}</p>
                  <p className="text-sm text-gray-600 mt-1">{embassys[embassyLength].emblgbd_addr}</p>
                  <p className="text-sm text-gray-600 mt-1 font-medium">긴급 연락처: <span className="text-red-500">{embassys[embassyLength].urgency_tel_no}</span></p>
                </div>
              ) : (
                <div className="py-4">
                  <p className="text-sm text-gray-500 text-center">대사관 정보가 없습니다.</p>
                </div>
              )
            )}
          </div>
        </div>

      </div>
    </>
  );
}

export default Content;