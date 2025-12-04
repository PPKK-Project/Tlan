import axios from "axios";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ShareModal from "./ShareModal";
import PlanCard from "./PlanCard";
import DeleteConfirmModal from "./DeleteConfirmModal"; // 새로 추가
import { TravelPlan } from "./TravelPlanList";
import { AxiosErrorType } from "../../util/types";

const getSharedPlanList = async (): Promise<TravelPlan[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}/travels/share`
  );
  return response.data;
};

function SharedPlanList() {
  const queryClient = useQueryClient();
  const [sharingPlan, setSharingPlan] = useState<TravelPlan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<TravelPlan | null>(null); // 삭제 확인 모달용 상태

  const { data, error, isLoading } = useQuery({
    queryKey: ["sharedPlans"], // 쿼리 키를 분리하여 캐시 충돌 방지
    queryFn: getSharedPlanList,
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (travelId: number) => {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/travels/${travelId}/share`);
      const userResponse = await axios.get(`${import.meta.env.VITE_BASE_URL}/users/nickname`)
      const user = response.data.find((list: { userId: number; }) => list.userId === userResponse.data.userId);
      return axios.delete(`${import.meta.env.VITE_BASE_URL}/travels/${travelId}/share/${user.permissionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sharedPlans"] });
      queryClient.invalidateQueries({ queryKey: ["myChatPlans"] });
      queryClient.invalidateQueries({ queryKey: ["invitedChatPlans"] });
    },
    onError: (error) => {
      alert("삭제에 실패했습니다. 다시 시도해주세요. : " + error);
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
    onError: (error: AxiosErrorType) => {
      alert(error.response.data.message || "공유 요청 중 오류가 발생했습니다.");
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
      <div
        className="list-header-wrapper"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 className="list-header">친구에게 초대받은 여행</h2>
      </div>
      {data && data.length === 0 ? (
        <p className="no-plans-message">아직 초대받은 여행 계획이 없습니다.</p>
      ) : (
        <div className="plan-cards-grid">
          {data &&
            data.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onDelete={() => setPlanToDelete(plan)} // 삭제 확인 모달 열기
                onShare={() => setSharingPlan(plan)}
                share={true}
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
export default SharedPlanList;
