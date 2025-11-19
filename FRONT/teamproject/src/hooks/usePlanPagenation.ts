import { useState, useEffect, useRef } from "react";

/**
 * 일정 페이지네이션(5일씩 끊어서 보여주기)을 관리하는 커스텀 훅
 * @param days 전체 일차 배열
 * @param selectedDay 현재 선택된 일차
 * @param itemsPerPage 한 탭에 보여줄 총 일차 (5일로 설정해둠)
 */
export const usePlanPagination = (
  days: number[],
  selectedDay: number,
  itemsPerPage: number = 5
) => {
  const [startIndex, setStartIndex] = useState(0);
  // 이전 selectedDay를 추적하기 위한 ref
  const prevSelectedDay = useRef(selectedDay);

  useEffect(() => {
    if (prevSelectedDay.current !== selectedDay) {
      if (days.length > 0) { // 날짜 정보가 누락될 경우를 대비한 방어 로직 조건문

        // 시작 인덱스 계산
        const newStartIndex =
          Math.floor((selectedDay - 1) / itemsPerPage) * itemsPerPage;

        if (newStartIndex !== startIndex) {
          setStartIndex(newStartIndex);
        }
      }
      prevSelectedDay.current = selectedDay;
    }
  }, [selectedDay, days, startIndex, itemsPerPage]);

  // 일정을 5일씩 보여주기 위해 총 일정 잘라내기
  const visibleDays = days.slice(startIndex, startIndex + itemsPerPage);

  // 이전(-) / 다음(+) 버튼 활성화 여부
  const hasPrev = startIndex > 0
  const hasNext = startIndex + itemsPerPage < days.length;

  // 이전 페이지로
  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - itemsPerPage));
  };

  // 다음 페이지로
  const handleNext = () => {
    setStartIndex((prev) => Math.min(days.length - 1, prev + itemsPerPage));
  };

  return {
    visibleDays,
    hasPrev,
    hasNext,
    handlePrev,
    handleNext,
  };
};
