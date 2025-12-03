import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
  PolylineF,
} from "@react-google-maps/api";
import { PlaceSearchResult, TravelPlan } from "../../util/types";

type Props = {
  plans: TravelPlan[]; // 현재 날짜에 해당하는 일정 목록
  searchPlaces: PlaceSearchResult[]; // 필터링된 "검색" 장소 목록
  onAddPlace: (place: PlaceSearchResult) => void; // 일정 추가 함수
  mapCenter: { lat: number; lng: number }; // 부모로부터 받을 맵 중심 좌표
  role: string;
};

// 지도가 표시될 컨테이너의 스타일
const containerStyle = {
  width: "100%",
  height: "100%",
};

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const PlanMap: React.FC<Props> = ({
  plans,
  searchPlaces,
  onAddPlace,
  mapCenter,
  role,
}) => {
  //  Google Maps 스크립트 로더 api 훅
  const isViewer = role === 'ROLE_VIEWER';
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: API_KEY || "",
  });

  // 지도 인스턴스를 저장하기 위한 state
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // 장소의 상세정보를 띄울 state (검색 결과나 일정에서 띄운다)
  const [selectedMarker, setSelectedMarker] = useState<{
    type: "search" | "plan";
    data: PlaceSearchResult | TravelPlan;
  } | null>(null);

  // 지도가 로드될 때 map 인스턴스를 state에 저장
  const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  // 컴포넌트가 언마운트될 때 map 인스턴스 정리
  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // 'plans'(일차)가 변경되면 마커들이 선으로 이어진 일정 전체가 보이도록 지도 범위 조정
  useEffect(() => {
    if (!map || plans.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    plans.forEach((plan) => {
      bounds.extend({
        lat: plan.place.latitude,
        lng: plan.place.longitude,
      });
    });

    // 계산된 경계로 지도를 이동
    map.fitBounds(bounds);

    // 만약 plan이 1개뿐이면 fitBounds가 너무 확대될 수 있으므로 수동으로 줌 레벨을 조절
    if (plans.length === 1) {
      map.setZoom(15);
    }
  }, [map, plans, mapCenter]);

  // 마커를 잇는 경로 데이터 생성
  const path = useMemo(() => {
    return [...plans]
      .sort((a, b) => a.sequence - b.sequence) // sequence 순으로 정렬
      .map((plan) => ({
        lat: plan.place.latitude,
        lng: plan.place.longitude,
      }));
  }, [plans]);

  // 경로 선 스타일 옵션
  const polylineOptions = {
    strokeColor: "#3B82F6", // 파란색 (Tailwind blue-500 색상)
    strokeOpacity: 0.8, // 투명도
    strokeWeight: 5, // 두께
    clickable: false, // 선 클릭 방지
    draggable: false, // 선 드래그 방지
    editable: false, // 선 편집 방지
    visible: true,
    zIndex: 1, // 마커보다 뒤에 오도록 설정 (마커가 zIndex 10임)
  };

  // 렌더링 로직
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
      zoom={15} // 초기 줌
      onLoad={onLoad}
      onUnmount={onUnmount}
      // 지도를 클릭하면 정보창 닫기
      onClick={() => setSelectedMarker(null)}
      options={{
        // 불필요한 Google Maps UI 비활성화
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {/* 경로 그리기 (일정이 2개 이상일 때만) */}
      {path.length > 1 && <PolylineF path={path} options={polylineOptions} />}

      {/* 1. 일정 마커 (빨간색 마커) */}
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
          onClick={() => setSelectedMarker({ type: "plan", data: plan })} // 저장된 일정을 클릭할 때도 상세 정보표시
        />
      ))}

      {/* 2. 검색 결과 마커 (파란색) */}
      {searchPlaces.map((place) => (
        <MarkerF
          key={`search-${place.placeId}`}
          position={{
            lat: place.latitude,
            lng: place.longitude,
          }}
          title={place.name}
          icon={SEARCH_MARKER_ICON}
          onClick={() =>
            // 마커 클릭 시 정보창 state 설정
            setSelectedMarker({ type: "search", data: place })
          }
          zIndex={5} // 검색 마커가 일정 마커보다 아래에 있도록
        />
      ))}

      {/* 3. 정보창 */}
      {selectedMarker && (
        <InfoWindowF
          position={{
            lat:
              selectedMarker.type === "plan"
                ? (selectedMarker.data as TravelPlan).place.latitude // 👈 'plan'일 때는 TravelPlan으로 단언하여 .place.latitude 접근
                : (selectedMarker.data as PlaceSearchResult).latitude, // 👈 'search'일 때는 PlaceSearchResult로 단언하여 .latitude 접근
            lng:
              selectedMarker.type === "plan"
                ? (selectedMarker.data as TravelPlan).place.longitude
                : (selectedMarker.data as PlaceSearchResult).longitude,
          }}
          onCloseClick={() => setSelectedMarker(null)}
          options={{ zIndex: 20 }}
        >
          <div
            className="p-2 min-w-[200px] max-w-[260px]"
            style={{ color: "black" }}
          >
            {/* 데이터 추출 */}
            {(() => {
              // data가 TravelPlan이면 place 속성을 쓰고, PlaceSearchResult면 그대로 씀
              const place =
                selectedMarker.type === "plan"
                // eslint-disable-next-line
                  ? (selectedMarker.data as {place: any}).place // 'place' 속성을 가진 타입으로 단언
                  : selectedMarker.data;

              return (
                <>
                  <h4 className="font-bold text-lg mb-1">{place.name}</h4>

                  <p className="text-sm text-gray-600 font-medium mb-1">
                    {place.type || place.category}{" "}
                    {/* DTO필드명이 다를 수 있어 둘 다 체크 */}
                  </p>


                  {/* 전화번호 */}
                  {place.phoneNumber && (
                    <p className="text-xs text-gray-500 mb-1">
                      📞 {place.phoneNumber}
                    </p>
                  )}

                  {/* 주소 */}
                  <p className="text-xs text-gray-400 mb-2">{place.address}</p>

                  {/* 영업 시간 */}
                  {place.openingHours && (
                    <div className="bg-gray-50 p-2 rounded text-xs text-gray-500 mb-2 max-h-32 overflow-y-auto whitespace-pre-wrap border">
                      {place.openingHours}
                    </div>
                  )}

                  {/* '일정에 추가' 버튼은 '검색 결과' 마커일 때만 표시 */}
                  {selectedMarker.type === "search" && !isViewer && (
                    <button
                      onClick={() => {
                        onAddPlace(place);
                        setSelectedMarker(null);
                      }}
                      className="w-full mt-1 px-3 py-2 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 transition-colors"
                    >
                      일정에 추가하기
                    </button>
                  )}
                  {selectedMarker.type === "plan" && (
                    (() => {
                      const planData = selectedMarker.data as TravelPlan;
                      return (
                        <p className="text-xs text-blue-600 font-bold text-center mt-1">
                          {planData.dayNumber}일차 -{" "}
                          {planData.sequence}번째 일정
                        </p>
                      );
                    })()
                  )}
                </>
              );
            })()}
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
};

export default PlanMap;
