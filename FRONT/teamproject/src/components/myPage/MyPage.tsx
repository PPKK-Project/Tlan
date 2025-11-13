import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TravelPlanList from "./TravelPlanList";
import MyPageHeader from "./MyPageHeader";
import TopDestinationsBanner from "./TopDestinationsBanner";

const queryClient = new QueryClient();

function MyPage() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* 배경 레이어 */}
      <div className="mypage-background"></div>
      {/* 콘텐츠 레이어 */}
      <div className="mypage-content-wrapper">
        <MyPageHeader />
        <TopDestinationsBanner />
        <TravelPlanList />
      </div>
    </QueryClientProvider>
  );
}
export default MyPage;
