// src/components/pdfPages/TravelPlanPdf.tsx

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
      fontWeight: 400, // normal
    },
    {
      src: "/fonts/NotoSansKR-Bold.ttf",
      fontWeight: 700, // bold
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
  dateRange?: string; // "2025-11-20 ~ 2025-12-05"
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

  // 상단 제목 영역
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 15, // 제목과 날짜 사이 간격
  },
  headerSub: {
    fontSize: 10,
    color: "#555555",
    textAlign: "center",
  },

  // Day 블록 (원래 카드 스타일)
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
    fontWeight: 700,
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
    fontWeight: 700,
  },
  thActivity: {
    flex: 1,
    fontSize: 9,
    fontWeight: 700,
  },

  row: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#eeeeee",
  },
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
    fontWeight: 400,
  },
  placeAddress: {
    fontSize: 9,
    color: "#666666",
  },
  memo: {
    fontSize: 9,
    color: "#444444",
  },

  typeBadge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    alignSelf: "flex-start",
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

const TravelPlanPdf: React.FC<Props> = ({
  plans,
  title = "여행 계획",
  dateRange,
}) => {
  // Day 번호 범위를 1 ~ 최대 Day 까지로 잡기
  const maxDayNumber = Math.max(...plans.map((p) => p.dayNumber));
  const dayNumbers = Array.from({ length: maxDayNumber }, (_, i) => i + 1);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          {dateRange ? (
            <Text style={styles.headerSub}>{dateRange}</Text>
          ) : null}
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
                  {`Day ${String(dayNumber).padStart(2, "0")}`}
                </Text>
                <Text style={styles.dayHeaderText}>
                  {`${dayPlans.length}개의 일정`}
                </Text>
              </View>

              {/* Time / Activity 헤더 */}
              <View style={styles.tableHeader}>
                <Text style={styles.thTime}>순서</Text>
                <Text style={styles.thActivity}>Activity</Text>
              </View>

              {/* 각 일정 행 / 또는 비어 있을 때 메시지 */}
              {dayPlans.length === 0 ? (
                <View style={styles.row}>
                  <View style={styles.cellTimeCol}>
                    <Text style={styles.orderText}>-</Text>
                  </View>
                  <View style={styles.cellActivity}>
                    <Text style={styles.placeName}>
                      아직 일정이 정해지지 않았습니다.
                    </Text>
                  </View>
                </View>
              ) : (
                dayPlans.map((plan) => (
                  <View key={plan.planId} style={styles.row}>
                    {/* 왼쪽: 순서 + 타입 뱃지 */}
                    <View style={styles.cellTimeCol}>
                      <Text style={styles.orderText}>
                        {`${plan.sequence}번째`}
                      </Text>
                      <Text style={styles.typeBadge}>{plan.place.type}</Text>
                    </View>

                    {/* 오른쪽: 이름 / 주소 / 메모 */}
                    <View style={styles.cellActivity}>
                      <Text style={styles.placeName}>
                        {plan.place.name}
                      </Text>
                      <Text style={styles.placeAddress}>
                        {plan.place.address}
                      </Text>
                      {plan.memo && plan.memo.trim().length > 0 ? (
                        <Text style={styles.memo}>
                          {`메모: ${plan.memo}`}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))
              )}
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
