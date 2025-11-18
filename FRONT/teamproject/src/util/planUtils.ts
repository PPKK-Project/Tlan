import { AxiosRequestConfig } from "axios";

export const API_BASE_URL = import.meta.env.VITE_BASE_URL;
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  /**
   * signin.tsx의 로직을 기반으로 인증 헤더를 포함하는 Axios 설정을 반환합니다.
   */
export const getAxiosConfig = (): AxiosRequestConfig => {
    const jwtToken = localStorage.getItem("jwt");
    // 'Bearer ' 접두사가 토큰 값에 이미 포함되어 있는지 확인 필요
    const token = jwtToken ? jwtToken.replace("Bearer ", "") : ""; // 순수 토큰만 추출

    return {
      headers: {
        // signin.tsx의 getAxiosConfig와 동일하게 맞춤
        Authorization: token || "", // 토큰이 없으면 빈 문자열
        "Content-Type": "application/json",
      },
    };
  };


// Google Places API의 types 배열을 보고 카테고리를 추론합니다.
export const getCategoryFromTypes = (
  types: string[]
): "숙소" | "관광지" | "음식점" => {
  if (types.includes("lodging")) return "숙소";
  if (types.includes("tourist_attraction")) return "관광지";
  if (types.includes("restaurant") || types.includes("food")) return "음식점";
  return "관광지"; // 기본값
};


// 헬퍼 함수: Google Places API의 photos 배열로 이미지 URL을 생성합니다.
export const getPhotoUrl = (photos: any[]): string => {
  if (photos && photos.length > 0) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`;
  }
  // 이미지가 없을 때 기본 이미지
  return "https://placehold.co/100x100/cccccc/ffffff?text=No+Image";
};
