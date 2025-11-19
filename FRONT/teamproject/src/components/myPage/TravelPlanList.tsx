import axios, { AxiosRequestConfig } from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ShareModal from "../../ShareModal";

type TravelPlan = {
  id: number;
  title: string;
  countryCode: string; // API 응답에 따라 수정
  startDate: string;
  endDate: string;
};

const getTravelPlanList = async () => {
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/travels`);
  console.log(response.data);
  return response.data;
};
function TravelPlanList() {
  // QueryClient 인스턴스를 가져옵니다.
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // 어떤 플랜을 공유할지 상태로 관리합니다. null이면 모달이 닫힌 상태입니다.
  const [sharingPlan, setSharingPlan] = useState<TravelPlan | null>(null);

  // 여행 목록을 가져오는 쿼리
  const { data, error, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: getTravelPlanList,
  });

  // 여행 계획을 삭제하는 뮤테이션(mutation) 정의
  const deleteMutation = useMutation({
    mutationFn: (planId: number) => {
      return axios.delete(`${import.meta.env.VITE_BASE_URL}/travels/${planId}`);
    },
    // 뮤테이션 성공 시
    onSuccess: () => {
      console.log("삭제 성공! 여행 목록을 다시 불러옵니다.");
      // 'plans' 쿼리를 무효화하여 데이터를 새로고침합니다.
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (error) => {
      console.error("삭제 실패:", error);
      alert("삭제에 실패했습니다. 다시 시도해주세요.");
    },
  });

  // 여행 계획을 공유하는 뮤테이션 정의
  const shareMutation = useMutation({
    mutationFn: ({
      travelId,
      email,
      role,
    }: {
      travelId: number;
      email: string;
      role: string;
    }) => {
      return axios.post(
        `${import.meta.env.VITE_BASE_URL}/travels/${travelId}/share`,
        { email, role } // API 명세에 따라 body 구성 (role 추가)
      );
    },
    onSuccess: (data, variables) => {
      alert(`'${variables.email}'님에게 플랜을 성공적으로 공유했습니다.`);
      setSharingPlan(null); // 성공 시 모달 닫기
    },
    onError: (error: any) => {
      // API 응답에 에러 메시지가 포함된 경우, 해당 메시지를 보여줍니다.
      const message =
        error.response?.data?.message || "공유 요청 중 오류가 발생했습니다.";
      console.error("공유 실패:", error);
      alert(message);
      console.log(data);
    },
  });

  if (isLoading) {
    return <span>Loading....</span>;
  }

  if (error) {
    return <span> 마이페이지를 불러오는데 실패했습니다.😱</span>;
  } else {
    return (
      <div className="travel-plan-list-container">
        <h2 className="list-header">나의 여행 계획</h2>
        {data.length === 0 ? (
          <p className="no-plans-message">
            아직 계획된 여행이 없습니다. 새로운 여행을 계획해보세요!
          </p>
        ) : (
          <div className="plan-cards-grid">
            {data.map((plan) => (
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
                <Link
                  to={`/travels/${plan.id}`}
                  className="plan-card-link-area"
                >
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
                    onClick={() => deleteMutation.mutate(plan.id)}
                  >
                    삭제
                  </button>
                  <button
                    className="plan-card-button share-button"
                    onClick={() => setSharingPlan(plan)}
                  >
                    공유
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
        {/* sharingPlan 상태가 있을 때만 ShareModal을 렌더링합니다. */}
        {sharingPlan && (
          <ShareModal
            planTitle={sharingPlan.title}
            onClose={() => setSharingPlan(null)}
            onShare={(email, role) => {
              // 뮤테이션을 실행하여 공유 API를 호출합니다.
              shareMutation.mutate({
                travelId: sharingPlan.id,
                email,
                role,
              });
            }}
          />
        )}
      </div>
    );
  }
}
export default TravelPlanList;
