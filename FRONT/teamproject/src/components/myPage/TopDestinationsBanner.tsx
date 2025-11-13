import axios from "axios";
import { useEffect, useState } from "react";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

type Place = {
  name: string;
  value: number;
  imageUrl: string; // 이미지 URL 필드 추가
};

// Place.tsx의 이미지 로딩 로직을 가져옵니다.
async function getImageUrl(fileName: string) {
  const imageRef = ref(storage, `place_cards/${fileName}`);
  try {
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.error("Error fetching image URL: ", error);
    return ""; // 에러 시 빈 문자열 반환
  }
}
const fileNames = [
  "place1.webp",
  "place2.webp",
  "place3.webp",
  "place4.webp",
  "place5.webp",
  "place6.webp",
  "place7.webp",
  "place8.webp",
  "place9.webp",
  "place10.webp",
];

function TopDestinationsBanner() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Place.tsx와 동일한 KOSIS API를 호출하여 인기 여행지 데이터를 가져옵니다.
        const [response, imageUrls] = await Promise.all([
          axios.get(`/kosis/openapi/Param/statisticsParameterData.do`, {
            params: {
              method: "getList",
              apiKey: import.meta.env.VITE_KOSIS_KEY,
              itmId:
                "13103136548T1+13103136548T2+13103136548T3+13103136548T4+13103136548T5+13103136548T6+13103136548T7+13103136548T8+13103136548T9+13103136548T10+13103136548T11+",
              objL1: "ALL",
              format: "json",
              jsonVD: "Y",
              prdSe: "Y",
              startPrdDe: "2024",
              endPrdDe: "2024",
              orgId: "113",
              tblId: "DT_113_STBL_1031852",
            },
          }),
          Promise.all(fileNames.map(getImageUrl)),
        ]);

        const data: Place[] = response.data
          .slice(0, 10)
          .map((item: any, index: number) => ({
            name: item.ITM_NM,
            value: Number(item.DT.replace(/,/g, "")) || 0,
            imageUrl: imageUrls[index] || "", // 이미지 URL 매핑
          }))
          .sort((a: Place, b: Place) => b.value - a.value);
        setPlaces(data); // 정렬된 데이터와 이미지 URL이 포함된 최종 데이터
      } catch (error) {
        console.error("인기 여행지 데이터 로딩 실패: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || places.length === 0) {
    return null; // 로딩 중이거나 데이터가 없으면 배너를 표시하지 않음
  }

  return (
    <div className="destinations-banner-container">
      <div className="destinations-list">
        <div className="destinations-inner-wrapper">
          {/* 애니메이션을 위해 데이터를 두 번 렌더링 */}
          {[...places, ...places].map((place, index) => (
            <div key={index} className="destination-card">
              <div
                className="card-background"
                style={{ backgroundImage: `url(${place.imageUrl})` }}
              />
              <div className="card-overlay">
                <span className="card-rank">#{(index % 10) + 1}</span>
                <span className="card-title">{place.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TopDestinationsBanner;
