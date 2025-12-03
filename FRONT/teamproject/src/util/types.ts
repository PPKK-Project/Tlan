// 회원 가입
export type SignUpType = {
  email: string;
  password: string;
  passwordCheck: string;
  nickname: string;
};
/**
 * 백엔드 PlaceResponse Record와 일치하는 타입
 */
export type PlaceResponse = {
  placeId: number;
  googlePlaceId: string;
  name: string;
  address: string;
  type: string; // (e.g., "숙소", "관광지", "음식점")
  latitude: number;
  longitude: number;
  phoneNumber?: string; // null일 수 있으므로 optional(?) 처리
  openNow?: boolean;
  openingHours?: string;
};

/**
 * 백엔드 TravelPlanResponse Record와 일치하는 타입
 */
export type TravelPlan = {
  planId: number;
  dayNumber: number;
  sequence: number;
  memo: string | null;
  place: PlaceResponse;
};

/**
 * 백엔드 AddPlanRequest Record와 일치하는 타입
 */
export type AddPlanRequest = {
  // --- 장소 정보 ---
  googlePlaceId: string; // Google의 고유 ID (예: "ChIJ...")
  name: string;
  address: string;
  type: "숙소" | "관광지" | "음식점" | "all"; // category를 type으로 매핑
  latitude: number;
  longitude: number;

  // --- 일정 정보 ---
  dayNumber: number;
  sequence: number;
  memo: string | null;
};

/**
 * 왼쪽 사이드바 장소 검색 결과
 * (Google Places API 응답 파싱용)
 */
export type PlaceSearchResult = {
  placeId: string;
  name: string;
  address: string;
  category: "숙소" | "관광지" | "음식점";
  rating: number;
  reviewCount: number;
  imageUrl: string;
  price?: number;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  openNow?: boolean;
  openingHours?: string;
};

/**
 * 여행 정보 (조회용)
 */
export type Travel = {
  id: number; // travelId
  title: string;
  countryCode: string | null;
  startDate: string | null;
  endDate: string | null;
  travelerCount: number;
  departure: string;
  destinationCity?: string;
};

/**
 * 여행 생성 요청 DTO
 * 백엔드 CreateTravelRequest Record와 일치
 */
export type CreateTravelRequest = {
  title: string;
  startDate: string | null;
  endDate: string | null;
  countryCode?: string;
  travelerCount: number;
  departure: string;
  destinationCity?: string;
};

/**
 * 여행 수정 요청 DTO
 * 백엔드 UpdateTravelRequest Record와 일치
 */
export type UpdateTravelRequest = {
  title?: string;
  startDate?: string | null;
  endDate?: string | null;
};

export type PlaceFilter = "all" | "숙소" | "관광지" | "음식점";

export type Airport = {
  code: string;
  name: string;
  country: string;
  city: string;
};


export type AxiosErrorType = {
  response: {
    data: {
      message: string
    }
  }
}