import axios from 'axios';
import React from 'react';

type TravelPlan = {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'ongoing' | 'completed';
}

const getTravelPlanList = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_BASE_URL}/travels/1/plans`,
    
  );
  console.log(response.data)
  return response.data
}
function TravelPlanList(){

  getTravelPlanList();

  return(
  <div className="travel-plan-list-container">
      <h2 className="list-header">나의 여행 계획</h2>
      {getTravelPlanList.length === 0 ? (
        <p className="no-plans-message">아직 계획된 여행이 없습니다. 새로운 여행을 계획해보세요!</p>
      ) : (
        <div className="plan-cards-grid">
          {getTravelPlanList.map((plan) => (
            <div key={plan.id} className="travel-plan-card">
              <div className="plan-card-content">
                <h3 className="plan-card-title">{plan.title}</h3>
                <p className="plan-card-destination">{plan.destination}</p>
                <p className="plan-card-dates">{plan.startDate} ~ {plan.endDate}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>  
    )
}
export default TravelPlanList;