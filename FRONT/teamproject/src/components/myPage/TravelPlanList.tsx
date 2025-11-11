import axios, { AxiosRequestConfig } from "axios";
import React from "react";
import { useQuery } from "@tanstack/react-query";

type TravelPlan = {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: "planned" | "ongoing" | "completed";
};

const getAxiosConfig = (): AxiosRequestConfig => {
  const token = sessionStorage.getItem("jwt")?.replace("Bearer ", "");
  return {
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
  };
};

const getTravelPlanList = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}/travels`,
    getAxiosConfig()
  );
  console.log(response.data);
  return response.data;
};
function TravelPlanList() {
  const { data, error, isSuccess } = useQuery({
    queryKey: ["plans"],
    queryFn: getTravelPlanList,
  });

  if (!isSuccess) {
    return <span>Loading....</span>;
  }

  if (error) {
    return <span>자동차들을 불러오는 데 실패했습니다. 😱</span>;
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
              <div key={plan.id} className="travel-plan-card">
                <div className="plan-card-content">
                  <h3 className="plan-card-title">{plan.title}</h3>
                  <p className="plan-card-destination">{plan.countryCode}</p>
                  <p className="plan-card-dates">
                    {plan.startDate} ~ {plan.endDate}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}
export default TravelPlanList;
