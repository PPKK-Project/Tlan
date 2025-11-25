import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { TravelPlan } from "./TravelPlanList";

type PlanCardProps = {
  plan: TravelPlan;
  onDelete: (planId: number) => void;
  onShare: (plan: TravelPlan) => void;
};

const PlanCard: React.FC<PlanCardProps> = ({ plan, onDelete, onShare }) => {
  const navigate = useNavigate();

  return (
    <article key={plan.id} className="travel-plan-card">
      {/* 상세 페이지로 이동하는 링크 영역 */}
      <Link to={`/travels/${plan.id}`} className="plan-card-link-area">
        <div className="plan-card-content">
          <h3 className="plan-card-title">{plan.title}</h3>
          <p className="plan-card-destination">{plan.countryCode}</p>
          <p className="plan-card-dates">
            {plan.startDate} ~ {plan.endDate}
          </p>
        </div>
      </Link>
      {/* 수정, 삭제, 공유 버튼 영역 */}

      {/* 아이콘 버튼으로 변경하여 디자인 개선 */}
      <div className="plan-card-actions">
        <button
          onClick={() => navigate(`/travels/${plan.id}/pdf`)}
          className="plan-card-button icon-button"
          title="PDF로 저장"
        >
          PDF
        </button>
        <button
          onClick={() => navigate(`/travels/${plan.id}`)}
          className="plan-card-button icon-button"
          title="수정하기"
        >
          수정
        </button>
        <button
          className="plan-card-button icon-button"
          onClick={() => onDelete(plan.id)}
          title="삭제하기"
        >
          삭제
        </button>
        <button
          className="plan-card-button icon-button"
          onClick={() => onShare(plan)}
          title="공유하기"
        >
          공유
        </button>
      </div>
    </article>
  );
};

export default PlanCard;
