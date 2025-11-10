import React, { useEffect, useRef, useState, useCallback } from 'react';
// Google Maps API는 HTML <script> 태그를 통해 로드되므로, import는 불필요합니다.

// ⚠️ 참고: Google Maps API 키는 보안을 위해 실제 서비스 시 숨겨야 합니다.
const API_KEY = 'AIzaSyCCK-0KsNdjiidmUiJjwFHvIAuJZb6iS1g';
// MAP_ID는 AdvancedMarkerElement 사용을 위해 필요했으나, 사용하지 않기로 하여 제거했습니다.

// Polyline 경로를 그리는 메인 함수
const drawPolyline = (mapInstance, pathData) => {
    if (!window.google || !mapInstance || pathData.length < 2) return null;

    // Polyline에 사용할 위도/경도 배열 생성
    const tripPath = pathData.map(point => ({
        lat: point.lat,
        lng: point.lng
    }));

    // Polyline 객체 생성 및 지도에 표시
    const route = new window.google.maps.Polyline({
        path: tripPath,
        geodesic: true, // 곡선 경로를 사용 (지구 구면을 따라)
        strokeColor: '#FF4500', // 주황색 경로
        strokeOpacity: 0.8,
        strokeWeight: 4
    });

    route.setMap(mapInstance);
    return route;
};

// 마커를 표시하는 함수 (구형 google.maps.Marker로 롤백)
const drawMarkers = (mapInstance, pathData) => {
    // ⭐️ 구형 Marker 객체 존재 여부 확인
    if (!window.google || !mapInstance || !window.google.maps.Marker) return [];

    return pathData.map((point, index) => {
        const labelNumber = String(index + 1);

        // ⭐️ 구형 google.maps.Marker 사용
        return new window.google.maps.Marker({
            position: { lat: point.lat, lng: point.lng },
            map: mapInstance,
            title: `${labelNumber}. ${point.name}`,
            label: { // label 속성을 사용하여 숫자 레이블 표시
                text: labelNumber,
                color: 'white',
                fontWeight: 'bold',
            },
            optimized: true,
        });
    });
};

// ⭐️ 전역 콜백 함수: API 로드가 완료되면 이 함수가 호출됩니다.
// 컴포넌트 스코프 밖에서 정의되어 'initMapGlobally is not a function' 오류를 방지합니다.
// 이 함수는 setApiReady 상태 변경 함수를 실행합니다.
let setApiReadyGlobalFunc = null;

window.initMapGlobally = () => {
    if (setApiReadyGlobalFunc) {
        setApiReadyGlobalFunc(true);
        console.log("Google Maps API (Global Callback) 준비 완료.");
    }
};


