import React, { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";
import { PlaceSearchResult, TravelPlan } from "../../../types";

type Props = {
  plans: TravelPlan[]; // 현재 날짜에 해당하는 일정 목록
  searchPlaces: PlaceSearchResult[]; // 필터링된 "검색" 장소 목록
  onAddPlace: (place: PlaceSearchResult) => void; // 일정 추가 함수
  mapCenter: { lat: number; lng: number }; // 부모로부터 받을 맵 중심 좌표
};

// 1. 지도가 표시될 컨테이너의 스타일
const containerStyle = {
  width: "100%",
  height: "100%",
};

// 2. plans가 비어있을 때 표시할 기본 중심 좌표 (현재는 임시로 제주도로 설정함)
// const defaultCenter = {
//   lat: 33.361665,
//   lng: 126.520412,
// };

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const PlanMap: React.FC<Props> = ({ 
  plans, 
  searchPlaces, 
  onAddPlace,
  mapCenter, }) => {
  // 3. Google Maps 스크립트 로더 훅
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: API_KEY || "",
  });

  // 4. 지도 인스턴스를 저장하기 위한 state
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // 정보창(InfoWindow)을 띄울 검색 마커 state
  const [selectedSearchPlace, setSelectedSearchPlace] =
    useState<PlaceSearchResult | null>(null);

  // 5. 지도가 로드될 때 map 인스턴스를 state에 저장
  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  // 6. 컴포넌트가 언마운트될 때 map 인스턴스 정리
  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // 7. plans(일정) 또는 mapCenter(검색 좌표)가 변경될 때 지도를 이동
  useEffect(() => {
    // 지도가 로드되지 않았으면 아무것도 안함
    if (!map) return;
  // 현재 날짜에 "일정"이 1개 이상 있으면, 일정에 맞춰 지도를 조정
    if(plans.length > 0){
      const bounds = new window.google.maps.LatLngBounds();

      plans.forEach((plan) => {
        bounds.extend({
          lat: plan.place.latitude,
          lng: plan.place.longitude,
        });
      });

      // 계산된 경계로 지도를 이동
      map.fitBounds(bounds);

      // 만약 plan이 1개뿐이면 fitBounds가 너무 확대될 수 있으므로
      // 수동으로 줌 레벨을 조절
      if (plans.length === 1) {
        map.setZoom(15);
      }
    } else if (mapCenter) {
      map.panTo(mapCenter);
      map.setZoom(12);
    }
  }, [map, plans, mapCenter]);

  // 8. 렌더링 로직
  if (loadError) {
    console.error("Google Maps API 로드 실패:", loadError);
    return <div>Error loading maps. (API 키를 확인하세요)</div>;
  }

  if (!isLoaded) {
    return <div>지도 로딩 중...</div>;
  }

  // 검색 결과 마커 아이콘 (파란 점)
  const SEARCH_MARKER_ICON = {
    url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    scaledSize: new window.google.maps.Size(32, 32),
  };

  // 일정 마커 아이콘 (기본 빨간 마커 - label과 함께 사용됨)
  const PLAN_MARKER_ICON = undefined;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={mapCenter} // 초기 센터
      zoom={12} // 초기 줌
      onLoad={onLoad}
      onUnmount={onUnmount}
      // 지도를 클릭하면 정보창 닫기
      onClick={() => setSelectedSearchPlace(null)}
      options={{
        // 불필요한 Google Maps UI 제거 (선택 사항)
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* 1. 일정 마커 (label이 있는 기본 마커) */}
      {plans.map((plan) => (
        <MarkerF
          key={`plan-${plan.planId}`}
          position={{
            lat: plan.place.latitude,
            lng: plan.place.longitude,
          }}
          title={plan.place.name} // 마커에 마우스 호버 시 장소 이름 표시
          label={{
            // 마커 위에 숫자(sequence) 표시
            text: `${plan.sequence}`,
            color: "white", // 숫자 색상
            fontWeight: "bold", // 폰트 굵기
          }}
          icon={PLAN_MARKER_ICON} // 기본 아이콘
          zIndex={10} // 일정 마커가 항상 위에 보이도록
        />
      ))}

      {/* 2. 검색 결과 마커 (파란 점 아이콘) */}
      {searchPlaces.map((place) => (
        <MarkerF
          key={`search-${place.placeId}`}
          position={{
            lat: place.latitude,
            lng: place.longitude,
          }}
          title={place.name}
          icon={SEARCH_MARKER_ICON}
          onClick={() => {
            // 마커 클릭 시 정보창 state 설정
            setSelectedSearchPlace(place);
          }}
          zIndex={5} // 검색 마커가 일정 마커보다 아래에 있도록
        />
      ))}

      {/* 3. 검색 마커 클릭 시 나타나는 정보창 */}
      {selectedSearchPlace && (
        <InfoWindowF
          position={{
            lat: selectedSearchPlace.latitude,
            lng: selectedSearchPlace.longitude,
          }}
          onCloseClick={() => setSelectedSearchPlace(null)}
          options={{ zIndex: 20 }} // 정보창이 항상 위에 오도록
        >
          <div className="p-1" style={{ color: "black" }}>
            <h4 className="font-bold text-base mb-1">
              {selectedSearchPlace.name}
            </h4>
            <p className="text-sm text-gray-600">
              {selectedSearchPlace.category}
            </p>
            <button
              onClick={() => {
                onAddPlace(selectedSearchPlace); // 일정 추가
                setSelectedSearchPlace(null); // 정보창 닫기
              }}
              className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded hover:bg-blue-600"
            >
              일정에 추가
            </button>
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
};

export default PlanMap;
