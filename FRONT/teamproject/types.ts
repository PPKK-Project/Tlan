// 회원 가입
export type SignUpType = {
  email: string;
  password: string;
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
  googlePlaceId: string; // ⬅️ Google의 고유 ID (예: "ChIJ...")
  name: string;
  address: string;
  type: "숙소" | "관광지" | "음식점" | "all"; // ⬅️ category를 type으로 매핑
  latitude: number;
  longitude: number;

  // --- 일정 정보 ---
  dayNumber: number;
  sequence: number;
  memo: string | null;
};

/**
 * 왼쪽 사이드바 장소 검색 결과
 * (이것은 백엔드 DTO와 다름. Google Places API의 응답을 파싱한 형태)
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
};

export type Travel = {
  id: number; // travelId
  title: string;
  countryCode: string | null;
};

/**
 * 백엔드 CreateTravelRequest Record와 일치하는 타입
 * (참고: 백엔드의 CreateTravelRequest.java DTO엔 User 필드가 있어 수정이 필요해 보입니다)
 */
export type CreateTravelRequest = {
  title: string;
  // countryCode: string; // 백엔드 DTO가 수정되면 이 부분도 추후 추가
};
export type PlaceFilter = "all" | "숙소" | "관광지" | "음식점";
