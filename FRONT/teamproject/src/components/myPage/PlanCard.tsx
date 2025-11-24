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
      {/* 1. 이미지 영역 추가 */}
      <div className="plan-card-image-wrapper">
        <img
          // TODO: 나중에 실제 이미지 URL(plan.imageUrl)로 교체하세요.
          src={`https://images.unsplash.com/photo-1528543606781-2f6e6857f318?q=80&w=400`}
          alt={plan.title}
          className="plan-card-image"
        />
      </div>
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

      <div className="plan-card-actions">
        <button
          onClick={() => navigate(`/travels/${plan.id}/pdf`)}
          className="plan-card-button edit-button"
        >
          pdf 저장
        </button>
        <Link
          to={`/travels/${plan.id}`}
          className="plan-card-button edit-button"
        >
          수정
        </Link>
        <button
          className="plan-card-button delete-button"
          onClick={() => onDelete(plan.id)}
        >
          삭제
        </button>
        <button
          className="plan-card-button share-button"
          onClick={() => onShare(plan)}
        >
          공유
        </button>
      </div>
    </article>
  );
};

export default PlanCard;
