// src/pages/TravelPlanPdf.tsx (경로는 네 구조에 맞게)

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// 한글 폰트 등록
Font.register({
  family: "NotoSansKR",
  fonts: [
    {
      src: "/fonts/NotoSansKR-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "/fonts/NotoSansKR-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});

type PlaceResponse = {
  name: string;
  address: string;
  type: string;
};

export type TravelPlanForPdf = {
  planId: number;
  dayNumber: number;
  sequence: number;
  memo: string;
  place: PlaceResponse;
};

type Props = {
  plans: TravelPlanForPdf[];
  title?: string;
};

// ====== PDF 전용 스타일 ======
const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 32,
    fontSize: 10,
    lineHeight: 1.4,
    fontFamily: "NotoSansKR",
  },
  header: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSub: {
    fontSize: 10,
    color: "#555555",
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 6,
    marginTop: 4,
  },
  dayBlock: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 6,
    marginBottom: 8,
    overflow: "hidden",
  },
  dayHeader: {
    flexDirection: "row",
    backgroundColor: "#e0f2ff",
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayHeaderText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#cfe9ff",
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  thTime: {
    width: 70,
    fontSize: 9,
    fontWeight: "bold",
  },
  thActivity: {
    flex: 1,
    fontSize: 9,
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#eeeeee",
  },
  // ✅ 새로 추가
  cellTimeCol: {
    width: 70,
    fontSize: 9,
    color: "#6b7280",
    flexDirection: "column",
    justifyContent: "flex-start",
  },
  orderText: {
    marginBottom: 2,
  },

  cellActivity: {
    flex: 1,
  },

  placeName: {
    fontSize: 10,
    fontWeight: "bold",
  },
  placeAddress: {
    fontSize: 9,
    color: "#666666",
  },
  memo: {
    fontSize: 9,
    color: "#444444",
  },

  // ✅ 뱃지를 “글자 길이만큼” 예쁘게
  typeBadge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    alignSelf: "flex-start", // 왼쪽 정렬
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    fontSize: 8,
    bottom: 20,
    left: 32,
    right: 32,
    textAlign: "center",
    color: "#888888",
  },
});

const TravelPlanPdf: React.FC<Props> = ({ plans, title = "여행 계획" }) => {
  // Day 번호 모아서 정렬
  const dayNumbers = Array.from(new Set(plans.map((p) => p.dayNumber))).sort(
    (a, b) => a - b
  );

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>

        {/* Day별 일정 */}
        {dayNumbers.map((dayNumber) => {
          const dayPlans = plans
            .filter((p) => p.dayNumber === dayNumber)
            .sort((a, b) => a.sequence - b.sequence);

          return (
            <View key={dayNumber} style={styles.dayBlock} wrap={false}>
              {/* Day 헤더 */}
              <View style={styles.dayHeader}>
                <Text style={styles.dayHeaderText}>
                  Day {String(dayNumber).padStart(2, "0")}
                </Text>
                <Text style={styles.dayHeaderText}>
                  {dayPlans.length}개의 일정
                </Text>
              </View>

              {/* Time / Activity 헤더 */}
              <View style={styles.tableHeader}>
                <Text style={styles.thTime}>순서</Text>
                <Text style={styles.thActivity}>Activity</Text>
              </View>

              {/* 각 일정 행 */}
              {dayPlans.map((plan) => (
                <View key={plan.planId} style={styles.row}>
                  {/* 왼쪽: 순서 + 타입 뱃지 */}
                  <View style={styles.cellTimeCol}>
                    <Text style={styles.orderText}>{plan.sequence}번째</Text>
                    <Text style={styles.typeBadge}>{plan.place.type}</Text>
                  </View>

                  {/* 오른쪽: 이름 / 주소 / 메모 */}
                  <View style={styles.cellActivity}>
                    <Text style={styles.placeName}>{plan.place.name}</Text>
                    <Text style={styles.placeAddress}>
                      {plan.place.address}
                    </Text>
                    {plan.memo && plan.memo.trim().length > 0 && (
                      <Text style={styles.memo}>메모: {plan.memo}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {/* 페이지 번호 */}
        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default TravelPlanPdf;
