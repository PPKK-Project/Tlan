import axios from "axios";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ShareModal from "./ShareModal";
import PlanCard from "./PlanCard";
import { TravelPlan } from "./TravelPlanList";

const getSharedPlanList = async (): Promise<TravelPlan[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}/travels/share`
  );
  return response.data;
};

function SharedPlanList() {
  const queryClient = useQueryClient();
  const [sharingPlan, setSharingPlan] = useState<TravelPlan | null>(null);

  const { data, error, isLoading } = useQuery({
    queryKey: ["sharedPlans"], // 쿼리 키를 분리하여 캐시 충돌 방지
    queryFn: getSharedPlanList,
  });

  const deleteMutation = useMutation({
    mutationFn: (planId: number) => {
      // 로직 수정해야함
      return axios.delete(`${import.meta.env.VITE_BASE_URL}/travels/${planId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sharedPlans"] });
    },
    onError: (error) => {
      alert("삭제에 실패했습니다. 다시 시도해주세요. : "+error);
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
    return <span> 친구에게 초대받은 여행을 불러오는데 실패했습니다.😱</span>;
  }

  return (
    <div className="travel-plan-list-container">
      <h2 className="list-header">친구에게 초대받은 여행</h2>
      {data && data.length === 0 ? (
        <p className="no-plans-message">아직 초대받은 여행 계획이 없습니다.</p>
      ) : (
        <div className="plan-cards-grid">
          {data &&
            data.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onDelete={() => deleteMutation.mutate(plan.id)}
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
    </div>
  );
}
export default SharedPlanList;
