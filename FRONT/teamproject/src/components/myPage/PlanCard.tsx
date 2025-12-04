import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { TravelPlan } from "./TravelPlanList";

type PlanCardProps = {
  plan: TravelPlan;
  onDelete?: (planId: number) => void;
  onShare?: (plan: TravelPlan) => void;
  share: boolean;
};

const PlanCard: React.FC<PlanCardProps> = ({ plan, onDelete, onShare, share }) => {
  const navigate = useNavigate();

  const getDdayInfo = () => {
    const today = new Date();
    const startDate = new Date(plan.startDate);
    const endDate = new Date(plan.endDate);

    // 시간, 분, 초를 0으로 설정하여 날짜만 비교
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (today > endDate) {
      return {
        text: "여행 종료",
        className: "bg-gray-500 text-white",
        isEnded: true,
      };
    }
    if (today >= startDate && today <= endDate) {
      return {
        text: "여행 중",
        className: "bg-green-500 text-white",
        isEnded: false,
      };
    }

    const diffTime = startDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return {
        text: "D-DAY",
        className: "bg-red-500 text-white",
        isEnded: false,
      };
    }

    return {
      text: `D-${diffDays}`,
      className: "bg-blue-500 text-white",
      isEnded: false,
    };
  };

  const dDay = getDdayInfo();

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (dDay.isEnded) {
      e.preventDefault(); // 링크 이동을 막음
    }
  };

  return (
    <article
      key={plan.id}
      className={`relative flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
        dDay.isEnded ? "grayscale" : ""
      }`}
    >
      <span
        className={`absolute top-4 right-4 text-xs font-bold px-2.5 py-1 rounded-full z-10 ${dDay.className}`}
      >
        {dDay.text}
      </span>
      <Link
        to={`/travels/${plan.id}/pdf`}
        onClick={handleCardClick}
        className={`flex-grow p-5 flex flex-col justify-between ${
          dDay.isEnded ? "cursor-default" : ""
        }`}
      >
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 truncate pr-16">
            {plan.title}
          </h3>
          <p className="text-sm font-semibold text-blue-500 mt-1">
            {plan.countryCode}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-auto">
          {plan.startDate} ~ {plan.endDate}
        </p>
      </Link>

      {/* 수정, 삭제, 공유 버튼 영역 - onDelete, onShare가 있을 때만 렌더링 */}
      {onDelete && onShare && (
        <div className="border-t border-gray-100 p-3 flex justify-end gap-2">
          <button
            onClick={() => navigate(`/travels/${plan.id}/pdf`)}
            className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
            title="PDF로 저장"
          >
            PDF
          </button>
          {dDay.text === "여행 중" || dDay.text === "여행 종료" ? (
            ""
          ) : (
            <button
              onClick={() => navigate(`/travels/${plan.id}`)}
              className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              title="수정하기"
            >
              수정
            </button>
          )}
          <button
            className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
            onClick={() => onDelete(plan.id)}
            title="삭제하기"
          >
            삭제
          </button>
          {share ? "" : dDay.text === "여행 종료" ? "":<button
            className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
            onClick={() => onShare(plan)}
            title="공유하기"
          >
            공유
          </button>}
        </div>
      )}
    </article>
  );
};
export default PlanCard;