function TravelPathViewer({ tripData }) { // ⭐️ tripData를 props로 받습니다.
    const mapContainerRef = useRef(null);
    const markersRef = useRef([]);
    const polylineRef = useRef(null);

    const [apiReady, setApiReady] = useState(false);
    const [mapInstance, setMapInstance] = useState(null);
    // ⭐️ 내부 tripData 상태 제거. props.tripData 사용

    // 지도를 초기화하는 함수 (API 준비가 완료되면 한 번만 호출됨)
    const initMap = useCallback(() => {
        // 경로 데이터가 없으면 지도 초기화를 건너뜁니다.
        if (!tripData || tripData.length === 0) {
            console.log("경로 데이터가 없어 지도 초기화를 건너뜁니다.");
            // 데이터가 없어도 지도는 표시해야 한다면, 초기 센터/줌 설정 (예: 서울)
            const mapOptions = {
                center: { lat: 37.5665, lng: 126.9780 },
                zoom: 7,
                disableDefaultUI: true,
                zoomControl: true,
            };
            const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
            setMapInstance(map);
            return;
        }

        if (mapContainerRef.current && window.google && window.google.maps.Map) {
            console.log("Google Maps 초기화 시작...");

            // ⭐️ tripData를 사용하여 중심 좌표 계산
            const centerLat = tripData.reduce((sum, p) => sum + p.lat, 0) / tripData.length;
            const centerLng = tripData.reduce((sum, p) => sum + p.lng, 0) / tripData.length;

            const mapOptions = {
                center: { lat: centerLat, lng: centerLng },
                zoom: 7,
                disableDefaultUI: true,
                zoomControl: true,
            };

            const map = new window.google.maps.Map(mapContainerRef.current, mapOptions);
            setMapInstance(map);
            console.log("Google Maps 초기화 성공!");

            setTimeout(() => {
                if (window.google && map) {
                    window.google.maps.event.trigger(map, 'resize');
                    map.setCenter({ lat: centerLat, lng: centerLng });
                }
            }, 100);
        }
    }, [tripData]); // tripData가 변경되면 initMap 함수가 다시 생성되도록 종속성 추가


    useEffect(() => {
        // ⭐️ 핵심 수정: 컴포넌트의 setApiReady 함수를 전역 변수에 연결
        setApiReadyGlobalFunc = setApiReady;

        // API 스크립트가 이미 로드되었는지 확인
        let scriptTag = document.querySelector(`script[src*="maps.googleapis.com"]`);

        // ⭐️ API 객체와 Map 생성자가 이미 존재하면, 콜백을 기다릴 필요 없이 즉시 준비 완료 처리
        if (window.google && window.google.maps && window.google.maps.Map) {
            setApiReady(true);
            return;
        }

        if (!scriptTag) {
            // 스크립트 태그가 없으면 생성
            const script = document.createElement('script');
            // ⭐️ callback=initMapGlobally를 사용
            script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=maps&loading=async&callback=initMapGlobally`;
            script.async = true;
            script.defer = true;

            document.head.appendChild(script);
            scriptTag = script;
        }

        // Cleanup 함수
        return () => {
            // 컴포넌트 언마운트 시 전역 Setter 함수 연결 해제
            setApiReadyGlobalFunc = null;
            // window.initMapGlobally는 외부에서 정의했으므로 삭제하지 않습니다.
        };

    }, [setApiReady]); // setApiReady는 React 훅에서 제공되므로 deps에 포함하는 것이 안전합니다.

    // 맵 로드가 완료되면 지도를 초기화
    useEffect(() => {
        if (apiReady) {
            // 이 시점에는 tripData의 초기값(빈 배열)이 전달될 수 있습니다.
            // initMap 내부에서 tripData.length를 체크합니다.
            initMap();
        }
    }, [apiReady, initMap]);


    // 지도 인스턴스가 생성되면 마커와 경로를 그립니다.
    useEffect(() => {
        const cleanupMapObjects = () => {
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
        };

        if (mapInstance) {
            cleanupMapObjects();

            // ⭐️ 데이터가 있을 때만 그립니다.
            if (tripData && tripData.length > 0) {

                // 1. 마커 그리기
                const newMarkers = drawMarkers(mapInstance, tripData);
                markersRef.current = newMarkers;

                // 2. Polyline 경로 그리기
                const newPolyline = drawPolyline(mapInstance, tripData);
                polylineRef.current = newPolyline;

                // 3. 지도의 뷰포트를 모든 마커를 포함하도록 조정
                const bounds = new window.google.maps.LatLngBounds();
                tripData.forEach(point => {
                    bounds.extend(new window.google.maps.LatLng(point.lat, point.lng));
                });

                mapInstance.fitBounds(bounds);
            }

            return cleanupMapObjects;
        }
    }, [mapInstance, tripData]); // ⭐️ tripData가 변경되면 지도를 다시 그리도록 합니다.


    // 지도 컨테이너 스타일
    const mapStyle = {
        width: '100%',
        height: 'calc(100vh - 100px)', // 상단 UI를 위해 100px 제외
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transition: 'height 0.3s'
    };


    return (
        <div className="p-4 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-4xl mx-auto">
                <header className="py-4 mb-4 text-center">
                    <h1 className="text-3xl font-bold text-blue-700">
                        🗺️ 여행 경로 시각화
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        위도/경도 기반 Polyline 표시 (Google Maps API 사용)
                    </p>
                </header>

                <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800">
                        여행지 목록 ({tripData.length}개소)
                    </h2>
                    <p className="text-sm text-gray-600">
                        경로가 순서대로 지도에 표시됩니다.
                    </p>
                </div>

                {/* ⭐️ 지도 컨테이너와 로딩 UI를 분리하여 React와 Google Maps 간의 DOM 충돌을 방지합니다. */}
                <div
                    style={mapStyle}
                    className="relative bg-gray-200 rounded-xl"
                >
                    {/* 1. 이 DIV는 Google Maps 인스턴스에만 사용됩니다. React 자식이 없어야 합니다. */}
                    <div
                        ref={mapContainerRef}
                        className="w-full h-full rounded-xl"
                    />

                    {/* 2. 로딩/초기화 피드백은 절대 위치 오버레이로 처리합니다. */}
                    {!mapInstance && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-200/90">
                            <p className="text-gray-700 text-xl font-semibold p-6 bg-white rounded-2xl shadow-2xl animate-pulse">
                                {!apiReady ? 'Google Maps API 로딩 중...' : '지도 인스턴스 초기화 중...'}
                            </p>
                        </div>
                    )}
                </div>


            </div>
        </div>
    );
}

export default TravelPathViewer;