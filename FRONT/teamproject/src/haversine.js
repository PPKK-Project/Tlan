function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반지름 (단위: km)
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}
// 테스트용 서울 부산 위도 경도 추가
const seoulLat = 37.5665;
const seoulLon = 126.9780;
const busanLat = 35.1796;
const busanLon = 129.0756;

const distance = getDistance(seoulLat, seoulLon, busanLat, busanLon);
console.log(`서울에서 부산까지의 거리 : ${Math.round(distance)}`);