import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ShareModal from "./ShareModal";
import DeleteConfirmModal from "./DeleteConfirmModal"; // 새로 추가
import PlanCard from "./PlanCard";

export type TravelPlan = {
  id: number;
  title: string;
  countryCode: string; // API 응답에 따라 수정
  startDate: string;
  endDate: string;
};

const getTravelPlanList = async () => {
  const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/travels`);
  return response.data;
};

function TravelPlanList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [sharingPlan, setSharingPlan] = useState<TravelPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<TravelPlan | null>(null); // 삭제 확인 모달용 상태

  const { data, error, isLoading } = useQuery({
    queryKey: ["plans"], // 쿼리 키를 분리하여 캐시 충돌 방지
    queryFn: getTravelPlanList,
  });

  const deleteMutation = useMutation({
    mutationFn: (planId: number) => {
      return axios.delete(`${import.meta.env.VITE_BASE_URL}/travels/${planId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
    onError: (error) => {
      alert("삭제에 실패했습니다. 다시 시도해주세요." + error);
    },
  });

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
        { email, role }
      );
    },
    onSuccess: (_data, variables) => {
      alert(`'${variables.email}'님에게 플랜을 성공적으로 공유했습니다.`);
      setSharingPlan(null);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "공유 요청 중 오류가 발생했습니다.";
      console.error("공유 실패:", error);
      alert(message);
    },
  });

  if (isLoading) {
    return <span>Loading....</span>;
  }

  if (error) {
    return <span> 여행을 불러오는데 실패했습니다.😱</span>;
  }

  return (
    <div className="travel-plan-list-container">
      <div className="list-header-wrapper">
        <h2 className="list-header">나의 여행 계획</h2>
        <button
          className="add-plan-button"
          onClick={() => navigate("/create-travel")} // 새 플랜 생성 페이지로 이동
        >
          + 새 플랜 만들기
        </button>
      </div>
      {data && data.length === 0 ? (
        <p className="no-plans-message">아직 여행 계획이 없습니다.</p>
      ) : (
        <div className="plan-cards-grid">
          {data &&
            data.map((plan: TravelPlan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onDelete={() => setPlanToDelete(plan)} // 삭제 확인 모달 열기
                onShare={() => setSharingPlan(plan)}
              />
            ))}
        </div>
      )}
      {sharingPlan && (
        <ShareModal
          planTitle={sharingPlan.title}
          onClose={() => setSharingPlan(null)}
          onShare={(email, role) => {
            shareMutation.mutate({
              travelId: sharingPlan.id,
              email,
              role,
            });
          }}
        />
      )}
      {planToDelete && (
        <DeleteConfirmModal
          planTitle={planToDelete.title}
          onConfirm={() => {
            deleteMutation.mutate(planToDelete.id);
            setPlanToDelete(null); // 모달 닫기
          }}
          onCancel={() => setPlanToDelete(null)} // 모달 닫기
        />
      )}
    </div>
  );
}

export default TravelPlanList;
