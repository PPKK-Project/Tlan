import axios from "axios";
import { useEffect, useState } from "react";
import Content from "./Content";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase";

const fetchData = async (setPlaces: (data: Place[]) => void) => {
  try {
    const response = await axios.get(`/kosis/openapi/Param/statisticsParameterData.do`, {
      params: {
        method: 'getList',
        apiKey: import.meta.env.VITE_KOSIS_KEY,
        itmId: '13103136548T1+13103136548T2+13103136548T3+13103136548T4+13103136548T5+13103136548T6+13103136548T7+13103136548T8+13103136548T9+13103136548T10+13103136548T11+',
        objL1: 'ALL',
        format: 'json',
        jsonVD: 'Y',
        prdSe: 'Y',
        startPrdDe: '2024',
        endPrdDe: '2024',
        orgId: '113',
        tblId: 'DT_113_STBL_1031852'
      }
    });

    const data: Place[] = response.data.slice(0, 10)
      .map((item: { ITM_NM: string; DT: string; }) => ({
        name: item.ITM_NM,
        value: Number(item.DT.replace(/,/g, '')) || 0,
      }))
      .sort((a: { value: number }, b: { value: number }) => b.value - a.value);

    // 인수로 받은 함수를 사용하여 상태 업데이트
    setPlaces(data);
    sessionStorage.setItem('places', JSON.stringify(data));
  } catch (error) {
    console.error("데이터 로딩 실패: ", error);
  }
};
async function getImageUrls(fileName: string) {
  // Storage에 저장된 경로 (예: place_cards/place1.webp)
  const imageRef = ref(storage, `place_cards/${fileName}`);
  try {
    const url = await getDownloadURL(imageRef);
    return url;
  } catch (error) {
    console.error("Error fetching image URL: ", error);
    return null;
  }
}
const fileNames = [
  'place1.webp', 'place2.webp', 'place3.webp', 'place4.webp', 'place5.webp',
  'place6.webp', 'place7.webp', 'place8.webp', 'place9.webp', 'place10.webp'
];

export type Place = {
  name: string,
  value: number
}
type Country = {
  country_name: string,
  rank: number
}
function Place() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<Country>({ country_name: '일본', rank: 1 });
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const storedImageUrls = sessionStorage.getItem('imageUrls');
        if (storedImageUrls) {
          setImageUrls(JSON.parse(storedImageUrls));
        } else {
          const urls = await Promise.all(
            fileNames.map(fileName => getImageUrls(fileName))
          );
          const validUrls = urls.filter((url): url is string => url !== null);
          setImageUrls(validUrls);
          sessionStorage.setItem('imageUrls', JSON.stringify(validUrls));
        }

        const storedPlaces = sessionStorage.getItem('places');
        if (storedPlaces) {
          setPlaces(JSON.parse(storedPlaces));
        } else {
          await fetchData(setPlaces);
        }
      } catch (error) {
        console.error("데이터 초기화 실패:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCountry = (name: string, rank: number) => {
    setCountry({ country_name: name, rank: rank });
  }

  if (loading) return <div className="status-message">데이터를 불러오는 중입니다...</div>;
  if (places.length === 0) return <div className="status-message">표시할 데이터가 없습니다.</div>;
  return (
    <>
      <div className="place-container">
        <div className="header-section">
          <h2 className="header-title">인기 여행지 TOP 10</h2>
          <p className="header-subtitle">한국인들이 가장 사랑하는 목적지</p>
        </div>
        <div className="card-grid">
          {places.map((place, index) => (
            <div key={place.name} onClick={() => handleCountry(place.name, index + 1)} className="place-card">
              <div
                className={`card-background`}
                style={{ backgroundImage: `url(${imageUrls[index]})` }}
              />
              <div className="card-overlay">
                <span className="card-rank">
                  #{index + 1}
                </span>
                <span className="card-title">
                  {place.name}
                </span>
                <span className="card-value">
                  방문률: {place.value.toLocaleString()}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Content
        country_name={country.country_name}
        rank={country.rank} />
    </>
  );
}

export default Place;